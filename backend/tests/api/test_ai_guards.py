"""Tests for the AI cost/capacity guards — the site-wide daily token budget and
the per-worker concurrency cap (issues #179 / #181).

The budget bounds total daily LLM *tokens* (the rate limiter only bounds request
counts); the concurrency cap stops a burst of parallel chats from pinning every
worker on slow LLM calls. Redis and the LLM are mocked throughout.
"""
from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException

from app.api import ai


class FakeRedis:
    """In-memory async stand-in covering the rate-limit AND budget commands."""

    def __init__(self, store=None):
        self.store = dict(store or {})
        self.expire_calls = []

    async def get(self, key):
        value = self.store.get(key)
        return None if value is None else str(value).encode()

    async def incr(self, key):
        self.store[key] = int(self.store.get(key, 0)) + 1
        return self.store[key]

    async def incrby(self, key, amount):
        self.store[key] = int(self.store.get(key, 0)) + amount
        return self.store[key]

    async def expire(self, key, ttl):
        self.expire_calls.append((key, ttl))
        return True


class BrokenRedis:
    """Every command fails — simulates Redis being down."""

    def __getattr__(self, name):
        async def boom(*args, **kwargs):
            raise RuntimeError("redis down")

        return boom


@pytest.fixture
def fake_redis(monkeypatch):
    fake = FakeRedis()
    monkeypatch.setattr(ai, "_get_redis", lambda: fake)
    return fake


@pytest.fixture(autouse=True)
def _reset_slots(monkeypatch):
    """Each test starts with an idle concurrency counter."""
    monkeypatch.setattr(ai, "_active_llm_calls", 0)


class TestDailyBudget:
    async def test_blocks_when_budget_exhausted(self, fake_redis, monkeypatch):
        monkeypatch.setattr(ai.settings, "AI_DAILY_TOKEN_BUDGET", 1000)
        fake_redis.store[ai._budget_key()] = 1000

        with pytest.raises(HTTPException) as exc:
            await ai._enforce_budget()
        assert exc.value.status_code == 429
        assert "usage limit" in exc.value.detail

    async def test_allows_under_budget(self, fake_redis, monkeypatch):
        monkeypatch.setattr(ai.settings, "AI_DAILY_TOKEN_BUDGET", 1000)
        fake_redis.store[ai._budget_key()] = 999
        await ai._enforce_budget()  # must not raise

    async def test_nonpositive_budget_disables_the_cap(self, monkeypatch):
        monkeypatch.setattr(ai.settings, "AI_DAILY_TOKEN_BUDGET", 0)
        # Short-circuits before touching Redis — a broken Redis proves it.
        monkeypatch.setattr(ai, "_get_redis", lambda: BrokenRedis())
        await ai._enforce_budget()

    async def test_fails_open_when_redis_is_down(self, monkeypatch):
        monkeypatch.setattr(ai.settings, "AI_DAILY_TOKEN_BUDGET", 1000)
        monkeypatch.setattr(ai, "_get_redis", lambda: BrokenRedis())
        # The demo stays up if Redis is unavailable; rate limits still apply.
        await ai._enforce_budget()

    async def test_record_accumulates_and_sets_ttl_once(self, fake_redis, monkeypatch):
        monkeypatch.setattr(ai.settings, "AI_DAILY_TOKEN_BUDGET", 10_000)

        await ai._record_tokens(100)
        await ai._record_tokens(50)

        assert fake_redis.store[ai._budget_key()] == 150
        # TTL is set only on the day's first write.
        assert len(fake_redis.expire_calls) == 1

    async def test_record_skips_zero_and_disabled(self, fake_redis, monkeypatch):
        monkeypatch.setattr(ai.settings, "AI_DAILY_TOKEN_BUDGET", 10_000)
        await ai._record_tokens(0)
        monkeypatch.setattr(ai.settings, "AI_DAILY_TOKEN_BUDGET", 0)
        await ai._record_tokens(500)
        assert ai._budget_key() not in fake_redis.store

    async def test_record_never_fails_the_request(self, monkeypatch):
        monkeypatch.setattr(ai.settings, "AI_DAILY_TOKEN_BUDGET", 10_000)
        monkeypatch.setattr(ai, "_get_redis", lambda: BrokenRedis())
        await ai._record_tokens(100)  # swallowed, logged


