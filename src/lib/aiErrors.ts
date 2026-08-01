/**
 * Shared error helpers for the AI demos (issues #209 / #211).
 */

/**
 * Extract the human-readable message from a backend error payload.
 *
 * The app's error middleware wraps HTTPException as {"error": {"message": ...}},
 * while FastAPI's own validation errors use {"detail": ...}. The frontend
 * previously read only `detail`, so every friendly backend message (budget
 * "resting", rate limits, kill switch) collapsed into a generic fallback (#209).
 */
export function apiErrorMessage(data: unknown, fallback: string): string {
  const d = data as
    | { error?: { message?: unknown }; detail?: unknown }
    | null
    | undefined;
  const fromEnvelope = d?.error?.message;
  if (typeof fromEnvelope === 'string' && fromEnvelope.trim()) return fromEnvelope;
  if (typeof d?.detail === 'string' && d.detail.trim()) return d.detail;
  return fallback;
}

/**
 * Friendly copy for a network-level failure (fetch threw). The localhost hint
 * is development-only — production visitors get a contact-form nudge instead of
 * developer instructions (#211).
 */
export function networkErrorMessage(feature: string): string {
  const base =
    `The ${feature} is temporarily unavailable. ` +
    'Please try again in a moment — or reach out via the contact form below.';
  if (process.env.NODE_ENV === 'development') {
    return `${base} (dev hint: is the backend running on port 8000?)`;
  }
  return base;
}

/** Non-destructive notice appended when a stream dies after partial output (#211). */
export const STREAM_LOST_NOTICE =
  'Connection lost — the answer above may be incomplete. Try again for a fresh one.';

/**
 * AbortSignal that fires after `ms`, for bounding time-to-first-byte on fetches.
 * Call `clear()` once headers arrive so long streams aren't cut off mid-answer.
 */
export function timeoutSignal(ms: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

/** Time allowed for response headers before a request is treated as hung. */
export const FETCH_TIMEOUT_MS = 20_000;
