"""Tests for the tool-using AI agent — service loop, tools, and endpoint guards.

The LLM client is mocked, so these never touch a real Ollama/OpenAI provider.
"""
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.agent_service import AgentService, _safe_eval
from app.services.rag_service import rag_service


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


def _client_returning(*completions):
    client = MagicMock()
    client.chat.completions.create = AsyncMock(side_effect=list(completions))
    return client


def _patch_llm(client):
    return [
        patch("app.services.agent_service.get_llm_client", return_value=client),
        patch("app.services.agent_service.is_configured", return_value=True),
        patch("app.services.agent_service.resolve_chat_model", return_value="llama3.2"),
    ]


class TestSafeEval:
    def test_evaluates_arithmetic(self):
        assert _safe_eval("2018 - 2011") == 7.0
        assert _safe_eval("2 + 3 * 4") == 14.0
        assert _safe_eval("2 ** 10") == 1024.0
        assert _safe_eval("0.83 * 100") == 83.0

    def test_rejects_arbitrary_code(self):
        for hostile in ["__import__('os')", "open('x')", "a + 1", "1;2"]:
            with pytest.raises(Exception):
                _safe_eval(hostile)


class TestAgentService:
    async def test_runs_a_tool_then_answers(self):
        svc = AgentService()
        client = _client_returning(
            _completion("", [_tool_call("calculate", '{"expression": "2018 - 2011"}', "c1")], 100),
            _completion("Jose spent 7 years at Bank of America.", None, 50),
        )
        patches = _patch_llm(client)
        for p in patches:
            p.start()
        try:
            result = await svc.run("How long was Jose at Bank of America?")
        finally:
            for p in patches:
                p.stop()

        assert result["answer"] == "Jose spent 7 years at Bank of America."
        assert result["model"] == "llama3.2"
        assert result["tokens_used"] == 150  # summed across both calls
        assert len(result["steps"]) == 1
        step = result["steps"][0]
        assert step["tool"] == "calculate"
        assert step["arguments"] == {"expression": "2018 - 2011"}
        assert step["result"] == "7.0"  # the real calculate tool ran
        assert client.chat.completions.create.await_count == 2

    async def test_search_portfolio_tool_uses_retrieval(self):
        svc = AgentService()
        client = _client_returning(
            _completion("", [_tool_call("search_portfolio", '{"query": "Evonik"}', "c1")], 10),
            _completion("Evonik: $2M saved.", None, 10),
        )

        async def fake_retrieve(query, top_k):
            return [({"id": "evonik", "title": "Evonik", "text": "$2M energy savings"}, 0.9)]

        patches = _patch_llm(client)
        for p in patches:
            p.start()
        try:
            with patch.object(rag_service, "retrieve", side_effect=fake_retrieve):
                result = await svc.run("What did Jose do at Evonik?")
        finally:
            for p in patches:
                p.stop()

        step = result["steps"][0]
        assert step["tool"] == "search_portfolio"
        assert "Evonik" in step["result"] and "$2M" in step["result"]

    async def test_malformed_tool_arguments_do_not_crash(self):
        svc = AgentService()
        client = _client_returning(
            _completion("", [_tool_call("get_current_date", "not-json", "c1")], 5),
            _completion("Done.", None, 5),
        )
        patches = _patch_llm(client)
        for p in patches:
            p.start()
        try:
            result = await svc.run("What is today?")
        finally:
            for p in patches:
                p.stop()

        # Bad JSON args are coerced to {} and the no-arg tool still runs
        assert result["steps"][0]["tool"] == "get_current_date"
        assert result["answer"] == "Done."

    async def test_forces_final_answer_when_steps_exhausted(self, monkeypatch):
        from app.core.config import settings

        monkeypatch.setattr(settings, "AI_AGENT_MAX_STEPS", 2)
        svc = AgentService()
        loop_turn = _completion("", [_tool_call("calculate", '{"expression": "1 + 1"}', "c")], 10)
        # Every loop turn asks for a tool; the extra call is the forced final answer.
        client = _client_returning(loop_turn, loop_turn, _completion("Final answer.", None, 10))
        patches = _patch_llm(client)
        for p in patches:
            p.start()
        try:
            result = await svc.run("loop please")
        finally:
            for p in patches:
                p.stop()

        assert result["answer"] == "Final answer."
        assert len(result["steps"]) == 2  # two tool turns before the forced answer
        assert client.chat.completions.create.await_count == 3

    async def test_raises_when_no_provider(self):
        svc = AgentService()
        with patch("app.services.agent_service.is_configured", return_value=False):
            assert svc.enabled is False
            with pytest.raises(RuntimeError):
                await svc.run("hello")


class TestAgentEndpoint:
    def test_empty_question_returns_400(self, client):
        assert client.post("/api/v1/ai/agent", json={"question": "   "}).status_code == 400

    def test_too_long_question_returns_400(self, client):
        assert client.post("/api/v1/ai/agent", json={"question": "x" * 501}).status_code == 400

    def test_disabled_returns_503(self, client, monkeypatch):
        from app.api import ai as ai_module

        monkeypatch.setattr(ai_module.settings, "AI_CHAT_ENABLED", False)
        r = client.post("/api/v1/ai/agent", json={"question": "How long at BoA?"})
        assert r.status_code == 503

    def test_happy_path_returns_answer_and_trace(self, client, monkeypatch):
        from app.api import ai as ai_module

        async def fake_run(question: str):
            return {
                "answer": "Jose has 15+ years of experience.",
                "steps": [
                    {"tool": "get_current_date", "arguments": {}, "result": "2026-07-30"},
                    {"tool": "calculate", "arguments": {"expression": "2026 - 2011"}, "result": "15.0"},
                ],
                "model": "llama3.2",
                "tokens_used": 42,
            }

        monkeypatch.setattr(ai_module.agent_service, "run", fake_run)
        r = client.post("/api/v1/ai/agent", json={"question": "How many years of experience?"})
        assert r.status_code == 200
        body = r.json()
        assert body["answer"] == "Jose has 15+ years of experience."
        assert len(body["steps"]) == 2
        assert body["steps"][1]["tool"] == "calculate"
        assert body["steps"][1]["arguments"] == {"expression": "2026 - 2011"}
