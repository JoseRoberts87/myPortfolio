"""Tests for agent step-streaming and generator token-streaming (issue #171).

Completes the streaming coverage: /chat/stream landed first (test_ai_streaming);
these cover agent_service.run_stream (a 'step' event per executed tool call),
content_service.generate_stream (token streaming), and the two SSE endpoints.
"""
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import numpy as np

from app.services.agent_service import AgentService
from app.services.content_service import ContentService


def _tool_call(name: str, arguments: str, call_id: str):
    return SimpleNamespace(
        id=call_id, function=SimpleNamespace(name=name, arguments=arguments)
    )


def _completion(content, tool_calls, tokens: int):
    message = SimpleNamespace(content=content, tool_calls=tool_calls)
    return SimpleNamespace(
        choices=[SimpleNamespace(message=message)],
        usage=SimpleNamespace(total_tokens=tokens),
    )


def _agent_client(*completions):
    client = MagicMock()
    client.chat.completions.create = AsyncMock(side_effect=list(completions))
    return client


def _patch_agent(client):
    return [
        patch("app.services.agent_service.get_llm_client", return_value=client),
        patch("app.services.agent_service.is_configured", return_value=True),
        patch("app.services.agent_service.resolve_chat_model", return_value="llama3.2"),
    ]


class TestAgentRunStream:
    async def test_yields_model_steps_answer_done_in_order(self):
        svc = AgentService()
        client = _agent_client(
            _completion("", [_tool_call("calculate", '{"expression": "2018 - 2011"}', "c1")], 100),
            _completion("Jose spent 7 years there.", None, 50),
        )
        patches = _patch_agent(client)
        for p in patches:
            p.start()
        try:
            events = [e async for e in svc.run_stream("How long at BoA?")]
        finally:
            for p in patches:
                p.stop()

        assert [e["type"] for e in events] == ["model", "step", "answer", "done"]
        assert events[0]["model"] == "llama3.2"
        step = events[1]
        assert step["tool"] == "calculate"
        assert step["arguments"] == {"expression": "2018 - 2011"}
        assert step["result"] == "7.0"  # the real calculate tool ran
        assert events[2]["text"] == "Jose spent 7 years there."
        assert events[3] == {"type": "done", "tokens_used": 150, "steps": 1}

    async def test_run_wrapper_matches_streamed_events(self):
        """run() is now a collector over run_stream — same loop, same results."""
        svc = AgentService()
        client = _agent_client(
            _completion("", [_tool_call("get_current_date", "{}", "c1")], 80),
            _completion("Answer.", None, 20),
        )
        patches = _patch_agent(client)
        for p in patches:
            p.start()
        try:
            result = await svc.run("What's today?")
        finally:
            for p in patches:
                p.stop()

        assert result["answer"] == "Answer."
        assert result["model"] == "llama3.2"
        assert result["tokens_used"] == 100
        assert len(result["steps"]) == 1
        assert result["steps"][0]["tool"] == "get_current_date"


def _gen_chunk(text):
    return SimpleNamespace(choices=[SimpleNamespace(delta=SimpleNamespace(content=text))])


async def _gen_fake_stream(*texts):
    for t in texts:
        yield _gen_chunk(t)


class TestGenerateStream:
    async def test_yields_sources_then_tokens_then_done(self):
        svc = ContentService()
        client = MagicMock()
        client.chat.completions.create = AsyncMock(
            return_value=_gen_fake_stream("Hi, ", "I'm ", "Jose.")
        )
        retrieved = [({"id": "x", "title": "X", "text": "facts"}, 0.9)]
        patches = [
            patch("app.services.content_service.get_llm_client", return_value=client),
            patch("app.services.content_service.is_configured", return_value=True),
            patch("app.services.content_service.resolve_chat_model", return_value="llama3.2"),
            patch(
                "app.services.content_service.rag_service.retrieve",
                AsyncMock(return_value=retrieved),
            ),
        ]
        for p in patches:
            p.start()
        try:
            events = [e async for e in svc.generate_stream("AI role", "elevator_pitch", "punchy")]
        finally:
            for p in patches:
                p.stop()

        assert events[0]["type"] == "sources"
        assert events[0]["sources"][0]["id"] == "x"
        assert events[0]["model"] == "llama3.2"
        tokens = [e["text"] for e in events if e["type"] == "token"]
        assert "".join(tokens) == "Hi, I'm Jose."
        assert events[-1]["type"] == "done"
        assert events[-1]["tokens_used"] >= 1
        # It really was a streaming call.
        assert client.chat.completions.create.await_args.kwargs["stream"] is True


class TestAgentStreamEndpoint:
    def test_disabled_returns_503(self, client, monkeypatch):
        from app.api import ai as ai_module

        monkeypatch.setattr(ai_module.settings, "AI_CHAT_ENABLED", False)
        r = client.post("/api/v1/ai/agent/stream", json={"question": "hi"})
        assert r.status_code == 503

    def test_empty_question_returns_400(self, client):
        assert client.post("/api/v1/ai/agent/stream", json={"question": "   "}).status_code == 400

    def test_streams_model_steps_answer_done(self, client, monkeypatch):
        from app.api import ai as ai_module

        async def fake_stream(question):
            yield {"type": "model", "model": "llama3.2"}
            yield {"type": "step", "tool": "calculate", "arguments": {"expression": "1+1"}, "result": "2.0"}
            yield {"type": "answer", "text": "Two."}
            yield {"type": "done", "tokens_used": 42, "steps": 1}

        monkeypatch.setattr(ai_module.agent_service, "run_stream", fake_stream)
        r = client.post("/api/v1/ai/agent/stream", json={"question": "hi"})

        assert r.status_code == 200
        assert "text/event-stream" in r.headers["content-type"]
        body = r.text
        assert '"type": "model"' in body
        assert '"type": "step"' in body and '"calculate"' in body
        assert '"type": "answer"' in body and "Two." in body
        assert '"type": "done"' in body


class TestGenerateStreamEndpoint:
    def test_disabled_returns_503(self, client, monkeypatch):
        from app.api import ai as ai_module

        monkeypatch.setattr(ai_module.settings, "AI_CHAT_ENABLED", False)
        r = client.post("/api/v1/ai/generate/stream", json={"brief": "AI role"})
        assert r.status_code == 503

    def test_oversized_brief_is_rejected(self, client):
        r = client.post("/api/v1/ai/generate/stream", json={"brief": "x" * 2001})
        # 2001 exceeds the schema's 2000 max -> 422 validation error
        assert r.status_code == 422

    def test_streams_sources_tokens_done(self, client, monkeypatch):
        from app.api import ai as ai_module

        async def fake_stream(brief, fmt, tone):
            yield {"type": "sources", "sources": [{"id": "x", "title": "X", "score": 0.9}], "model": "llama3.2"}
            yield {"type": "token", "text": "Draft"}
            yield {"type": "done", "tokens_used": 7}

        monkeypatch.setattr(ai_module.content_service, "generate_stream", fake_stream)
        r = client.post("/api/v1/ai/generate/stream", json={"brief": "AI role"})

        assert r.status_code == 200
        assert "text/event-stream" in r.headers["content-type"]
        body = r.text
        assert '"type": "sources"' in body
        assert "Draft" in body
        assert '"type": "done"' in body
