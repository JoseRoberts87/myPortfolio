'use client';

import { useState, useRef, useEffect } from 'react';

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

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

    setInput('');
    setTurns((t) => [...t, { question: q, steps: [] }]);
    setLoading(true);

    try {
      // SSE stream (issue #171): tool-call steps arrive as they execute, so the
      // trace builds live instead of appearing all at once after the wait.
      const res = await fetch(`${baseUrl}/api/v1/ai/agent/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        updateTurn((turn) => ({
          ...turn,
          answer: data?.detail || 'The agent is unavailable right now.',
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
            updateTurn((turn) => ({
              ...turn,
              answer: (event.detail as string) || 'The agent is unavailable right now.',
              error: true,
            }));
          }
        }
      }
    } catch {
      updateTurn((turn) => ({
        ...turn,
        answer:
          'Could not reach the agent. If you are running this locally, make sure the backend is running on port 8000.',
        error: true,
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

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
