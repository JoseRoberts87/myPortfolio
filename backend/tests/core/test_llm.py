"""Tests for the provider-agnostic LLM client (app.core.llm)."""

from app.core import llm


def make(**overrides) -> llm.LLMSettings:
    # `_env_file=None` isolates the test from the repo .env; explicit overrides
    # for the two logic-driving fields keep provider selection deterministic.
    overrides.setdefault("LLM_PROVIDER", "")
    overrides.setdefault("OPENAI_API_KEY", "")
    return llm.LLMSettings(_env_file=None, **overrides)


class TestResolveProvider:
    def test_explicit_ollama(self):
        assert llm.resolve_provider(make(LLM_PROVIDER="ollama", OPENAI_API_KEY="sk-x")) == "ollama"

    def test_explicit_openai(self):
        assert llm.resolve_provider(make(LLM_PROVIDER="openai")) == "openai"

    def test_explicit_is_case_and_space_insensitive(self):
        assert llm.resolve_provider(make(LLM_PROVIDER="  OpenAI ")) == "openai"

    def test_auto_prefers_openai_when_key_present(self):
        assert llm.resolve_provider(make(OPENAI_API_KEY="sk-x")) == "openai"

    def test_auto_falls_back_to_ollama_without_key(self):
        assert llm.resolve_provider(make()) == "ollama"


class TestModelResolution:
    def test_ollama_models(self):
        s = make(LLM_PROVIDER="ollama", OLLAMA_CHAT_MODEL="llama3.2", OLLAMA_EMBED_MODEL="nomic-embed-text")
        assert llm.resolve_chat_model(s) == "llama3.2"
        assert llm.resolve_embed_model(s) == "nomic-embed-text"

    def test_openai_models(self):
        s = make(LLM_PROVIDER="openai", OPENAI_CHAT_MODEL="gpt-4o-mini", OPENAI_EMBED_MODEL="text-embedding-3-small")
        assert llm.resolve_chat_model(s) == "gpt-4o-mini"
        assert llm.resolve_embed_model(s) == "text-embedding-3-small"


class TestIsConfigured:
    def test_ollama_is_always_configured(self):
        assert llm.is_configured(make(LLM_PROVIDER="ollama")) is True

    def test_openai_needs_a_key(self):
        assert llm.is_configured(make(LLM_PROVIDER="openai", OPENAI_API_KEY="")) is False
        assert llm.is_configured(make(LLM_PROVIDER="openai", OPENAI_API_KEY="sk-x")) is True


class TestGetLlmClient:
    def test_ollama_client_points_at_the_ollama_base_url(self):
        s = make(LLM_PROVIDER="ollama", OLLAMA_BASE_URL="http://localhost:11434/v1")
        client = llm.get_llm_client(s)
        assert "11434" in str(client.base_url)

    def test_openai_client_points_at_openai(self):
        client = llm.get_llm_client(make(LLM_PROVIDER="openai", OPENAI_API_KEY="sk-x"))
        assert "openai.com" in str(client.base_url)


class TestLlmStatus:
    def test_status_shape_and_no_key_leak(self):
        status = llm.llm_status(make(LLM_PROVIDER="openai", OPENAI_API_KEY="sk-secret"))
        assert status["provider"] == "openai"
        assert status["chat_model"] == "gpt-4o-mini"
        assert status["configured"] is True
        # The API key must never appear in the serialized status.
        assert "sk-secret" not in str(status)

    def test_status_reports_ollama_locally(self):
        status = llm.llm_status(make(LLM_PROVIDER="ollama"))
        assert status["provider"] == "ollama"
        assert "11434" in status["base_url"]
        assert status["configured"] is True
