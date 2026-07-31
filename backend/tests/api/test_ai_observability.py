"""Tests for AI observability (issue #183): kill switch, spend alert, conversation logging."""
from types import SimpleNamespace
from unittest.mock import Mock

from app.api import ai


class FakeRedis:
    def __init__(self, seed=None):
        self.store = dict(seed or {})

    async def incr(self, key):
        return await self.incrby(key, 1)

    async def incrby(self, key, amount):
        self.store[key] = self.store.get(key, 0) + amount
        return self.store[key]

    async def expire(self, key, ttl):
        return True

    async def exists(self, key):
        return 1 if key in self.store else 0

    async def get(self, key):
        return self.store.get(key)


def _req(ip="1.2.3.4"):
    return SimpleNamespace(headers={"x-forwarded-for": ip}, client=SimpleNamespace(host="10.0.0.1"))


class TestKillSwitch:
    def test_kill_switch_takes_the_chat_offline(self, client, monkeypatch):
        # Flip the runtime kill switch (a Redis key) — no deploy needed.
        fake = FakeRedis({ai._KILL_SWITCH_KEY: "1"})
        monkeypatch.setattr(ai, "_get_redis", lambda: fake)
        r = client.post("/api/v1/ai/chat", json={"question": "hi"})
        assert r.status_code == 503
        # (the app formats error bodies via a custom handler — assert on the text)
        assert "offline" in r.text.lower()

    def test_not_killed_lets_requests_through(self, client, monkeypatch):
        # No kill key -> the gate passes (request proceeds to validation/rate-limit).
        fake = FakeRedis()
        monkeypatch.setattr(ai, "_get_redis", lambda: fake)
        # empty question still 400 (proves we got past the kill gate, not 503)
        r = client.post("/api/v1/ai/chat", json={"question": "   "})
        assert r.status_code == 400

    def test_health_reports_kill_switch_state(self, client, monkeypatch):
        fake = FakeRedis({ai._KILL_SWITCH_KEY: "1"})
        monkeypatch.setattr(ai, "_get_redis", lambda: fake)
        assert client.get("/api/v1/ai/health").json()["kill_switch"] is True


class TestSpendAlert:
    # The alert rides on #186's daily-budget counter (_record_tokens); this test
    # covers the 80%-crossing WARNING added for #183.
    async def test_alert_fires_once_when_crossing_the_threshold(self, monkeypatch):
        fake = FakeRedis()  # one shared counter across calls
        monkeypatch.setattr(ai, "_get_redis", lambda: fake)
        monkeypatch.setattr(ai.settings, "AI_DAILY_TOKEN_BUDGET", 100)
        monkeypatch.setattr(ai.settings, "AI_BUDGET_ALERT_FRACTION", 0.8)
        warn = Mock()
        monkeypatch.setattr(ai.logger, "warning", warn)

        await ai._record_tokens(70)   # total 70 (<80) — no alert
        assert not warn.called
        await ai._record_tokens(20)   # total 90 (crosses 80) — alert
        assert warn.call_count == 1
        await ai._record_tokens(5)    # total 95 — already alerted, no repeat
        assert warn.call_count == 1

    async def test_no_alert_when_budget_is_zero(self, monkeypatch):
        fake = FakeRedis()
        monkeypatch.setattr(ai, "_get_redis", lambda: fake)
        monkeypatch.setattr(ai.settings, "AI_DAILY_TOKEN_BUDGET", 0)
        warn = Mock()
        monkeypatch.setattr(ai.logger, "warning", warn)
        await ai._record_tokens(10_000)
        assert not warn.called


class TestConversationLogging:
    def test_hashes_ip_and_truncates_content(self, monkeypatch):
        info = Mock()
        monkeypatch.setattr(ai.logger, "info", info)
        monkeypatch.setattr(ai.settings, "AI_CONVERSATION_LOGGING", True)

        ai._log_conversation("chat", "q" * 600, "a" * 2000, "m", 5, _req("9.9.9.9"), {"x": 1})

        assert info.called
        extra = info.call_args.kwargs["extra"]
        assert "9.9.9.9" not in str(extra)          # raw IP never logged
        assert len(extra["ai_question"]) == 500       # truncated
        assert len(extra["ai_answer"]) == 1000
        assert extra["ai_kind"] == "chat" and extra["x"] == 1

    def test_respects_the_logging_toggle(self, monkeypatch):
        info = Mock()
        monkeypatch.setattr(ai.logger, "info", info)
        monkeypatch.setattr(ai.settings, "AI_CONVERSATION_LOGGING", False)
        ai._log_conversation("chat", "q", "a", "m", 1, _req())
        assert not info.called
