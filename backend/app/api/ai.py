"""
AI Assistant API — "Ask my portfolio" RAG chat.

Exposes a single grounded-Q&A endpoint backed by the RAG service, with a
per-IP hourly rate limit (Redis, fail-open) and request-size guards. The LLM
provider (local Ollama vs. OpenAI) is resolved by app.core.llm.
"""
from datetime import datetime

from fastapi import APIRouter, HTTPException, Request, status
from redis import asyncio as aioredis

from app.core.config import settings
from app.core.llm import llm_status
from app.core.logging_config import get_logger
from app.schemas.ai import ChatRequest, ChatResponse
from app.services.portfolio_knowledge import KNOWLEDGE_CHUNKS
from app.services.rag_service import rag_service

logger = get_logger(__name__)
router = APIRouter()

_redis: aioredis.Redis | None = None


def _get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = aioredis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            password=settings.REDIS_PASSWORD or None,
            socket_connect_timeout=1,
            socket_timeout=1,
        )
    return _redis


async def _enforce_rate_limit(request: Request) -> None:
    """Per-IP hourly limit. Fails open (allows the request) if Redis is down."""
    client_ip = request.client.host if request.client else "unknown"
    key = f"ai:ratelimit:{client_ip}"
    try:
        count = await _get_redis().incr(key)
        if count == 1:
            await _get_redis().expire(key, 3600)
    except Exception as exc:  # Redis unavailable — don't block the demo
        logger.warning(f"AI rate limiter unavailable, allowing request: {exc}")
        return

    if count > settings.AI_RATE_LIMIT_PER_HOUR:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                f"Rate limit exceeded ({settings.AI_RATE_LIMIT_PER_HOUR} questions/hour). "
                "Please try again later."
            ),
        )


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Ask the portfolio assistant",
    description="Ask a question about Jose's experience, skills, or projects. "
    "Answers are generated with RAG over a curated portfolio knowledge base.",
)
async def chat(payload: ChatRequest, request: Request) -> ChatResponse:
    if not settings.AI_CHAT_ENABLED or not rag_service.enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The AI assistant is not configured. Start a local Ollama server "
            "or set OPENAI_API_KEY to enable it.",
        )

    question = payload.question.strip()
    if not question:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Question cannot be empty.")
    if len(question) > settings.AI_MAX_QUESTION_CHARS:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Question too long (max {settings.AI_MAX_QUESTION_CHARS} characters).",
        )

    await _enforce_rate_limit(request)

    try:
        result = await rag_service.answer(question)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"AI chat error: {exc}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The AI assistant is temporarily unavailable. Please try again.",
        )

    logger.info(
        "AI chat answered",
        extra={"question": question[:120], "tokens": result["tokens_used"]},
    )
    return ChatResponse(**result)


@router.get("/health", summary="AI assistant status")
async def ai_health() -> dict:
    status_info = llm_status()
    return {
        "status": "healthy",
        "endpoint": "ai-chat",
        "configured": rag_service.enabled and settings.AI_CHAT_ENABLED,
        "provider": status_info["provider"],
        "chat_model": status_info["chat_model"],
        "embed_model": status_info["embed_model"],
        "knowledge_chunks": len(KNOWLEDGE_CHUNKS),
        "timestamp": datetime.utcnow().isoformat(),
    }
