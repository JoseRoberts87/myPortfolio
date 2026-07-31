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
    def test_chat_model_follows_the_provider(self):
        assert llm.resolve_chat_model(make(LLM_PROVIDER="ollama", OLLAMA_CHAT_MODEL="gpt-oss:120b")) == "gpt-oss:120b"
        assert llm.resolve_chat_model(make(LLM_PROVIDER="openai", OPENAI_CHAT_MODEL="gpt-4o-mini")) == "gpt-4o-mini"

    def test_embed_model_is_provider_independent(self):
        # Embeddings run against EMBED_BASE_URL, decoupled from the chat provider,
        # so the embed model is the same regardless of who serves chat.
        for provider in ("ollama", "openai"):
            s = make(LLM_PROVIDER=provider, OPENAI_API_KEY="sk-x", OLLAMA_EMBED_MODEL="nomic-embed-text")
            assert llm.resolve_embed_model(s) == "nomic-embed-text"


class TestIsConfigured:
    def test_local_ollama_is_configured_without_a_key(self):
        assert llm.is_configured(make(LLM_PROVIDER="ollama")) is True

    def test_remote_ollama_cloud_requires_a_key(self):
        cloud = dict(LLM_PROVIDER="ollama", OLLAMA_BASE_URL="https://ollama.com/v1")
        assert llm.is_configured(make(**cloud, OLLAMA_API_KEY="")) is False
        assert llm.is_configured(make(**cloud, OLLAMA_API_KEY="key")) is True

    def test_openai_needs_a_key(self):
        assert llm.is_configured(make(LLM_PROVIDER="openai", OPENAI_API_KEY="")) is False
        assert llm.is_configured(make(LLM_PROVIDER="openai", OPENAI_API_KEY="sk-x")) is True


class TestGetLlmClient:
    def test_local_ollama_client_points_at_the_local_url(self):
        client = llm.get_llm_client(make(LLM_PROVIDER="ollama", OLLAMA_BASE_URL="http://localhost:11434/v1"))
        assert "11434" in str(client.base_url)

    def test_ollama_cloud_client_points_at_the_cloud(self):
        client = llm.get_llm_client(
            make(LLM_PROVIDER="ollama", OLLAMA_BASE_URL="https://ollama.com/v1", OLLAMA_API_KEY="key")
        )
        assert "ollama.com" in str(client.base_url)

    def test_openai_client_points_at_openai(self):
        client = llm.get_llm_client(make(LLM_PROVIDER="openai", OPENAI_API_KEY="sk-x"))
        assert "openai.com" in str(client.base_url)


class TestGetEmbedClient:
    def test_falls_back_to_the_chat_ollama_url_when_unset(self):
        # Local dev: no EMBED_BASE_URL -> embeddings use the local Ollama.
        client = llm.get_embed_client(make(LLM_PROVIDER="ollama", OLLAMA_BASE_URL="http://localhost:11434/v1"))
        assert "11434" in str(client.base_url)

    def test_uses_a_dedicated_embed_url_independent_of_chat(self):
        # Prod: chat on Ollama Cloud, embeddings on a local/sidecar Ollama.
        client = llm.get_embed_client(make(
            LLM_PROVIDER="ollama",
            OLLAMA_BASE_URL="https://ollama.com/v1",
            OLLAMA_API_KEY="key",
            EMBED_BASE_URL="http://localhost:11434/v1",
        ))
        assert "11434" in str(client.base_url)
        assert "ollama.com" not in str(client.base_url)


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

    def test_status_reports_split_chat_and_embed_endpoints(self):
        # Prod shape: chat on cloud, embeddings on the sidecar.
        status = llm.llm_status(make(
            LLM_PROVIDER="ollama",
            OLLAMA_BASE_URL="https://ollama.com/v1",
            OLLAMA_API_KEY="key",
            EMBED_BASE_URL="http://localhost:11434/v1",
        ))
        assert status["base_url"] == "https://ollama.com/v1"
        assert status["embed_base_url"] == "http://localhost:11434/v1"
        assert status["configured"] is True
