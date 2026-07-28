"""
Schemas for the AI assistant ("Ask my portfolio" RAG chat).
"""
from typing import List

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """A question for the portfolio assistant."""

    question: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="A question about Jose's experience, skills, or projects.",
        examples=["What has Jose done with agentic AI?"],
    )


class Source(BaseModel):
    """A retrieved knowledge chunk that grounded the answer."""

    id: str
    title: str
    score: float


class ChatResponse(BaseModel):
    """A grounded answer from the portfolio assistant."""

    answer: str
    sources: List[Source] = []
    model: str
    tokens_used: int = 0
