/**
 * Shared model for the real-time streaming demo (issue #78).
 *
 * The types, synthetic event generator, and metric reducers here are pure and
 * are used by BOTH the server-side SSE route (`app/api/stream/route.ts`) and
 * the client-side fallback generator in the dashboard hook — so the demo
 * behaves identically whether events arrive over SSE or are simulated locally.
 */

export const SOURCES = ['orders', 'telemetry', 'clickstream', 'sensors'] as const;
export type Source = (typeof SOURCES)[number];

export type EventStatus = 'ok' | 'retry' | 'error';

export interface StreamEvent {
  id: string;
  ts: number; // epoch ms
  source: Source;
  latencyMs: number; // end-to-end processing latency
  status: EventStatus;
  bytes: number;
}

export interface ThroughputPoint {
  second: number; // unix second bucket
  count: number;
}

export interface LatencyPoint {
  ts: number;
  ms: number;
}

export interface StreamMetrics {
  total: number;
  bytes: number;
  errors: number;
  retries: number;
  bySource: Record<Source, number>;
  recent: StreamEvent[]; // newest first, capped at MAX_FEED
  throughput: ThroughputPoint[]; // rolling, capped at MAX_POINTS
  latency: LatencyPoint[]; // rolling, capped at MAX_POINTS
}

export const MAX_FEED = 12;
export const MAX_POINTS = 30;

export function emptyMetrics(): StreamMetrics {
  return {
    total: 0,
    bytes: 0,
    errors: 0,
    retries: 0,
    bySource: { orders: 0, telemetry: 0, clickstream: 0, sensors: 0 },
    recent: [],
    throughput: [],
    latency: [],
  };
}

/** Fold a single event into the running metrics (pure — returns a new object). */
export function reduceEvent(m: StreamMetrics, e: StreamEvent): StreamMetrics {
  const second = Math.floor(e.ts / 1000);
  const throughput = m.throughput.slice();
  const last = throughput[throughput.length - 1];
  if (last && last.second === second) {
    throughput[throughput.length - 1] = { second, count: last.count + 1 };
  } else {
    throughput.push({ second, count: 1 });
  }
  while (throughput.length > MAX_POINTS) throughput.shift();

  const latency = m.latency.concat({ ts: e.ts, ms: e.latencyMs });
  while (latency.length > MAX_POINTS) latency.shift();

  return {
    total: m.total + 1,
    bytes: m.bytes + e.bytes,
    errors: m.errors + (e.status === 'error' ? 1 : 0),
    retries: m.retries + (e.status === 'retry' ? 1 : 0),
    bySource: { ...m.bySource, [e.source]: m.bySource[e.source] + 1 },
    recent: [e, ...m.recent].slice(0, MAX_FEED),
    throughput,
    latency,
  };
}

export function errorRate(m: StreamMetrics): number {
  return m.total === 0 ? 0 : (m.errors / m.total) * 100;
}

export function avgLatency(m: StreamMetrics): number {
  if (m.latency.length === 0) return 0;
  return Math.round(m.latency.reduce((sum, p) => sum + p.ms, 0) / m.latency.length);
}

/** Events currently in the most recent 1-second bucket (approx. events/sec). */
export function currentThroughput(m: StreamMetrics): number {
  return m.throughput.length ? m.throughput[m.throughput.length - 1].count : 0;
}

let counter = 0;

/**
 * Generate a synthetic pipeline event. `rand` is injectable for deterministic
 * tests; defaults to Math.random. Latencies are weighted to stay well under the
 * 5s SLA the demo advertises, with the occasional error skewing higher.
 */
export function generateEvent(now: number, rand: () => number = Math.random): StreamEvent {
  const source = SOURCES[Math.floor(rand() * SOURCES.length)];
  const roll = rand();
  const status: EventStatus = roll < 0.02 ? 'error' : roll < 0.09 ? 'retry' : 'ok';
  const latencyMs = Math.round(180 + rand() * (status === 'error' ? 4200 : 1600));
  return {
    id: `evt-${now}-${counter++}`,
    ts: now,
    source,
    latencyMs,
    status,
    bytes: Math.round(400 + rand() * 3600),
  };
}
