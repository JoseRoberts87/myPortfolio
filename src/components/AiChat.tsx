'use client';

import { useState, useRef, useEffect } from 'react';

interface Source {
  id: string;
  title: string;
  score: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  error?: boolean;
  streaming?: boolean;
}

interface StreamEvent {
  type?: string;
  text?: string;
  sources?: Source[];
  detail?: string;
}

const SUGGESTED_QUESTIONS = [
  'What has Jose done with agentic AI?',
  "Summarize Jose's experience with LLMs and generative AI.",
  'What are his biggest measurable results?',
  'What cloud and data-engineering tools does he use?',
  'Tell me about his real-time / IoT work.',
];

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  // Update the most recent assistant message in place (the one being streamed).
  const updateAssistant = (fn: (m: Message) => Message) => {
    setMessages((msgs) => {
      const next = [...msgs];
      for (let i = next.length - 1; i >= 0; i--) {
        if (next[i].role === 'assistant') {
          next[i] = fn(next[i]);
          break;
        }
      }
      return next;
    });
  };

  const send = async (question: string) => {
    const q = question.trim();
    if (!q || loading) return;

    setInput('');
    setMessages((m) => [
      ...m,
      { role: 'user', content: q },
      { role: 'assistant', content: '', streaming: true },
    ]);
    setLoading(true);

    try {
      const res = await fetch(`${baseUrl}/api/v1/ai/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        const detail = data?.detail || 'The assistant is unavailable right now.';
        updateAssistant((m) => ({ ...m, content: detail, error: true, streaming: false }));
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
          let event: StreamEvent;
          try {
            event = JSON.parse(line.slice(5).trim());
          } catch {
            continue;
          }
          if (event.type === 'sources') {
            updateAssistant((m) => ({ ...m, sources: event.sources }));
          } else if (event.type === 'token') {
            updateAssistant((m) => ({ ...m, content: m.content + (event.text || '') }));
          } else if (event.type === 'error') {
            updateAssistant((m) => ({
              ...m,
              content: event.detail || 'The assistant is unavailable right now.',
              error: true,
            }));
          }
        }
      }
      updateAssistant((m) => ({ ...m, streaming: false }));
    } catch {
      updateAssistant((m) => ({
        ...m,
        content:
          'Could not reach the AI service. If you are running this locally, make sure the backend is running on port 8000.',
        error: true,
        streaming: false,
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
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-muted mb-6 max-w-md">
              Ask anything about Jose&apos;s experience, skills, or projects. Answers are grounded
              in his resume and cite their sources.
            </p>
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
            <p className="text-faint text-xs mt-6 max-w-md">
              Conversations may be logged to improve this demo — please don&apos;t share
              sensitive information.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : msg.error
                    ? 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300'
                    : 'bg-sunken border border-subtle text-foreground'
              }`}
            >
              {/* Thinking state: streaming, first token not in yet */}
              {msg.role === 'assistant' && msg.streaming && !msg.content ? (
                <div className="flex gap-1.5" role="status" aria-label="Assistant is thinking">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                  <span
                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.15s' }}
                  />
                  <span
                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.3s' }}
                  />
                </div>
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                  {msg.streaming && msg.content && (
                    <span
                      className="inline-block w-1.5 h-4 ml-0.5 align-text-bottom bg-purple-400 animate-pulse"
                      aria-hidden
                    />
                  )}
                </p>
              )}

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-subtle">
                  <p className="text-xs text-muted mb-1.5">Sources</p>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.sources.map((s) => (
                      <span
                        key={s.id}
                        title={`relevance ${s.score}`}
                        className="text-xs text-accent bg-purple-500/10 border border-purple-500/20 rounded px-2 py-0.5"
                      >
                        {s.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-subtle p-3 sm:p-4 flex gap-2 bg-surface-alt"
      >
        <label htmlFor="ai-chat-input" className="sr-only">
          Ask about Jose&apos;s experience
        </label>
        <input
          id="ai-chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Jose's experience…"
          maxLength={500}
          disabled={loading}
          className="flex-1 bg-surface border border-subtle focus:border-purple-500 rounded-lg px-4 py-3 text-foreground placeholder-slate-400 dark:placeholder-gray-500 outline-none transition-colors disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold px-5 rounded-lg transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
