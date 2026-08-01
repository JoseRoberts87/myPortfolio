'use client';

import { useEffect, useState } from 'react';

export type AiHealthStatus = 'checking' | 'online' | 'offline';

// One probe per page load, shared by every demo component on the page. The
// promise is cached module-level so mounting three demos costs one request.
let probe: Promise<boolean> | null = null;

function probeHealth(baseUrl: string): Promise<boolean> {
  if (!probe) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    probe = fetch(`${baseUrl}/api/v1/ai/health`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => Boolean(data?.configured))
      .catch(() => false)
      .finally(() => clearTimeout(timer)) as Promise<boolean>;
  }
  return probe;
}

/** Test-only: forget the cached probe so each test can mock a fresh outcome. */
export function __resetAiHealthProbe() {
  probe = null;
}

/**
 * Availability of the AI backend (issue #210). Optimistic: reports 'checking'
 * immediately (components render their normal UI), and only flips to 'offline'
 * on a definitive failure — unreachable, non-200, or `configured: false` — so
 * visitors never type into a demo that cannot answer.
 */
export function useAiHealth(baseUrl: string): AiHealthStatus {
  const [status, setStatus] = useState<AiHealthStatus>('checking');

  useEffect(() => {
    let cancelled = false;
    probeHealth(baseUrl).then((ok) => {
      if (!cancelled) setStatus(ok ? 'online' : 'offline');
    });
    return () => {
      cancelled = true;
    };
  }, [baseUrl]);

  return status;
}
