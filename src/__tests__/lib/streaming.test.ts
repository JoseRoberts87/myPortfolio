import {
  emptyMetrics,
  reduceEvent,
  errorRate,
  avgLatency,
  currentThroughput,
  generateEvent,
  MAX_FEED,
  MAX_POINTS,
  StreamEvent,
} from '@/lib/streaming';

function evt(overrides: Partial<StreamEvent> = {}): StreamEvent {
  return {
    id: overrides.id ?? 'e1',
    ts: overrides.ts ?? 1_000_000,
    source: overrides.source ?? 'orders',
    latencyMs: overrides.latencyMs ?? 500,
    status: overrides.status ?? 'ok',
    bytes: overrides.bytes ?? 1000,
  };
}

describe('emptyMetrics', () => {
  it('starts at zero with all sources present', () => {
    const m = emptyMetrics();
    expect(m.total).toBe(0);
    expect(m.recent).toEqual([]);
    expect(m.bySource).toEqual({ orders: 0, telemetry: 0, clickstream: 0, sensors: 0 });
  });
});

describe('reduceEvent', () => {
  it('accumulates totals, bytes, and per-source counts', () => {
    let m = emptyMetrics();
    m = reduceEvent(m, evt({ source: 'orders', bytes: 100 }));
    m = reduceEvent(m, evt({ id: 'e2', source: 'orders', bytes: 200 }));
    m = reduceEvent(m, evt({ id: 'e3', source: 'sensors', bytes: 50 }));
    expect(m.total).toBe(3);
    expect(m.bytes).toBe(350);
    expect(m.bySource.orders).toBe(2);
    expect(m.bySource.sensors).toBe(1);
  });

  it('counts errors and retries', () => {
    let m = emptyMetrics();
    m = reduceEvent(m, evt({ status: 'error' }));
    m = reduceEvent(m, evt({ id: 'e2', status: 'retry' }));
    m = reduceEvent(m, evt({ id: 'e3', status: 'ok' }));
    expect(m.errors).toBe(1);
    expect(m.retries).toBe(1);
  });

  it('keeps the feed newest-first and capped at MAX_FEED', () => {
    let m = emptyMetrics();
    for (let i = 0; i < MAX_FEED + 5; i++) {
      m = reduceEvent(m, evt({ id: `e${i}`, ts: 1_000_000 + i }));
    }
    expect(m.recent).toHaveLength(MAX_FEED);
    expect(m.recent[0].id).toBe(`e${MAX_FEED + 4}`); // newest first
  });

  it('buckets throughput by second', () => {
    let m = emptyMetrics();
    m = reduceEvent(m, evt({ ts: 5_000 })); // second 5
    m = reduceEvent(m, evt({ id: 'e2', ts: 5_400 })); // same second
    m = reduceEvent(m, evt({ id: 'e3', ts: 6_100 })); // second 6
    expect(m.throughput).toEqual([
      { second: 5, count: 2 },
      { second: 6, count: 1 },
    ]);
  });

  it('caps rolling buffers at MAX_POINTS', () => {
    let m = emptyMetrics();
    for (let i = 0; i < MAX_POINTS + 10; i++) {
      m = reduceEvent(m, evt({ id: `e${i}`, ts: i * 1000 })); // each a new second
    }
    expect(m.throughput).toHaveLength(MAX_POINTS);
    expect(m.latency).toHaveLength(MAX_POINTS);
  });
});

describe('selectors', () => {
  it('errorRate is a percentage of total', () => {
    let m = emptyMetrics();
    m = reduceEvent(m, evt({ status: 'error' }));
    m = reduceEvent(m, evt({ id: 'e2', status: 'ok' }));
    m = reduceEvent(m, evt({ id: 'e3', status: 'ok' }));
    m = reduceEvent(m, evt({ id: 'e4', status: 'ok' }));
    expect(errorRate(m)).toBe(25);
  });

  it('errorRate is 0 for empty metrics', () => {
    expect(errorRate(emptyMetrics())).toBe(0);
  });

  it('avgLatency averages the rolling latency points', () => {
    let m = emptyMetrics();
    m = reduceEvent(m, evt({ latencyMs: 100, ts: 1000 }));
    m = reduceEvent(m, evt({ id: 'e2', latencyMs: 300, ts: 2000 }));
    expect(avgLatency(m)).toBe(200);
  });

  it('currentThroughput reflects the latest bucket', () => {
    let m = emptyMetrics();
    m = reduceEvent(m, evt({ ts: 9000 }));
    m = reduceEvent(m, evt({ id: 'e2', ts: 9200 }));
    expect(currentThroughput(m)).toBe(2);
  });
});

describe('generateEvent', () => {
  it('is deterministic with an injected rand and within expected bounds', () => {
    const e = generateEvent(1234, () => 0.5);
    expect(e.ts).toBe(1234);
    expect(e.source).toBe('clickstream'); // floor(0.5 * 4) = 2
    expect(e.status).toBe('ok'); // 0.5 >= 0.09
    expect(e.latencyMs).toBeGreaterThan(0);
    expect(e.bytes).toBeGreaterThanOrEqual(400);
  });

  it('produces an error status on a low roll', () => {
    expect(generateEvent(1, () => 0).status).toBe('error');
  });

  it('generates unique ids across calls', () => {
    const a = generateEvent(1, () => 0.3);
    const b = generateEvent(1, () => 0.3);
    expect(a.id).not.toBe(b.id);
  });
});