class TestConcurrencyCap:
    def test_rejects_when_all_slots_busy(self, monkeypatch):
        monkeypatch.setattr(ai.settings, "AI_MAX_CONCURRENT_REQUESTS", 1)

        ai._acquire_llm_slot()  # takes the only slot
        with pytest.raises(HTTPException) as exc:
            ai._acquire_llm_slot()
        assert exc.value.status_code == 429

        ai._release_llm_slot()
        ai._acquire_llm_slot()  # free again after release

    def test_release_never_goes_negative(self, monkeypatch):
        monkeypatch.setattr(ai.settings, "AI_MAX_CONCURRENT_REQUESTS", 1)
        ai._release_llm_slot()  # spurious release must not open extra capacity
        ai._acquire_llm_slot()
        with pytest.raises(HTTPException):
            ai._acquire_llm_slot()


class TestEndpointIntegration:
    """The guards wired into the real endpoints (LLM mocked)."""

    def test_chat_returns_429_when_budget_exhausted(self, client, fake_redis, monkeypatch):
        monkeypatch.setattr(ai.settings, "AI_DAILY_TOKEN_BUDGET", 1000)
        fake_redis.store[ai._budget_key()] = 1000

        r = client.post("/api/v1/ai/chat", json={"question": "hi"})
        assert r.status_code == 429
        # The app's error middleware wraps HTTPException as {"error": {"message": ...}}.
        assert "usage limit" in r.json()["error"]["message"]

    def test_chat_records_usage_after_answering(self, client, fake_redis, monkeypatch):
        monkeypatch.setattr(ai.settings, "AI_DAILY_TOKEN_BUDGET", 10_000)
        monkeypatch.setattr(
            ai.rag_service,
            "answer",
            AsyncMock(
                return_value={
                    "answer": "hi",
                    "sources": [],
                    "model": "llama3.2",
                    "tokens_used": 123,
                }
            ),
        )

        r = client.post("/api/v1/ai/chat", json={"question": "hi"})
        assert r.status_code == 200
        assert fake_redis.store[ai._budget_key()] == 123

    def test_stream_records_usage_from_done_event(self, client, fake_redis, monkeypatch):
        monkeypatch.setattr(ai.settings, "AI_DAILY_TOKEN_BUDGET", 10_000)

        async def fake_stream(question):
            yield {"type": "token", "text": "Hello"}
            yield {"type": "done", "tokens_used": 42}

        monkeypatch.setattr(ai.rag_service, "answer_stream", fake_stream)
        r = client.post("/api/v1/ai/chat/stream", json={"question": "hi"})
        assert r.status_code == 200
        assert fake_redis.store[ai._budget_key()] == 42

    def test_chat_returns_429_when_slots_saturated(self, client, fake_redis, monkeypatch):
        monkeypatch.setattr(ai.settings, "AI_MAX_CONCURRENT_REQUESTS", 0)
        r = client.post("/api/v1/ai/chat", json={"question": "hi"})
        assert r.status_code == 429
        assert "too many conversations" in r.json()["error"]["message"]

    def test_slot_released_after_chat_completes(self, client, fake_redis, monkeypatch):
        monkeypatch.setattr(ai.settings, "AI_MAX_CONCURRENT_REQUESTS", 1)
        monkeypatch.setattr(
            ai.rag_service,
            "answer",
            AsyncMock(
                return_value={
                    "answer": "hi",
                    "sources": [],
                    "model": "llama3.2",
                    "tokens_used": 1,
                }
            ),
        )
        # Two sequential requests both succeed — the slot is freed between them.
        assert client.post("/api/v1/ai/chat", json={"question": "a"}).status_code == 200
        assert client.post("/api/v1/ai/chat", json={"question": "b"}).status_code == 200
        assert ai._active_llm_calls == 0

    def test_slot_released_when_the_service_errors(self, client, fake_redis, monkeypatch):
        monkeypatch.setattr(ai.settings, "AI_MAX_CONCURRENT_REQUESTS", 1)
        monkeypatch.setattr(
            ai.rag_service, "answer", AsyncMock(side_effect=RuntimeError("llm down"))
        )
        assert client.post("/api/v1/ai/chat", json={"question": "a"}).status_code == 502
        assert ai._active_llm_calls == 0
