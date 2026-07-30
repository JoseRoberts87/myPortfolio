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

  const send = async (question: string) => {
    const q = question.trim();
    if (!q || loading) return;

    setInput('');
    setMessages((m) => [...m, { role: 'user', content: q }]);
    setLoading(true);

    try {
      const res = await fetch(`${baseUrl}/api/v1/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const detail =
          data?.error?.message || data?.detail || 'The assistant is unavailable right now.';
        setMessages((m) => [...m, { role: 'assistant', content: detail, error: true }]);
      } else {
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: data.answer, sources: data.sources },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content:
            'Could not reach the AI service. If you are running this locally, make sure the backend is running on port 8000.',
          error: true,
        },
      ]);
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
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

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

        {loading && (
          <div className="flex justify-start">
            <div className="bg-sunken border border-subtle rounded-2xl px-4 py-3">
              <div className="flex gap-1.5" role="status" aria-label="Assistant is typing">
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
            </div>
          </div>
        )}
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
