"""
Provider-agnostic LLM client.

Local development runs against a local **Ollama** server; production uses
**OpenAI**. Because Ollama exposes an OpenAI-compatible API (`/v1/chat/completions`,
`/v1/embeddings`), the very same `openai` SDK drives both — only the `base_url`,
`api_key`, and model names differ, and those are all env-driven. Switching to
OpenAI for prod is therefore just configuration:

    # local (default when no OPENAI_API_KEY is set)
    LLM_PROVIDER=ollama            # optional; auto-detected
    OLLAMA_CHAT_MODEL=llama3.2

    # prod
    LLM_PROVIDER=openai
    OPENAI_API_KEY=sk-...

AI features should obtain their client from `get_llm_client()` and their model
names from `resolve_chat_model()` / `resolve_embed_model()` rather than
constructing `AsyncOpenAI` directly, so the provider stays swappable.
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

    # Local Ollama (OpenAI-compatible endpoint).
    OLLAMA_BASE_URL: str = "http://localhost:11434/v1"
    OLLAMA_CHAT_MODEL: str = "llama3.2"
    OLLAMA_EMBED_MODEL: str = "nomic-embed-text"

    # OpenAI (production).
    OPENAI_API_KEY: str = ""
    OPENAI_CHAT_MODEL: str = "gpt-4o-mini"
    OPENAI_EMBED_MODEL: str = "text-embedding-3-small"

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
    s = settings or get_llm_settings()
    return s.OLLAMA_EMBED_MODEL if resolve_provider(s) == "ollama" else s.OPENAI_EMBED_MODEL


def is_configured(settings: Optional[LLMSettings] = None) -> bool:
    """Whether an LLM is usable. Ollama is assumed available locally (verify with
    `check_llm_reachable`); OpenAI requires an API key."""
    s = settings or get_llm_settings()
    return True if resolve_provider(s) == "ollama" else bool(s.OPENAI_API_KEY)


def get_llm_client(settings: Optional[LLMSettings] = None) -> AsyncOpenAI:
    """An `AsyncOpenAI` client pointed at the active provider."""
    s = settings or get_llm_settings()
    if resolve_provider(s) == "ollama":
        return AsyncOpenAI(base_url=s.OLLAMA_BASE_URL, api_key=_OLLAMA_PLACEHOLDER_KEY)
    return AsyncOpenAI(api_key=s.OPENAI_API_KEY)


def llm_status(settings: Optional[LLMSettings] = None) -> dict:
    """Serializable summary for health/debug endpoints (never leaks the key)."""
    s = settings or get_llm_settings()
    provider = resolve_provider(s)
    return {
        "provider": provider,
        "chat_model": resolve_chat_model(s),
        "embed_model": resolve_embed_model(s),
        "base_url": s.OLLAMA_BASE_URL if provider == "ollama" else "https://api.openai.com/v1",
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
