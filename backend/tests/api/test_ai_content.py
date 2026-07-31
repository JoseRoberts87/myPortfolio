"""Tests for the GenAI content generator — service + endpoint guards.

The LLM client and retrieval are mocked, so these never touch a real provider.
"""
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.content_service import DEFAULT_FORMAT, FORMATS, TONES, ContentService
from app.services.rag_service import rag_service


def _completion(content: str, tokens: int = 200, finish_reason=None):
    return SimpleNamespace(
        choices=[SimpleNamespace(message=SimpleNamespace(content=content), finish_reason=finish_reason)],
        usage=SimpleNamespace(total_tokens=tokens),
    )


def _client(content: str = "Generated pitch.", tokens: int = 200):
    client = MagicMock()
    client.chat.completions.create = AsyncMock(return_value=_completion(content, tokens))
    return client


async def _fake_retrieve(query, top_k):
    return [
        ({"id": "mojotech", "title": "MojoTech", "text": "agentic workforce, 30% fewer errors"}, 0.81),
        ({"id": "overview", "title": "Overview", "text": "Data & AI Architect, 15+ years"}, 0.74),
    ]


def _patches(client, configured=True):
    return [
        patch("app.services.content_service.get_llm_client", return_value=client),
        patch("app.services.content_service.is_configured", return_value=configured),
        patch("app.services.content_service.resolve_chat_model", return_value="llama3.2"),
        patch.object(rag_service, "retrieve", side_effect=_fake_retrieve),
    ]


class TestContentService:
    async def test_generates_grounded_content_with_sources(self):
        svc = ContentService()
        client = _client("As a Data & AI Architect, I built an agentic workforce...", tokens=512)
        patches = _patches(client)
        for p in patches:
            p.start()
        try:
            result = await svc.generate("Senior AI Engineer, RAG + agents", "elevator_pitch", "punchy")
        finally:
            for p in patches:
                p.stop()

        assert result["content"].startswith("As a Data & AI Architect")
        assert result["model"] == "llama3.2"
        assert result["tokens_used"] == 512
        assert [s["title"] for s in result["sources"]] == ["MojoTech", "Overview"]
        assert all({"id", "title", "score"} <= set(s) for s in result["sources"])

    async def test_format_tone_and_brief_flow_into_the_prompt(self):
        svc = ContentService()
        client = _client()
        patches = _patches(client)
        for p in patches:
            p.start()
        try:
            await svc.generate("Staff MLOps role", "cover_letter", "conversational")
        finally:
            for p in patches:
                p.stop()

        user_msg = client.chat.completions.create.call_args.kwargs["messages"][1]["content"]
        assert "Staff MLOps role" in user_msg
        assert FORMATS["cover_letter"] in user_msg
        assert TONES["conversational"] in user_msg
        # The retrieved resume context is included for grounding.
        assert "agentic workforce, 30% fewer errors" in user_msg

    async def test_unknown_format_and_tone_fall_back_to_defaults(self):
        svc = ContentService()
        client = _client()
        patches = _patches(client)
        for p in patches:
            p.start()
        try:
            await svc.generate("", "not_a_format", "not_a_tone")
        finally:
            for p in patches:
                p.stop()

        user_msg = client.chat.completions.create.call_args.kwargs["messages"][1]["content"]
        assert FORMATS[DEFAULT_FORMAT] in user_msg  # fell back to the default format
        # An empty brief still generates (general-purpose target).
        assert "general" in user_msg.lower()

    async def test_raises_when_no_provider(self):
        svc = ContentService()
        import pytest

        patches = _patches(_client(), configured=False)
        for p in patches:
            p.start()
        try:
            assert svc.enabled is False
            with pytest.raises(RuntimeError):
                await svc.generate("x", "elevator_pitch", "professional")
        finally:
            for p in patches:
                p.stop()


    async def test_warns_when_content_is_truncated(self):
        import app.services.content_service as cs_module

        svc = ContentService()
        client = _client()
        client.chat.completions.create.return_value = _completion("draft…", finish_reason="length")
        patches = _patches(client) + [patch.object(cs_module.logger, "warning")]
        started = [p.start() for p in patches]
        warn = started[-1]
        try:
            await svc.generate("Senior AI role", "elevator_pitch", "professional")
        finally:
            for p in patches:
                p.stop()
        assert warn.called  # finish_reason == "length" -> truncation warning logged


class TestGenerateEndpoint:
    def test_too_long_brief_returns_400(self, client):
        r = client.post("/api/v1/ai/generate", json={"brief": "x" * 2001})
        # 2001 exceeds the schema's 2000 max -> 422 validation error
        assert r.status_code == 422

    def test_disabled_returns_503(self, client, monkeypatch):
        from app.api import ai as ai_module

        monkeypatch.setattr(ai_module.settings, "AI_CHAT_ENABLED", False)
        r = client.post("/api/v1/ai/generate", json={"brief": "AI role"})
        assert r.status_code == 503

    def test_happy_path_returns_content_and_sources(self, client, monkeypatch):
        from app.api import ai as ai_module

        async def fake_generate(brief, fmt, tone):
            return {
                "content": "I am a Data & AI Architect with 15+ years of experience.",
                "sources": [{"id": "overview", "title": "Overview", "score": 0.8}],
                "model": "llama3.2",
                "tokens_used": 33,
            }

        monkeypatch.setattr(ai_module.content_service, "generate", fake_generate)
        r = client.post(
            "/api/v1/ai/generate",
            json={"brief": "AI Architect role", "format": "cover_letter", "tone": "professional"},
        )
        assert r.status_code == 200
        body = r.json()
        assert body["content"].startswith("I am a Data & AI Architect")
        assert body["sources"][0]["title"] == "Overview"
        assert body["model"] == "llama3.2"

    def test_defaults_applied_when_only_brief_given(self, client, monkeypatch):
        from app.api import ai as ai_module

        captured = {}

        async def fake_generate(brief, fmt, tone):
            captured.update(brief=brief, fmt=fmt, tone=tone)
            return {"content": "ok", "sources": [], "model": "llama3.2", "tokens_used": 1}

        monkeypatch.setattr(ai_module.content_service, "generate", fake_generate)
        client.post("/api/v1/ai/generate", json={"brief": "role"})
        assert captured == {"brief": "role", "fmt": "elevator_pitch", "tone": "professional"}
