"""
Schemas for the AI assistant ("Ask my portfolio" RAG chat + tool-using agent).
"""
from typing import Any, Dict, List

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


class AgentStep(BaseModel):
    """One tool call the agent made while working toward its answer."""

    tool: str
    arguments: Dict[str, Any] = {}
    result: str


class AgentResponse(BaseModel):
    """The agent's final answer plus the trace of tools it used to get there."""

    answer: str
    steps: List[AgentStep] = []
    model: str
    tokens_used: int = 0
