'use client';

import { useState, useRef, useEffect } from 'react';
import {
  apiErrorMessage,
  networkErrorMessage,
  STREAM_LOST_NOTICE,
  timeoutSignal,
  FETCH_TIMEOUT_MS,
} from '@/lib/aiErrors';
import { useAiHealth } from '@/hooks/useAiHealth';
import AiOfflineState from '@/components/AiOfflineState';
import { apiBaseUrl } from '@/lib/apiBase';

interface AgentStep {
  tool: string;
  arguments: Record<string, unknown>;
  result: string;
}

interface AgentTurn {
  question: string;
  answer?: string;
  steps: AgentStep[];
  model?: string;
  tokensUsed?: number;
  error?: boolean;
  /** Non-destructive note (e.g. stream lost after partial output) — trace is kept. */
  notice?: string;
}

const SUGGESTED_QUESTIONS = [
  'How many years of experience does Jose have in total?',
  'What efficiency gain did Jose create at Bank of America?',
  'What were the measurable results at Amazon Robotics and Evonik?',
  'How long did Jose work at Very Technology?',
];

const TOOL_META: Record<string, { icon: string; label: string }> = {
  search_portfolio: { icon: '🔎', label: 'Searched the portfolio' },
  calculate: { icon: '🧮', label: 'Ran a calculation' },
  get_current_date: { icon: '📅', label: 'Checked the date' },
};

