"""
Provider-agnostic LLM client.

Everything talks the OpenAI-compatible API, so the same `openai` SDK drives every
backend — only `base_url`, `api_key`, and model names differ, and those are all
env-driven. Chat and embeddings are configured *independently*, because Ollama
Cloud serves chat but has no embeddings endpoint:

    # local (default): one local Ollama serves both chat and embeddings
    LLM_PROVIDER=ollama            # optional; auto-detected
    OLLAMA_CHAT_MODEL=gpt-oss:20b

    # prod: chat on Ollama Cloud, embeddings on a local/sidecar Ollama
    LLM_PROVIDER=ollama
    OLLAMA_BASE_URL=https://ollama.com/v1
    OLLAMA_API_KEY=<ollama cloud key>
    OLLAMA_CHAT_MODEL=gpt-oss:20b
    EMBED_BASE_URL=http://localhost:11434/v1   # sidecar Ollama (nomic-embed-text)

AI features should get their CHAT client from `get_llm_client()`, their EMBEDDINGS
client from `get_embed_client()`, and model names from `resolve_chat_model()` /
`resolve_embed_model()` rather than constructing `AsyncOpenAI` directly, so the
providers stay swappable.
"""

from __future__ import annotations

from typing import Literal, Optional

from openai import AsyncOpenAI
from pydantic_settings import BaseSettings, SettingsConfigDict

Provider = Literal["ollama", "openai"]

# Ollama requires *some* API key string on the OpenAI client even though it
# ignores it.
_OLLAMA_PLACEHOLDER_KEY = "ollama"


class LLMSettings(BaseSettings):
    """LLM configuration, read from the environment / .env (independent of the
    main app Settings so this module stays self-contained)."""

    # "ollama" | "openai" | "" (auto: OpenAI when a key is present, else Ollama).
    LLM_PROVIDER: str = ""

    # Chat provider — Ollama (local dev, or Ollama Cloud in prod via ollama.com).
    OLLAMA_BASE_URL: str = "http://localhost:11434/v1"
    OLLAMA_API_KEY: str = ""  # required for Ollama Cloud; ignored by a local server
    OLLAMA_CHAT_MODEL: str = "gpt-oss:20b"  # available both locally and on Ollama Cloud

    # Embeddings — a DEDICATED endpoint, independent of the chat provider. Ollama
    # Cloud serves chat but has no embeddings endpoint, so in prod this points at a
    # local/sidecar Ollama running the embed model while chat goes to the cloud.
    # Empty => fall back to OLLAMA_BASE_URL (the default local-dev behavior).
    EMBED_BASE_URL: str = ""
    EMBED_API_KEY: str = ""  # key for the embed endpoint; ignored for a local Ollama
    OLLAMA_EMBED_MODEL: str = "nomic-embed-text"

    # OpenAI (alternative chat provider for production).
    OPENAI_API_KEY: str = ""
    OPENAI_CHAT_MODEL: str = "gpt-4o-mini"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=True)


def get_llm_settings() -> LLMSettings:
    """Fresh settings read (kept un-cached so tests and hot config changes work)."""
    return LLMSettings()


def resolve_provider(settings: Optional[LLMSettings] = None) -> Provider:
    """Which provider is active. Explicit `LLM_PROVIDER` wins; otherwise prefer
    OpenAI when an API key is configured (prod), else Ollama (local dev)."""
    s = settings or get_llm_settings()
    explicit = (s.LLM_PROVIDER or "").strip().lower()
    if explicit in ("ollama", "openai"):
        return explicit  # type: ignore[return-value]
    return "openai" if s.OPENAI_API_KEY else "ollama"


def resolve_chat_model(settings: Optional[LLMSettings] = None) -> str:
    s = settings or get_llm_settings()
    return s.OLLAMA_CHAT_MODEL if resolve_provider(s) == "ollama" else s.OPENAI_CHAT_MODEL


def resolve_embed_model(settings: Optional[LLMSettings] = None) -> str:
    """The embedding model name. Embeddings run against EMBED_BASE_URL and are
    decoupled from the chat provider, so this is independent of `resolve_provider`."""
    s = settings or get_llm_settings()
    return s.OLLAMA_EMBED_MODEL


def _is_local_url(url: str) -> bool:
    return "localhost" in url or "127.0.0.1" in url


def is_configured(settings: Optional[LLMSettings] = None) -> bool:
    """Whether the chat LLM is usable. A local Ollama is assumed reachable; Ollama
    Cloud (a remote base URL) and OpenAI each require their API key."""
    s = settings or get_llm_settings()
    if resolve_provider(s) == "openai":
        return bool(s.OPENAI_API_KEY)
    # Ollama: a local server needs no key; a remote (cloud) endpoint requires one.
    return True if _is_local_url(s.OLLAMA_BASE_URL) else bool(s.OLLAMA_API_KEY)


def get_llm_client(settings: Optional[LLMSettings] = None) -> AsyncOpenAI:
    """An `AsyncOpenAI` client for CHAT, pointed at the active provider."""
    s = settings or get_llm_settings()
    if resolve_provider(s) == "ollama":
        # A real key for Ollama Cloud; the placeholder keeps a local server happy.
        return AsyncOpenAI(
            base_url=s.OLLAMA_BASE_URL, api_key=s.OLLAMA_API_KEY or _OLLAMA_PLACEHOLDER_KEY
        )
    return AsyncOpenAI(api_key=s.OPENAI_API_KEY)


def get_embed_client(settings: Optional[LLMSettings] = None) -> AsyncOpenAI:
    """An `AsyncOpenAI` client for EMBEDDINGS. Independent of the chat provider so
    embeddings can run on a local/sidecar Ollama (nomic-embed-text) even when chat
    is served by Ollama Cloud, which has no embeddings endpoint. Falls back to the
    chat Ollama URL when EMBED_BASE_URL is unset (the local-dev default)."""
    s = settings or get_llm_settings()
    base_url = s.EMBED_BASE_URL or s.OLLAMA_BASE_URL
    return AsyncOpenAI(base_url=base_url, api_key=s.EMBED_API_KEY or _OLLAMA_PLACEHOLDER_KEY)


def llm_status(settings: Optional[LLMSettings] = None) -> dict:
    """Serializable summary for health/debug endpoints (never leaks the key)."""
    s = settings or get_llm_settings()
    provider = resolve_provider(s)
    return {
        "provider": provider,
        "chat_model": resolve_chat_model(s),
        "embed_model": resolve_embed_model(s),
        "base_url": s.OLLAMA_BASE_URL if provider == "ollama" else "https://api.openai.com/v1",
        "embed_base_url": s.EMBED_BASE_URL or s.OLLAMA_BASE_URL,
        "configured": is_configured(s),
    }


async def check_llm_reachable(settings: Optional[LLMSettings] = None) -> dict:
    """Live connectivity probe — attempts to list models on the active provider.
    Safe to call from a health check; returns a status dict, never raises."""
    s = settings or get_llm_settings()
    status = llm_status(s)
    if not is_configured(s):
        return {**status, "reachable": False, "error": "not configured"}
    try:
        client = get_llm_client(s)
        await client.models.list()
        return {**status, "reachable": True, "error": None}
    except Exception as exc:  # pragma: no cover - network-dependent
        return {**status, "reachable": False, "error": str(exc)}
