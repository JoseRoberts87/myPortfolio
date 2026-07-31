"""Tests for the streaming chat endpoint + rag_service.answer_stream (issue #171)."""
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import numpy as np

from app.services.rag_service import RagService


def _chunk(text):
    return SimpleNamespace(choices=[SimpleNamespace(delta=SimpleNamespace(content=text))])


async def _fake_stream(*texts):
    for t in texts:
        yield _chunk(t)


def _stream_client(*texts, dim=16):
    client = MagicMock()

    async def embed_create(model, input):
        data = [
            SimpleNamespace(embedding=np.random.RandomState(abs(hash(t)) % (2**31)).rand(dim).tolist())
            for t in input
        ]
        return SimpleNamespace(data=data)

    client.embeddings.create = AsyncMock(side_effect=embed_create)
    # create(stream=True) is awaited and returns an async iterator of chunks.
    client.chat.completions.create = AsyncMock(return_value=_fake_stream(*texts))
    return client


def _patch_llm(client):
    return [
        patch("app.services.rag_service.get_llm_client", return_value=client),
        patch("app.services.rag_service.get_embed_client", return_value=client),
        patch("app.services.rag_service.is_configured", return_value=True),
        patch("app.services.rag_service.resolve_chat_model", return_value="llama3.2"),
        patch("app.services.rag_service.resolve_embed_model", return_value="nomic-embed-text"),
    ]


class TestAnswerStream:
    async def test_yields_sources_then_tokens_then_done(self):
        svc = RagService()
        client = _stream_client("Hello", " world", "!")
        patches = _patch_llm(client)
        for p in patches:
            p.start()
        try:
            events = [e async for e in svc.answer_stream("hi")]
        finally:
            for p in patches:
                p.stop()

        assert events[0]["type"] == "sources"
        assert events[0]["sources"] and events[0]["model"] == "llama3.2"
        tokens = [e["text"] for e in events if e["type"] == "token"]
        assert "".join(tokens) == "Hello world!"
        assert events[-1]["type"] == "done"


class TestChatStreamEndpoint:
    def test_disabled_returns_503(self, client, monkeypatch):
        from app.api import ai as ai_module

        monkeypatch.setattr(ai_module.settings, "AI_CHAT_ENABLED", False)
        r = client.post("/api/v1/ai/chat/stream", json={"question": "hi"})
        assert r.status_code == 503

    def test_empty_question_returns_400(self, client):
        assert client.post("/api/v1/ai/chat/stream", json={"question": "   "}).status_code == 400

    def test_streams_sources_tokens_and_done(self, client, monkeypatch):
        from app.api import ai as ai_module

        async def fake_stream(question):
            yield {"type": "sources", "sources": [{"id": "x", "title": "X", "score": 0.9}], "model": "llama3.2"}
            yield {"type": "token", "text": "Hello"}
            yield {"type": "token", "text": " world"}
            yield {"type": "done"}

        monkeypatch.setattr(ai_module.rag_service, "answer_stream", fake_stream)
        r = client.post("/api/v1/ai/chat/stream", json={"question": "hi"})

        assert r.status_code == 200
        assert "text/event-stream" in r.headers["content-type"]
        body = r.text
        assert '"type": "sources"' in body
        assert "Hello" in body and "world" in body
        assert body.rstrip().endswith('"done"}')
