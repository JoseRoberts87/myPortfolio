"""Tests for the AI rate limiter — proxy-aware client IP + global backstop (issue #166)."""
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app.api import ai


class FakeRedis:
    """In-memory async stand-in for the rate-limit counters."""

    def __init__(self):
        self.store = {}

    async def incr(self, key):
        self.store[key] = self.store.get(key, 0) + 1
        return self.store[key]

    async def expire(self, key, ttl):
        return True


def _req(xff=None, peer="10.0.0.1"):
    headers = {"x-forwarded-for": xff} if xff is not None else {}
    return SimpleNamespace(headers=headers, client=SimpleNamespace(host=peer))


class TestClientIp:
    def test_prefers_leftmost_xff(self):
        # Left-most X-Forwarded-For entry is the original client.
        assert ai._client_ip(_req(xff="1.2.3.4, 5.6.7.8")) == "1.2.3.4"

    def test_strips_whitespace(self):
        assert ai._client_ip(_req(xff="  9.9.9.9  ")) == "9.9.9.9"

    def test_falls_back_to_peer_without_xff(self):
        assert ai._client_ip(_req(peer="7.7.7.7")) == "7.7.7.7"

    def test_empty_xff_falls_back_to_peer(self):
        assert ai._client_ip(_req(xff="   ", peer="8.8.8.8")) == "8.8.8.8"


class TestRateLimitEnforcement:
    async def test_per_client_buckets_are_independent(self, monkeypatch):
        fake = FakeRedis()
        monkeypatch.setattr(ai, "_get_redis", lambda: fake)
        monkeypatch.setattr(ai.settings, "AI_RATE_LIMIT_PER_HOUR", 3)
        monkeypatch.setattr(ai.settings, "AI_RATE_LIMIT_GLOBAL_PER_HOUR", 10_000)

        # Client A: 3 allowed, 4th is blocked.
        for _ in range(3):
            await ai._enforce_rate_limit(_req(xff="1.1.1.1"))
        with pytest.raises(HTTPException) as exc:
            await ai._enforce_rate_limit(_req(xff="1.1.1.1"))
        assert exc.value.status_code == 429

        # A different client (distinct X-Forwarded-For) is unaffected — the whole
        # point of the fix: one visitor's traffic no longer throttles everyone.
        await ai._enforce_rate_limit(_req(xff="2.2.2.2"))

    async def test_global_backstop_bounds_total_traffic(self, monkeypatch):
        fake = FakeRedis()
        monkeypatch.setattr(ai, "_get_redis", lambda: fake)
        monkeypatch.setattr(ai.settings, "AI_RATE_LIMIT_PER_HOUR", 10_000)
        monkeypatch.setattr(ai.settings, "AI_RATE_LIMIT_GLOBAL_PER_HOUR", 2)

        await ai._enforce_rate_limit(_req(xff="1.1.1.1"))
        await ai._enforce_rate_limit(_req(xff="2.2.2.2"))
        # A third distinct IP still trips the site-wide backstop (spoof protection).
        with pytest.raises(HTTPException) as exc:
            await ai._enforce_rate_limit(_req(xff="3.3.3.3"))
        assert exc.value.status_code == 429

    async def test_fails_open_when_redis_is_down(self, monkeypatch):
        class Broken:
            async def incr(self, key):
                raise RuntimeError("redis down")

        monkeypatch.setattr(ai, "_get_redis", lambda: Broken())
        # Must not raise — the demo stays up if Redis is unavailable.
        await ai._enforce_rate_limit(_req(xff="1.1.1.1"))
