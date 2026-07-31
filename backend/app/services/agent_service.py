"""
Tool-using agent for the portfolio "AI Agents" showcase.

Demonstrates agentic AI: an LLM that decides which tools to call, executes them,
chains the results, and synthesizes a grounded final answer — while exposing its
full tool-call trace so the behavior is visible, not a black box.

Provider-agnostic via app.core.llm: it uses OpenAI-style function/tool calling,
which works against a local Ollama server (gpt-oss:20b) in development and Ollama
Cloud in production with no code change — only configuration.
"""
from __future__ import annotations

import ast
import json
import operator
from datetime import date
from typing import Any, Dict, List

from app.core.config import settings
from app.core.llm import get_llm_client, is_configured, resolve_chat_model
from app.core.logging_config import get_logger
from app.services.rag_service import rag_service

logger = get_logger(__name__)

AGENT_SYSTEM_PROMPT = (
    "You are Jose Roberts' agentic portfolio assistant. You answer questions about "
    "Jose — a Data & AI Architect with 15+ years of experience — by USING TOOLS, not "
    "by guessing.\n"
    "Tools:\n"
    "- `search_portfolio(query)`: look up facts about his experience, roles, skills, and projects.\n"
    "- `calculate(expression)`: evaluate PLAIN arithmetic only, e.g. '2026 - 2011' or '0.83 * 100'.\n"
    "- `get_current_date()`: today's date.\n"
    "Rules:\n"
    "1. Tool arguments must be literal values ONLY. NEVER put a tool call, function name, "
    "or text like 'search_portfolio(...)' inside another tool's argument.\n"
    "2. To combine tools, call them in separate steps: first call `search_portfolio` and READ "
    "its result, then call `calculate` using the plain numbers you found (for example, after "
    "finding 2011 and 2018, call calculate('2018 - 2011')).\n"
    "3. When you have enough information, STOP calling tools and write a concise, professional "
    "final answer in the third person. The final answer must be plain prose for a recruiter — "
    "never include JSON, tool names, code, or function-call syntax. Base every factual claim on "
    "the tool results."
)

# --- Safe arithmetic evaluator (numbers + - * / ** // % and parentheses only) ---
_ALLOWED_BINOPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.Mod: operator.mod,
    ast.FloorDiv: operator.floordiv,
}
_ALLOWED_UNARY = {ast.UAdd: operator.pos, ast.USub: operator.neg}


def _safe_eval(expression: str) -> float:
    """Evaluate a basic arithmetic expression without executing arbitrary code."""

    def _eval(node: ast.AST) -> float:
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return float(node.value)
        if isinstance(node, ast.BinOp) and type(node.op) in _ALLOWED_BINOPS:
            return _ALLOWED_BINOPS[type(node.op)](_eval(node.left), _eval(node.right))
        if isinstance(node, ast.UnaryOp) and type(node.op) in _ALLOWED_UNARY:
            return _ALLOWED_UNARY[type(node.op)](_eval(node.operand))
        raise ValueError(
            "calculate accepts plain arithmetic only, e.g. '2026 - 2011'. "
            "Look up any numbers with search_portfolio first, then pass literal numbers here."
        )

    return _eval(ast.parse(expression, mode="eval").body)


TOOLS_SCHEMA: List[Dict[str, Any]] = [
    {
        "type": "function",
        "function": {
            "name": "search_portfolio",
            "description": (
                "Search Jose's portfolio knowledge base (resume, roles, skills, "
                "projects, case studies) and return the most relevant facts."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "What to look up, e.g. 'Amazon Robotics results'.",
                    },
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "calculate",
            "description": (
                "Evaluate a basic arithmetic expression and return the result. Use for "
                "years of experience, percentages, sums, etc."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {
                        "type": "string",
                        "description": "e.g. '2026 - 2011' or '0.83 * 100'.",
                    },
                },
                "required": ["expression"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_current_date",
            "description": "Return today's date in ISO format (YYYY-MM-DD).",
            "parameters": {"type": "object", "properties": {}},
        },
    },
]


class AgentService:
    """A small, safe, tool-using agent over the portfolio knowledge base."""

    @property
    def enabled(self) -> bool:
        """True when an LLM provider is usable (Ollama locally, or OpenAI with a key)."""
        return is_configured()

    async def _search_portfolio(self, query: str) -> str:
        retrieved = await rag_service.retrieve(query, settings.AI_AGENT_SEARCH_TOP_K)
        if not retrieved:
            return "No matching information found."
        return "\n\n".join(f"[{chunk['title']}] {chunk['text']}" for chunk, _ in retrieved)

    async def _dispatch(self, name: str, args: Dict[str, Any]) -> str:
        """Execute a tool by name. Tool errors are returned as text (fed back to the model)."""
        try:
            if name == "search_portfolio":
                return await self._search_portfolio(str(args.get("query", "")))
            if name == "calculate":
                return str(_safe_eval(str(args.get("expression", ""))))
            if name == "get_current_date":
                return date.today().isoformat()
            return f"Unknown tool: {name}"
        except Exception as exc:  # surfaced to the model so it can recover
            return f"Error running {name}: {exc}"

    async def run(self, question: str) -> Dict[str, Any]:
        """Run the agent loop and return the final answer plus the tool-call trace."""
        if not self.enabled:
            raise RuntimeError("No LLM provider is configured")

        client = get_llm_client()
        model = resolve_chat_model()
        messages: List[Dict[str, Any]] = [
            {"role": "system", "content": AGENT_SYSTEM_PROMPT},
            {"role": "user", "content": question},
        ]
        steps: List[Dict[str, Any]] = []
        total_tokens = 0

        for _ in range(settings.AI_AGENT_MAX_STEPS):
            completion = await client.chat.completions.create(
                model=model,
                temperature=0.1,
                messages=messages,
                tools=TOOLS_SCHEMA,
            )
            if completion.usage:
                total_tokens += completion.usage.total_tokens

            msg = completion.choices[0].message
            tool_calls = msg.tool_calls or []

            if not tool_calls:
                return {
                    "answer": (msg.content or "").strip(),
                    "steps": steps,
                    "model": model,
                    "tokens_used": total_tokens,
                }

            # Record the assistant's tool-call turn, then execute each requested tool.
            messages.append(
                {
                    "role": "assistant",
                    "content": msg.content or "",
                    "tool_calls": [
                        {
                            "id": tc.id,
                            "type": "function",
                            "function": {
                                "name": tc.function.name,
                                "arguments": tc.function.arguments,
                            },
                        }
                        for tc in tool_calls
                    ],
                }
            )
            for tc in tool_calls:
                try:
                    args = json.loads(tc.function.arguments or "{}")
                except json.JSONDecodeError:
                    args = {}
                if not isinstance(args, dict):
                    args = {}
                result = await self._dispatch(tc.function.name, args)
                steps.append(
                    {"tool": tc.function.name, "arguments": args, "result": result}
                )
                messages.append(
                    {"role": "tool", "tool_call_id": tc.id, "content": result}
                )

        # Ran out of tool-calling steps — force a final answer without tools.
        final = await client.chat.completions.create(
            model=model,
            temperature=0.2,
            messages=messages
            + [
                {
                    "role": "user",
                    "content": "Give your final answer now, based on the tool results so far.",
                }
            ],
        )
        if final.usage:
            total_tokens += final.usage.total_tokens
        return {
            "answer": (final.choices[0].message.content or "").strip(),
            "steps": steps,
            "model": model,
            "tokens_used": total_tokens,
        }


agent_service = AgentService()
