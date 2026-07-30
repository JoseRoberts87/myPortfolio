"""
Retrieval-Augmented Generation (RAG) service for the "Ask my portfolio" chat.

Embeds a small, curated knowledge base of Jose's portfolio (computed once and
cached in memory), retrieves the most relevant chunks per question via cosine
similarity, and generates a grounded answer with a chat model.

Provider-agnostic: it obtains its client and model names from `app.core.llm`,
so it runs against a local Ollama server in development and OpenAI in
production with no code change — only configuration.
"""
from __future__ import annotations

import asyncio
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

from app.core.config import settings
from app.core.llm import (
    get_llm_client,
    is_configured,
    resolve_chat_model,
    resolve_embed_model,
)
from app.core.logging_config import get_logger
from app.services.portfolio_knowledge import KNOWLEDGE_CHUNKS

logger = get_logger(__name__)

SYSTEM_PROMPT = (
    "You are the portfolio assistant for Jose Roberts, a Data & AI Architect with "
    "15+ years of experience. Answer questions about Jose's experience, skills, "
    "projects, and background using ONLY the provided context. Be concise, specific, "
    "and professional — you are speaking to recruiters and hiring managers. Prefer "
    "concrete numbers and technologies from the context. If the context does not "
    "contain the answer, say you don't have that information rather than guessing. "
    "Always refer to Jose in the third person."
)


class RagService:
    """In-memory RAG over the portfolio knowledge base."""

    def __init__(self) -> None:
        self._embeddings: Optional[np.ndarray] = None
        self._lock = asyncio.Lock()

    @property
    def enabled(self) -> bool:
        """True when an LLM provider is usable (Ollama locally, or OpenAI with a key)."""
        return is_configured()

    async def _embed(self, texts: List[str]) -> np.ndarray:
        resp = await get_llm_client().embeddings.create(
            model=resolve_embed_model(),
            input=texts,
        )
        return np.array([d.embedding for d in resp.data], dtype=np.float32)

    async def _ensure_index(self) -> None:
        """Embed the knowledge base exactly once."""
        if self._embeddings is not None:
            return
        async with self._lock:
            if self._embeddings is not None:  # double-checked under lock
                return
            texts = [chunk["text"] for chunk in KNOWLEDGE_CHUNKS]
            logger.info(f"Embedding {len(texts)} portfolio knowledge chunks")
            self._embeddings = await self._embed(texts)

    @staticmethod
    def _cosine_scores(query: np.ndarray, matrix: np.ndarray) -> np.ndarray:
        q = query / (np.linalg.norm(query) + 1e-8)
        m = matrix / (np.linalg.norm(matrix, axis=1, keepdims=True) + 1e-8)
        return m @ q

    async def retrieve(self, question: str, top_k: int) -> List[Tuple[Dict[str, str], float]]:
        """Return the top-k knowledge chunks most similar to the question."""
        await self._ensure_index()
        query_emb = (await self._embed([question]))[0]
        assert self._embeddings is not None
        scores = self._cosine_scores(query_emb, self._embeddings)
        top_idx = np.argsort(scores)[::-1][:top_k]
        return [(KNOWLEDGE_CHUNKS[i], float(scores[i])) for i in top_idx]

    async def answer(self, question: str) -> Dict[str, Any]:
        """Generate a grounded answer with cited sources."""
        if not self.enabled:
            raise RuntimeError("No LLM provider is configured")

        retrieved = await self.retrieve(question, settings.AI_RETRIEVAL_TOP_K)
        context = "\n\n".join(
            f"[{chunk['title']}]\n{chunk['text']}" for chunk, _ in retrieved
        )

        model = resolve_chat_model()
        completion = await get_llm_client().chat.completions.create(
            model=model,
            temperature=0.2,
            max_tokens=settings.AI_MAX_ANSWER_TOKENS,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"},
            ],
        )

        answer_text = (completion.choices[0].message.content or "").strip()
        tokens = completion.usage.total_tokens if completion.usage else 0
        sources = [
            {"id": chunk["id"], "title": chunk["title"], "score": round(score, 3)}
            for chunk, score in retrieved
        ]
        return {
            "answer": answer_text,
            "sources": sources,
            "model": model,
            "tokens_used": tokens,
        }


rag_service = RagService()
