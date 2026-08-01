/**
 * Best-effort client-side error telemetry for the AI features.
 *
 * The AI chat is the only feature that consumes a streaming `fetch` response
 * (`res.body.getReader()`), which behaves differently across browsers — notably
 * iOS Safari/WebKit. When something throws we can't see it, so we beacon a small
 * diagnostic to the backend (`POST /api/v1/ai/client-error`) where it lands in the
 * server logs. This is fire-and-forget and must NEVER throw or block the UI.
 */

export interface ClientErrorReport {
  /** Which UI feature failed, e.g. "ai-chat". */
  component: string;
  /** Where it failed: fetch | response | stream-open | stream-read | http-error | no-stream-body. */
  stage: string;
  name?: string;
  message?: string;
  status?: number;
  has_body?: boolean;
  streams_supported?: boolean;
  url?: string;
  ua?: string;
}

/** Whether this browser reports the pieces needed to read a streamed fetch body. */
export function streamingSupported(): boolean {
  return (
    typeof ReadableStream !== 'undefined' &&
    typeof TextDecoder !== 'undefined' &&
    typeof Response !== 'undefined' &&
    // `body` is defined on the Response prototype where fetch-streaming is real.
    'body' in Response.prototype
  );
}

/** Turn a thrown value (+ optional response) into a compact, log-safe snapshot. */
export function describeError(
  err: unknown,
  res?: Response | null,
): Pick<ClientErrorReport, 'name' | 'message' | 'status' | 'has_body'> {
  const e = err as { name?: string; message?: string } | undefined;
  return {
    name: e?.name || 'Error',
    message: (e?.message || String(err)).slice(0, 500),
    status: res?.status,
    has_body: res ? Boolean(res.body) : undefined,
  };
}

/** Beacon a client error to the backend. Swallows every failure by design. */
export function reportClientError(baseUrl: string, report: ClientErrorReport): void {
  try {
    const body = JSON.stringify({
      ua: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      url: typeof window !== 'undefined' ? window.location.href : '',
      streams_supported: streamingSupported(),
      ...report,
    });
    // keepalive lets the request survive a navigation/unload; CORS handles the
    // cross-origin POST to the API. sendBeacon isn't used because a JSON
    // content-type would force a preflight it can't perform cross-origin.
    void fetch(`${baseUrl}/api/v1/ai/client-error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* diagnostics must never break the UI */
  }
}
