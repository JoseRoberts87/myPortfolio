"""
AI Assistant API — "Ask my portfolio" RAG chat.

Exposes a single grounded-Q&A endpoint backed by the RAG service, with a
per-IP hourly rate limit (Redis, fail-open) and request-size guards. The LLM
provider (local Ollama vs. OpenAI) is resolved by app.core.llm.
"""
import json
from datetime import datetime

from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from redis import asyncio as aioredis

from app.core.config import settings
from app.core.llm import llm_status
from app.core.logging_config import get_logger
from app.schemas.ai import (
    AgentResponse,
    ChatRequest,
    ChatResponse,
    GenerateRequest,
    GenerateResponse,
)
from app.services.agent_service import agent_service
from app.services.content_service import content_service
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


def _client_ip(request: Request) -> str:
    """Best-effort real client IP for rate-limiting.

    Behind a proxy (Railway/Vercel) `request.client.host` is the proxy, so a naive
    per-IP limit collapses into one global bucket shared by every visitor. Prefer
    the left-most `X-Forwarded-For` entry (the original client). X-Forwarded-For is
    client-spoofable, so the global backstop below bounds total abuse regardless.
    """
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        client = forwarded.split(",")[0].strip()
        if client:
            return client
    return request.client.host if request.client else "unknown"


async def _enforce_rate_limit(request: Request) -> None:
    """Per-client hourly limit + a global hourly backstop. Fails open if Redis is down."""
    ip_key = f"ai:ratelimit:{_client_ip(request)}"
    global_key = "ai:ratelimit:global"
    try:
        redis = _get_redis()
        ip_count = await redis.incr(ip_key)
        if ip_count == 1:
            await redis.expire(ip_key, 3600)
        global_count = await redis.incr(global_key)
        if global_count == 1:
            await redis.expire(global_key, 3600)
    except Exception as exc:  # Redis unavailable — don't block the demo
        logger.warning(f"AI rate limiter unavailable, allowing request: {exc}")
        return

    if ip_count > settings.AI_RATE_LIMIT_PER_HOUR:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                f"Rate limit exceeded ({settings.AI_RATE_LIMIT_PER_HOUR} questions/hour). "
                "Please try again later."
            ),
        )
    if global_count > settings.AI_RATE_LIMIT_GLOBAL_PER_HOUR:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="The assistant is busy right now. Please try again in a bit.",
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


@router.post(
    "/chat/stream",
    summary="Ask the portfolio assistant (streaming)",
    description="Same grounded Q&A as /chat, but streams the reply as Server-Sent "
    "Events — a 'sources' event, then 'token' events, then 'done' — so the answer "
    "renders progressively instead of after a single long wait.",
)
async def chat_stream(payload: ChatRequest, request: Request) -> StreamingResponse:
    # Gate + validate + rate-limit BEFORE the stream opens, so these surface as
    # normal HTTP errors (503/400/429) rather than mid-stream events.
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

    async def event_stream():
        try:
            async for event in rag_service.answer_stream(question):
                yield f"data: {json.dumps(event)}\n\n"
        except Exception as exc:  # stream already open — report as an SSE error event
            logger.error(f"AI chat stream error: {exc}")
            yield "data: " + json.dumps(
                {"type": "error", "detail": "The AI assistant is temporarily unavailable."}
            ) + "\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post(
    "/agent",
    response_model=AgentResponse,
    summary="Ask the tool-using portfolio agent",
    description="Ask a question and watch an LLM agent decide which tools to call "
    "(portfolio search, calculator, current date), execute them, and synthesize a "
    "grounded answer — returning its full tool-call trace.",
)
async def agent(payload: ChatRequest, request: Request) -> AgentResponse:
    if not settings.AI_CHAT_ENABLED or not agent_service.enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The AI agent is not configured. Start a local Ollama server "
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
        result = await agent_service.run(question)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"AI agent error: {exc}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The AI agent is temporarily unavailable. Please try again.",
        )

    logger.info(
        "AI agent answered",
        extra={
            "question": question[:120],
            "steps": len(result["steps"]),
            "tokens": result["tokens_used"],
        },
    )
    return AgentResponse(**result)


@router.post(
    "/generate",
    response_model=GenerateResponse,
    summary="Generate tailored content grounded in the resume",
    description="Generate a cover letter, elevator pitch, or LinkedIn intro tailored "
    "to a target role — grounded in Jose's resume so it never invents experience.",
)
async def generate(payload: GenerateRequest, request: Request) -> GenerateResponse:
    if not settings.AI_CHAT_ENABLED or not content_service.enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The content generator is not configured. Start a local Ollama "
            "server or set OPENAI_API_KEY to enable it.",
        )

    if len(payload.brief) > settings.AI_MAX_QUESTION_CHARS * 4:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Brief is too long.")

    await _enforce_rate_limit(request)

    try:
        result = await content_service.generate(
            payload.brief, payload.format, payload.tone
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"AI content generation error: {exc}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The content generator is temporarily unavailable. Please try again.",
        )

    logger.info(
        "AI content generated",
        extra={"format": payload.format, "tone": payload.tone, "tokens": result["tokens_used"]},
    )
    return GenerateResponse(**result)


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
