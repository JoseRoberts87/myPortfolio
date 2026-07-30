'use client';

import { useState } from 'react';

interface Source {
  id: string;
  title: string;
  score: number;
}

interface GenerateResult {
  content: string;
  sources: Source[];
  model?: string;
  tokensUsed?: number;
}

const SUGGESTED_BRIEFS = [
  'Senior AI Engineer — RAG systems & agentic workflows',
  'Staff Data Engineer — real-time streaming on AWS',
  'ML Engineer — time-series forecasting & MLOps',
  'Head of Data & AI — team leadership',
];

const FORMATS = [
  { value: 'elevator_pitch', label: 'Elevator pitch' },
  { value: 'cover_letter', label: 'Cover letter' },
  { value: 'linkedin_intro', label: 'LinkedIn intro' },
];

const TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'punchy', label: 'Punchy' },
];

export default function ContentGenerator() {
  const [brief, setBrief] = useState('');
  const [format, setFormat] = useState('elevator_pitch');
  const [tone, setTone] = useState('professional');
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const generate = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setCopied(false);

    try {
      const res = await fetch(`${baseUrl}/api/v1/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, format, tone }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.detail || 'The generator is unavailable right now.');
      } else {
        setResult({
          content: data.content,
          sources: data.sources || [],
          model: data.model,
          tokensUsed: data.tokens_used,
        });
      }
    } catch {
      setError(
        'Could not reach the generator. If you are running this locally, make sure the backend is running on port 8000.',
      );
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard?.writeText(result.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  const selectClass =
    'bg-surface border border-subtle focus:border-purple-500 rounded-lg px-3 py-2 text-foreground outline-none transition-colors disabled:opacity-60';

  return (
    <div className="bg-surface border border-subtle rounded-2xl shadow-xl p-4 sm:p-6 space-y-5">
      {/* Brief */}
      <div>
        <label htmlFor="gen-brief" className="block text-sm font-medium text-foreground mb-1.5">
          Target role or job description
        </label>
        <textarea
          id="gen-brief"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Paste a role or job description — or leave blank for a general pitch…"
          maxLength={2000}
          rows={3}
          disabled={loading}
          className="w-full bg-sunken border border-subtle focus:border-purple-500 rounded-lg px-4 py-3 text-foreground placeholder-slate-400 dark:placeholder-gray-500 outline-none transition-colors resize-y disabled:opacity-60"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {SUGGESTED_BRIEFS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBrief(b)}
              disabled={loading}
              className="text-xs text-accent bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-full px-3 py-1 transition-colors disabled:opacity-60"
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="gen-format" className="block text-sm font-medium text-foreground mb-1.5">
            Format
          </label>
          <select
            id="gen-format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            disabled={loading}
            className={selectClass}
          >
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="gen-tone" className="block text-sm font-medium text-foreground mb-1.5">
            Tone
          </label>
          <select
            id="gen-tone"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            disabled={loading}
            className={selectClass}
          >
            {TONES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg transition-colors ml-auto"
        >
          {loading ? 'Generating…' : 'Generate'}
        </button>
      </div>

      {/* Output */}
      {loading && (
        <div
          className="flex items-center gap-2 text-muted text-sm"
          role="status"
          aria-label="Generating content"
        >
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
          Writing a tailored draft, grounded in the résumé…
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-sunken border border-subtle rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-faint uppercase tracking-wide">Generated draft</p>
            <button
              type="button"
              onClick={copy}
              className="text-xs text-accent hover:text-purple-300 border border-purple-500/30 rounded-md px-2.5 py-1 transition-colors"
            >
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
          <p className="text-body whitespace-pre-wrap leading-relaxed">{result.content}</p>

          {result.sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-subtle">
              <p className="text-xs text-muted mb-1.5">Grounded in</p>
              <div className="flex flex-wrap gap-1.5">
                {result.sources.map((s) => (
                  <span
                    key={s.id}
                    className="text-xs text-accent bg-purple-500/10 border border-purple-500/20 rounded px-2 py-0.5"
                  >
                    {s.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.model && (
            <p className="text-xs text-faint mt-3">
              {result.model}
              {result.tokensUsed ? ` · ${result.tokensUsed} tokens` : ''} · grounded in Jose&apos;s
              résumé, not invented
            </p>
          )}
        </div>
      )}
    </div>
  );
}
