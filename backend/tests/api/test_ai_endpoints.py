"""Tests for the AI assistant (RAG chat) — service logic + endpoint guards.

The LLM client is mocked, so these never touch a real Ollama/OpenAI provider.
"""
from unittest.mock import AsyncMock, MagicMock, patch

import numpy as np
import pytest

from app.services.portfolio_knowledge import KNOWLEDGE_CHUNKS
from app.services.rag_service import RagService


def _fake_llm_client(answer: str = "Grounded answer.", tokens: int = 123, dim: int = 16):
    """Stand-in AsyncOpenAI client: deterministic embeddings + a canned completion."""
    client = MagicMock()

    async def embed_create(model, input):
        data = []
        for text in input:
            rng = np.random.RandomState(abs(hash(text)) % (2**31))
            data.append(MagicMock(embedding=rng.rand(dim).tolist()))
        return MagicMock(data=data)

    client.embeddings.create = AsyncMock(side_effect=embed_create)

    completion = MagicMock()
    completion.choices = [MagicMock(message=MagicMock(content=answer))]
    completion.usage = MagicMock(total_tokens=tokens)
    client.chat.completions.create = AsyncMock(return_value=completion)
    return client


def _patch_llm(client, configured: bool = True):
    return [
        patch("app.services.rag_service.get_llm_client", return_value=client),
        patch("app.services.rag_service.get_embed_client", return_value=client),
        patch("app.services.rag_service.is_configured", return_value=configured),
        patch("app.services.rag_service.resolve_chat_model", return_value="llama3.2"),
        patch("app.services.rag_service.resolve_embed_model", return_value="nomic-embed-text"),
    ]


class TestRagService:
    async def test_answer_returns_grounded_response_with_sources(self):
        svc = RagService()
        client = _fake_llm_client(answer="Jose built agentic systems.", tokens=200)
        patches = _patch_llm(client)
        for p in patches:
            p.start()
        try:
            res = await svc.answer("What has Jose done with agentic AI?")
        finally:
            for p in patches:
                p.stop()

        assert res["answer"] == "Jose built agentic systems."
        assert res["model"] == "llama3.2"
        assert res["tokens_used"] == 200
        assert len(res["sources"]) == 4  # AI_RETRIEVAL_TOP_K
        assert all({"id", "title", "score"} <= set(s) for s in res["sources"])
        # KB embedded once + the query embedded once
        assert client.embeddings.create.await_count == 2

    async def test_index_is_embedded_only_once_across_calls(self):
        svc = RagService()
        client = _fake_llm_client()
        patches = _patch_llm(client)
        for p in patches:
            p.start()
        try:
            await svc.answer("q1")
            await svc.answer("q2")
        finally:
            for p in patches:
                p.stop()
        # 1 KB embed + 2 query embeds (KB is cached, not re-embedded)
        assert client.embeddings.create.await_count == 3

    async def test_answer_raises_when_no_provider_configured(self):
        svc = RagService()
        patches = _patch_llm(_fake_llm_client(), configured=False)
        for p in patches:
            p.start()
        try:
            assert svc.enabled is False
            with pytest.raises(RuntimeError):
                await svc.answer("hello")
        finally:
            for p in patches:
                p.stop()


class TestChatEndpoint:
    def test_empty_question_returns_400(self, client):
        assert client.post("/api/v1/ai/chat", json={"question": "   "}).status_code == 400

    def test_too_long_question_returns_400(self, client):
        assert client.post("/api/v1/ai/chat", json={"question": "x" * 501}).status_code == 400

    def test_disabled_returns_503(self, client, monkeypatch):
        from app.api import ai as ai_module

        monkeypatch.setattr(ai_module.settings, "AI_CHAT_ENABLED", False)
        r = client.post("/api/v1/ai/chat", json={"question": "Tell me about Jose"})
        assert r.status_code == 503

    def test_happy_path_returns_answer_and_sources(self, client, monkeypatch):
        from app.api import ai as ai_module

        async def fake_answer(question: str):
            return {
                "answer": "Jose is a Data & AI Architect.",
                "sources": [{"id": "overview", "title": "Overview", "score": 0.8}],
                "model": "llama3.2",
                "tokens_used": 7,
            }

        monkeypatch.setattr(ai_module.rag_service, "answer", fake_answer)
        r = client.post("/api/v1/ai/chat", json={"question": "Who is Jose?"})
        assert r.status_code == 200
        body = r.json()
        assert body["answer"] == "Jose is a Data & AI Architect."
        assert body["sources"][0]["title"] == "Overview"
        assert body["model"] == "llama3.2"

    def test_health_reports_provider_and_chunk_count(self, client):
        r = client.get("/api/v1/ai/health")
        assert r.status_code == 200
        body = r.json()
        assert body["endpoint"] == "ai-chat"
        assert "provider" in body and "chat_model" in body and "embed_model" in body
        assert body["knowledge_chunks"] == len(KNOWLEDGE_CHUNKS)
