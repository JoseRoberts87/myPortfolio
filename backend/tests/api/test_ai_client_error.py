"""Tests for the AI client-error beacon (/api/v1/ai/client-error).

Captures browser-side failures (e.g. mobile streaming errors) in the server logs:
IP hashed, fields size-capped, per-IP flood cap, gated by AI_CONVERSATION_LOGGING.
"""
from unittest.mock import Mock

from app.api import ai


class FakeRedis:
    def __init__(self, seed=None):
        self.store = dict(seed or {})

    async def incr(self, key):
        self.store[key] = self.store.get(key, 0) + 1
        return self.store[key]

    async def expire(self, key, ttl):
        return True


_PAYLOAD = {
    "component": "ai-chat",
    "stage": "stream-read",
    "name": "TypeError",
    "message": "Load failed",
    "status": 200,
    "has_body": True,
    "streams_supported": False,
    "url": "https://www.therpiproject.com/ai-agents",
    "ua": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Safari",
}


class TestClientErrorBeacon:
    def test_logs_and_returns_204(self, client, monkeypatch):
        monkeypatch.setattr(ai, "_get_redis", lambda: FakeRedis())
        monkeypatch.setattr(ai.settings, "AI_CONVERSATION_LOGGING", True)
        warn = Mock()
        monkeypatch.setattr(ai.logger, "warning", warn)

        r = client.post("/api/v1/ai/client-error", json=_PAYLOAD)

        assert r.status_code == 204
        assert warn.called
        extra = warn.call_args.kwargs["extra"]
        assert extra["ai_kind"] == "client-error"
        assert extra["ai_component"] == "ai-chat"
        assert extra["ai_stage"] == "stream-read"
        assert extra["ai_error_name"] == "TypeError"
        assert extra["ai_streams_supported"] is False

    def test_hashes_the_client_ip(self, client, monkeypatch):
        monkeypatch.setattr(ai, "_get_redis", lambda: FakeRedis())
        warn = Mock()
        monkeypatch.setattr(ai.logger, "warning", warn)

        client.post(
            "/api/v1/ai/client-error",
            json=_PAYLOAD,
            headers={"X-Forwarded-For": "203.0.113.9"},
        )

        extra = warn.call_args.kwargs["extra"]
        assert "203.0.113.9" not in str(extra)  # raw IP never logged
        assert len(extra["ai_client"]) == 12  # sha256 prefix

    def test_respects_the_logging_toggle(self, client, monkeypatch):
        monkeypatch.setattr(ai, "_get_redis", lambda: FakeRedis())
        monkeypatch.setattr(ai.settings, "AI_CONVERSATION_LOGGING", False)
        warn = Mock()
        monkeypatch.setattr(ai.logger, "warning", warn)

        r = client.post("/api/v1/ai/client-error", json=_PAYLOAD)

        assert r.status_code == 204
        assert not warn.called  # disabled -> captured nothing, still 204

    def test_flood_cap_drops_excess_but_still_204(self, client, monkeypatch):
        fake = FakeRedis()  # ONE shared counter across the 4 requests
        monkeypatch.setattr(ai, "_get_redis", lambda: fake)
        monkeypatch.setattr(ai.settings, "AI_CONVERSATION_LOGGING", True)
        monkeypatch.setattr(ai.settings, "AI_CLIENT_ERROR_MAX_PER_HOUR", 2)
        warn = Mock()
        monkeypatch.setattr(ai.logger, "warning", warn)

        codes = [client.post("/api/v1/ai/client-error", json=_PAYLOAD).status_code for _ in range(4)]

        assert codes == [204, 204, 204, 204]  # client never sees an error
        assert warn.call_count == 2  # only up to the per-IP cap is logged

    def test_oversized_message_is_rejected(self, client, monkeypatch):
        # A direct abuser can't dump unbounded text into the logs.
        monkeypatch.setattr(ai, "_get_redis", lambda: FakeRedis())
        r = client.post("/api/v1/ai/client-error", json={**_PAYLOAD, "message": "x" * 5000})
        assert r.status_code == 422
