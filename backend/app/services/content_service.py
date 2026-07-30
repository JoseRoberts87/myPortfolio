"""
GenAI content generator for the portfolio "AI Agents" showcase.

Generates tailored outreach content (a cover letter, elevator pitch, or LinkedIn
intro) that positions Jose for a target role — grounded in his real resume via
retrieval, so it never invents experience, employers, or metrics.

Provider-agnostic via app.core.llm: runs on local Ollama in development and
OpenAI in production with no code change — only configuration.
"""
from __future__ import annotations

from typing import Any, Dict

from app.core.config import settings
from app.core.llm import get_llm_client, is_configured, resolve_chat_model
from app.core.logging_config import get_logger
from app.services.rag_service import rag_service

logger = get_logger(__name__)

# Supported output formats -> a description the model writes to.
FORMATS: Dict[str, str] = {
    "cover_letter": "a concise cover-letter-style pitch of three short paragraphs",
    "elevator_pitch": "a punchy elevator pitch of 4-6 sentences",
    "linkedin_intro": "an approachable LinkedIn-style introduction of 3-4 sentences",
}
DEFAULT_FORMAT = "elevator_pitch"

# Supported tones -> a phrase describing the voice.
TONES: Dict[str, str] = {
    "professional": "professional and confident",
    "conversational": "warm and conversational",
    "punchy": "punchy and high-energy, leading with concrete results",
}
DEFAULT_TONE = "professional"

GEN_SYSTEM_PROMPT = (
    "You are an expert career copywriter writing in the FIRST PERSON as Jose Roberts, "
    "a Data & AI Architect with 15+ years of experience. Using ONLY the facts in the "
    "provided context (his real resume), write compelling, tailored content that "
    "positions him for the target role.\n"
    "Rules:\n"
    "- Use ONLY facts, metrics, employers, and skills that appear in the context. "
    "NEVER invent experience, numbers, companies, or technologies.\n"
    "- Lead with concrete, quantified results where they fit the role.\n"
    "- Keep it tight — no clichés, filler, or buzzword salad.\n"
    "- Output only the content itself: no subject line, no salutation placeholders "
    "like '[Company]', and no markdown headings."
)


class ContentService:
    """Retrieval-grounded generator for tailored portfolio content."""

    @property
    def enabled(self) -> bool:
        """True when an LLM provider is usable (Ollama locally, or OpenAI with a key)."""
        return is_configured()

    async def generate(self, brief: str, fmt: str, tone: str) -> Dict[str, Any]:
        """Generate content for the given brief, format, and tone, grounded in the resume."""
        if not self.enabled:
            raise RuntimeError("No LLM provider is configured")

        brief = (brief or "").strip()
        format_desc = FORMATS.get(fmt, FORMATS[DEFAULT_FORMAT])
        tone_desc = TONES.get(tone, TONES[DEFAULT_TONE])

        # Ground the generation: retrieve the resume facts most relevant to the brief.
        query = brief or "Jose Roberts overview agentic AI, LLMs, data engineering, results"
        retrieved = await rag_service.retrieve(query, settings.AI_GEN_TOP_K)
        context = "\n\n".join(f"[{chunk['title']}] {chunk['text']}" for chunk, _ in retrieved)

        target = brief or "a general Data & AI Architect / Engineer role"
        user_prompt = (
            f"Target role / brief:\n{target}\n\n"
            f"Context (Jose's resume — use only these facts):\n{context}\n\n"
            f"Write {format_desc} in a {tone_desc} tone that positions Jose for this role. "
            "Tailor it to the brief and ground every claim in the context above."
        )

        model = resolve_chat_model()
        completion = await get_llm_client().chat.completions.create(
            model=model,
            temperature=0.6,
            max_tokens=settings.AI_GEN_MAX_TOKENS,
            messages=[
                {"role": "system", "content": GEN_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
        )

        content = (completion.choices[0].message.content or "").strip()
        tokens = completion.usage.total_tokens if completion.usage else 0
        sources = [
            {"id": chunk["id"], "title": chunk["title"], "score": round(score, 3)}
            for chunk, score in retrieved
        ]
        return {
            "content": content,
            "sources": sources,
            "model": model,
            "tokens_used": tokens,
        }


content_service = ContentService()
