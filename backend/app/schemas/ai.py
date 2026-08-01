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


class GenerateRequest(BaseModel):
    """A brief for the tailored-content generator (e.g. a role or job description)."""

    brief: str = Field(
        default="",
        max_length=2000,
        description="A target role or job description to tailor the content to. Optional.",
        examples=["Senior AI Engineer focused on RAG systems and agentic workflows"],
    )
    format: str = Field(
        default="elevator_pitch",
        description="cover_letter | elevator_pitch | linkedin_intro",
    )
    tone: str = Field(
        default="professional",
        description="professional | conversational | punchy",
    )


class GenerateResponse(BaseModel):
    """Generated content grounded in Jose's resume, with the sources it drew on."""

    content: str
    sources: List[Source] = []
    model: str
    tokens_used: int = 0


class ClientErrorReport(BaseModel):
    """A browser-side failure beaconed for diagnosis (e.g. mobile streaming errors).

    Sent fire-and-forget from the client when an AI feature fails. Fields are size-
    capped so a direct POST can't flood logs; the client pre-truncates free text.
    """

    component: str = Field(default="unknown", max_length=40, description="Which UI feature failed, e.g. ai-chat.")
    stage: str = Field(default="unknown", max_length=40, description="Where it failed: fetch | response | stream-open | stream-read | http-error | no-stream-body.")
    name: str = Field(default="", max_length=200, description="Error name/type, e.g. TypeError.")
    message: str = Field(default="", max_length=600, description="Error message (client-truncated).")
    status: int | None = Field(default=None, description="HTTP status of the failed response, if any.")
    has_body: bool | None = Field(default=None, description="Whether the response exposed a streaming body.")
    streams_supported: bool | None = Field(default=None, description="Whether the browser reports fetch-streaming support.")
    url: str = Field(default="", max_length=500, description="Page URL where the error occurred.")
    ua: str = Field(default="", max_length=400, description="Client user-agent (falls back to the request header).")
