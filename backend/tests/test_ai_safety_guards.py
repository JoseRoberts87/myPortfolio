"""Regression guards for AI safety (issue #170).

These lock in two things that unit tests otherwise can't catch, because the LLM
is mocked everywhere else:
  1. The system prompts still carry their grounding / anti-fabrication / tool
     constraints — a silent edit that weakens safety fails CI here.
  2. The knowledge base stays well-formed (unique ids, required keys).

(The third #170 item — rate-limit *enforcement* — is covered by test_ai_ratelimit.py.)
"""
from app.services.agent_service import AGENT_SYSTEM_PROMPT
from app.services.content_service import GEN_SYSTEM_PROMPT
from app.services.portfolio_knowledge import KNOWLEDGE_CHUNKS
from app.services.rag_service import SYSTEM_PROMPT as RAG_SYSTEM_PROMPT


class TestSafetyPrompts:
    def test_rag_prompt_stays_grounded(self):
        p = RAG_SYSTEM_PROMPT.lower()
        assert "only the provided context" in p             # answer only from context
        assert "third person" in p
        # anti-hallucination fallback
        assert "does not contain the answer" in p
        assert "rather than guessing" in p

    def test_agent_prompt_constrains_tools_and_output(self):
        p = AGENT_SYSTEM_PROMPT.lower()
        assert "using tools" in p and "not by guessing" in p
        assert "literal values only" in p                   # no nested tool calls
        assert "never put a tool call" in p
        assert "never include json" in p                    # clean prose final answer
        assert "base every factual claim on the tool results" in p

    def test_generator_prompt_forbids_fabrication(self):
        p = GEN_SYSTEM_PROMPT.lower()
        assert "first person" in p
        assert "only the facts in the provided context" in p
        assert "never invent" in p


class TestKnowledgeBaseConsistency:
    def test_has_a_reasonable_number_of_chunks(self):
        assert len(KNOWLEDGE_CHUNKS) >= 10

    def test_every_chunk_is_well_formed(self):
        for chunk in KNOWLEDGE_CHUNKS:
            assert {"id", "title", "text"} <= set(chunk), f"missing keys: {chunk}"
            assert chunk["id"].strip(), "empty id"
            assert chunk["title"].strip(), f"empty title for {chunk['id']}"
            assert chunk["text"].strip(), f"empty text for {chunk['id']}"

    def test_ids_are_unique(self):
        ids = [chunk["id"] for chunk in KNOWLEDGE_CHUNKS]
        assert len(ids) == len(set(ids)), f"duplicate ids: {ids}"
