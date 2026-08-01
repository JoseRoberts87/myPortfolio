'use client';

import { useState } from 'react';
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
  /** Non-destructive note (e.g. stream lost after partial output) — draft is kept. */
  notice?: string;
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

  const baseUrl = apiBaseUrl();
  const health = useAiHealth(baseUrl);

  const generate = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setCopied(false);

    // Bound time-to-first-byte; cleared once headers arrive so long drafts
    // aren't cut off mid-stream (#211).
    const timeout = timeoutSignal(FETCH_TIMEOUT_MS);
    // Tracks whether any draft text has streamed, so failures can preserve it.
    let streamedChars = 0;
    try {
      // SSE stream (issue #171): the draft renders as it is written instead of
      // after one long reasoning-model wait.
      const res = await fetch(`${baseUrl}/api/v1/ai/generate/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, format, tone }),
        signal: timeout.signal,
      });
      timeout.clear();

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        setError(apiErrorMessage(data, 'The generator is unavailable right now.'));
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
          if (event.type === 'sources') {
            setResult((r) => ({
              content: r?.content || '',
              sources: (event.sources as Source[]) || [],
              model: event.model as string,
              tokensUsed: r?.tokensUsed,
            }));
          } else if (event.type === 'token') {
            streamedChars += ((event.text as string) || '').length;
            setResult((r) => ({
              content: (r?.content || '') + ((event.text as string) || ''),
              sources: r?.sources || [],
              model: r?.model,
              tokensUsed: r?.tokensUsed,
            }));
          } else if (event.type === 'done') {
            setResult((r) =>
              r ? { ...r, tokensUsed: (event.tokens_used as number) || undefined } : r,
            );
          } else if (event.type === 'error') {
            // Preserve a partially-written draft with a notice; only fall to the
            // error state when nothing streamed yet (#211).
            if (streamedChars > 0) {
              setResult((r) => (r ? { ...r, notice: STREAM_LOST_NOTICE } : r));
            } else {
              setResult(null);
              setError(
                (event.detail as string) || 'The generator is unavailable right now.',
              );
            }
          }
        }
      }
    } catch {
      timeout.clear();
      if (streamedChars > 0) {
        setResult((r) => (r ? { ...r, notice: STREAM_LOST_NOTICE } : r));
      } else {
        setResult(null);
        setError(networkErrorMessage('generator'));
      }
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

  // Health-gated offline state (#210): never offer a dead form.
  if (health === 'offline') {
    return (
      <AiOfflineState
        title="The generator is offline right now"
        description="This demo writes a role-tailored elevator pitch, cover letter, or LinkedIn intro — grounded in Jose's real résumé so it never invents experience."
        sample={
          <blockquote className="bg-sunken border border-subtle rounded-lg px-4 py-3 text-sm text-muted italic">
            &ldquo;I&apos;m a Data &amp; AI Architect with 15+ years of experience turning
            data platforms into production AI systems — most recently designing agentic
            data ingestion on Databricks that helped a Fortune 500 team grow their
            analytics platform by 72%.&rdquo;
          </blockquote>
        }
      />
    );
  }

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
          <p>{error}</p>
          <button
            type="button"
            onClick={generate}
            disabled={loading}
            className="mt-2 text-xs font-semibold text-accent hover:text-accent-strong underline underline-offset-2"
          >
            Try again
          </button>
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

          {result.notice && (
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">{result.notice}</p>
          )}

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