function formatArgs(args: Record<string, unknown>): string {
  const entries = Object.entries(args || {});
  if (entries.length === 0) return '';
  return entries.map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`).join(', ');
}

export default function AgentDemo() {
  const [turns, setTurns] = useState<AgentTurn[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Remembered so the "Try again" button on an error state can resend (#211).
  const lastQuestion = useRef('');

  const baseUrl = apiBaseUrl();
  const health = useAiHealth(baseUrl);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns, loading]);

  // Replace the most recent turn (the one currently streaming). Pure — the
  // updater may be double-invoked in StrictMode, so it must not mutate.
  const updateTurn = (fn: (turn: AgentTurn) => AgentTurn) => {
    setTurns((t) => {
      const next = [...t];
      next[next.length - 1] = fn(next[next.length - 1]);
      return next;
    });
  };

  const send = async (question: string) => {
    const q = question.trim();
    if (!q || loading) return;

    lastQuestion.current = q;
    setInput('');
    setTurns((t) => [...t, { question: q, steps: [] }]);
    setLoading(true);

    // Bound time-to-first-byte; cleared once headers arrive so long agent runs
    // aren't cut off mid-stream (#211).
    const timeout = timeoutSignal(FETCH_TIMEOUT_MS);
    try {
      // SSE stream (issue #171): tool-call steps arrive as they execute, so the
      // trace builds live instead of appearing all at once after the wait.
      const res = await fetch(`${baseUrl}/api/v1/ai/agent/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
        signal: timeout.signal,
      });
      timeout.clear();

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        updateTurn((turn) => ({
          ...turn,
          answer: apiErrorMessage(data, 'The agent is unavailable right now.'),
          error: true,
        }));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE frames are separated by a blank line; keep any trailing partial frame.
        const frames = buffer.split('\n\n');
        buffer = frames.pop() || '';
        for (const frame of frames) {
          const line = frame.trim();
          if (!line.startsWith('data:')) continue;
          let event: Record<string, unknown>;
          try {
            event = JSON.parse(line.slice(5).trim());
          } catch {
            continue;
          }
          if (event.type === 'model') {
            updateTurn((turn) => ({ ...turn, model: event.model as string }));
          } else if (event.type === 'step') {
            updateTurn((turn) => ({
              ...turn,
              steps: [
                ...turn.steps,
                {
                  tool: event.tool as string,
                  arguments: (event.arguments as Record<string, unknown>) || {},
                  result: (event.result as string) || '',
                },
              ],
            }));
          } else if (event.type === 'answer') {
            updateTurn((turn) => ({ ...turn, answer: (event.text as string) || '' }));
          } else if (event.type === 'done') {
            updateTurn((turn) => ({ ...turn, tokensUsed: (event.tokens_used as number) || undefined }));
          } else if (event.type === 'error') {
            // Preserve partial progress: keep any streamed steps/answer and
            // append a notice instead of wiping the trace (#211).
            updateTurn((turn) =>
              turn.answer || turn.steps.length > 0
                ? { ...turn, notice: STREAM_LOST_NOTICE }
                : {
                    ...turn,
                    answer: (event.detail as string) || 'The agent is unavailable right now.',
                    error: true,
                  },
            );
          }
        }
      }
    } catch {
      timeout.clear();
      updateTurn((turn) =>
        turn.answer || turn.steps.length > 0
          ? { ...turn, notice: STREAM_LOST_NOTICE }
          : { ...turn, answer: networkErrorMessage('agent'), error: true },
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  // Health-gated offline state (#210): never offer a dead input.
  if (health === 'offline') {
    return (
      <AiOfflineState
        title="The agent is offline right now"
        description="This demo shows an LLM agent choosing tools — portfolio search, a calculator, today's date — and chaining them into a grounded answer, with every tool call traced live."
        sample={
          <div className="space-y-2 text-sm">
            <p className="text-muted">
              <span className="font-medium text-foreground">Q:</span> How many years of
              experience does Jose have in total?
            </p>
            <p className="bg-sunken border border-subtle rounded-lg px-3 py-2 font-mono text-xs text-muted">
              1. 🔎 search_portfolio(query: career start) → started in 2011 · 2. 🧮
              calculate(2026 - 2011) → 15.0
            </p>
            <p className="text-muted">
              <span className="font-medium text-foreground">A:</span> Jose has about 15 years
              of professional experience, starting in 2011.
            </p>
          </div>
        }
      />
    );
  }

  return (
    <div className="bg-surface border border-subtle rounded-2xl shadow-xl overflow-hidden flex flex-col h-[70vh] max-h-[640px]">
      {/* Conversation */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {turns.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-4xl mb-3">🧠</div>
            <p className="text-muted mb-2 max-w-md">
              Ask a question and watch the agent decide which tools to call — portfolio
              search, a calculator, and today&apos;s date — then chain them into a grounded answer.
            </p>
            <p className="text-faint text-xs mb-6">Each tool call is shown as it happens.</p>
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-sm text-accent bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-2 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {turns.map((turn, i) => (
          <div key={i} className="space-y-3">
            {/* User question */}
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-purple-600 text-white">
                <p className="whitespace-pre-wrap leading-relaxed">{turn.question}</p>
              </div>
            </div>

            {/* Tool-call trace */}
            {turn.steps.length > 0 && (
              <div className="max-w-[95%]">
                <p className="text-xs text-faint mb-2 flex items-center gap-1.5">
                  <span aria-hidden>⚙️</span> Tool calls
                </p>
                <ol className="space-y-2">
                  {turn.steps.map((step, j) => {
                    const meta = TOOL_META[step.tool] || { icon: '🔧', label: step.tool };
                    const args = formatArgs(step.arguments);
                    return (
                      <li
                        key={j}
                        className="bg-sunken border border-subtle rounded-lg px-3 py-2 text-sm"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-faint tabular-nums">{j + 1}.</span>
                          <span aria-hidden>{meta.icon}</span>
                          <span className="font-medium text-foreground">{meta.label}</span>
                          <code className="text-accent bg-purple-500/10 rounded px-1.5 py-0.5 text-xs">
                            {step.tool}
                            {args ? `(${args})` : '()'}
                          </code>
                        </div>
                        <div className="mt-1.5 pl-6 text-muted font-mono text-xs break-words line-clamp-3">
                          → {step.result}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}

            {/* Final answer */}
            {turn.answer !== undefined && (
              <div className="flex justify-start">
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    turn.error
                      ? 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300'
                      : 'bg-sunken border border-subtle text-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{turn.answer}</p>
                  {!turn.error && turn.model && (
                    <p className="text-xs text-faint mt-2">
                      {turn.steps.length} tool call{turn.steps.length === 1 ? '' : 's'} ·{' '}
                      {turn.model}
                      {turn.tokensUsed ? ` · ${turn.tokensUsed} tokens` : ''}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Stream-lost notice + retry (partial progress is preserved above) */}
            {(turn.notice || turn.error) && !loading && (
              <div className="flex justify-start">
                <div className="text-xs space-y-1">
                  {turn.notice && (
                    <p className="text-amber-700 dark:text-amber-400">{turn.notice}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => send(lastQuestion.current)}
                    className="font-semibold text-accent hover:text-accent-strong underline underline-offset-2"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-sunken border border-subtle rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-muted text-sm" role="status" aria-label="Agent is working">
                <span className="flex gap-1.5">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                  <span
                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.15s' }}
                  />
                  <span
                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.3s' }}
                  />
                </span>
                Agent is working — calling tools…
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-subtle p-3 sm:p-4 flex gap-2 bg-surface-alt"
      >
        <label htmlFor="agent-input" className="sr-only">
          Ask the tool-using agent
        </label>
        <input
          id="agent-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something that needs a tool…"
          maxLength={500}
          disabled={loading}
          className="flex-1 bg-surface border border-subtle focus:border-purple-500 rounded-lg px-4 py-3 text-foreground placeholder-slate-400 dark:placeholder-gray-500 outline-none transition-colors disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold px-5 rounded-lg transition-colors"
        >
          Run
        </button>
      </form>
    </div>
  );
}
