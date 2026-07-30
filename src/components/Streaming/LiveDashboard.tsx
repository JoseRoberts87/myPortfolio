'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, Badge } from '@/components/ui';
import {
  StreamEvent,
  StreamMetrics,
  SOURCES,
  emptyMetrics,
  reduceEvent,
  generateEvent,
  errorRate,
  avgLatency,
  currentThroughput,
} from '@/lib/streaming';

export type ConnectionState = 'connecting' | 'live' | 'simulated';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error'> = {
  ok: 'success',
  retry: 'warning',
  error: 'error',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function StatTile({
  label,
  value,
  sub,
  testId,
}: {
  label: string;
  value: string;
  sub?: string;
  testId?: string;
}) {
  return (
    <Card variant="bordered" padding="lg">
      <div className="text-sm text-muted">{label}</div>
      <div className="mt-1 text-3xl font-bold text-accent tabular-nums" data-testid={testId}>
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-faint">{sub}</div>}
    </Card>
  );
}

/**
 * Pure presentational dashboard. Kept separate from the streaming hook so it
 * can be unit-tested with fixed props (no EventSource / timers).
 */
export function DashboardView({
  metrics,
  state,
}: {
  metrics: StreamMetrics;
  state: ConnectionState;
}) {
  const throughputData = metrics.throughput.map((p, i) => ({ i, count: p.count }));
  const latencyData = metrics.latency.map((p, i) => ({ i, ms: p.ms }));
  const maxSource = Math.max(1, ...SOURCES.map((s) => metrics.bySource[s]));

  const connBadge =
    state === 'live' ? (
      <Badge variant="success" size="lg">
        <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-green-500" />
        LIVE · SSE
      </Badge>
    ) : state === 'simulated' ? (
      <Badge variant="warning" size="lg">
        <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-yellow-500" />
        SIMULATED
      </Badge>
    ) : (
      <Badge variant="secondary" size="lg">
        Connecting…
      </Badge>
    );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Pipeline Telemetry</h2>
        <div aria-label="connection status">{connBadge}</div>
      </div>

      {/* Headline stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatTile label="Events processed" value={metrics.total.toLocaleString()} testId="events-processed" />
        <StatTile label="Throughput" value={`${currentThroughput(metrics)}/s`} sub="events per second" />
        <StatTile label="Avg latency" value={`${avgLatency(metrics)} ms`} sub="sub-5s SLA" />
        <StatTile label="Error rate" value={`${errorRate(metrics).toFixed(2)}%`} sub={`${metrics.errors} errors`} />
        <StatTile label="Data volume" value={formatBytes(metrics.bytes)} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card variant="bordered" padding="lg">
          <h3 className="mb-4 text-lg font-semibold">Throughput (events/sec)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={throughputData}>
              <defs>
                <linearGradient id="tp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="i" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#a855f7" fill="url(#tp)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card variant="bordered" padding="lg">
          <h3 className="mb-4 text-lg font-semibold">Processing latency (ms)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={latencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="i" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="ms" stroke="#22d3ee" dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Per-source + live feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card variant="bordered" padding="lg">
          <h3 className="mb-4 text-lg font-semibold">Events by source</h3>
          <div className="space-y-3">
            {SOURCES.map((source) => (
              <div key={source}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="capitalize text-body">{source}</span>
                  <span className="tabular-nums text-muted">{metrics.bySource[source].toLocaleString()}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-track">
                  <div
                    className="h-full rounded-full bg-purple-500 transition-all"
                    style={{ width: `${(metrics.bySource[source] / maxSource) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="bordered" padding="lg">
          <h3 className="mb-4 text-lg font-semibold">Live event feed</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[24rem] text-sm">
              <thead>
                <tr className="border-b border-subtle text-left text-muted">
                  <th className="py-2 pr-4 font-medium">Source</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Latency</th>
                  <th className="py-2 font-medium">Size</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recent.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-faint">
                      Waiting for events…
                    </td>
                  </tr>
                ) : (
                  metrics.recent.map((e) => (
                    <tr key={e.id} className="border-b border-subtle/50">
                      <td className="py-2 pr-4 capitalize">{e.source}</td>
                      <td className="py-2 pr-4">
                        <Badge variant={STATUS_VARIANT[e.status]} size="sm">
                          {e.status}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4 tabular-nums">{e.latencyMs} ms</td>
                      <td className="py-2 tabular-nums">{formatBytes(e.bytes)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

/** Connect to the SSE endpoint, falling back to local generation. */
function useLiveStream(): { metrics: StreamMetrics; state: ConnectionState } {
  const [metrics, setMetrics] = useState<StreamMetrics>(emptyMetrics);
  const [state, setState] = useState<ConnectionState>('connecting');
  const fallbackRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let es: EventSource | null = null;
    const push = (e: StreamEvent) => setMetrics((m) => reduceEvent(m, e));

    const startFallback = () => {
      if (fallbackRef.current) return;
      setState('simulated');
      fallbackRef.current = setInterval(() => push(generateEvent(Date.now())), 700);
    };

    try {
      es = new EventSource('/api/stream');
      es.onopen = () => setState((s) => (s === 'simulated' ? s : 'live'));
      es.onmessage = (ev) => {
        try {
          push(JSON.parse(ev.data) as StreamEvent);
        } catch {
          /* ignore malformed frame */
        }
      };
      es.onerror = () => {
        es?.close();
        startFallback();
      };
    } catch {
      startFallback();
    }

    // Safety net: if nothing connected shortly, simulate so the demo always moves.
    const timer = setTimeout(() => {
      setState((s) => {
        if (s === 'connecting') startFallback();
        return s;
      });
    }, 2500);

    return () => {
      es?.close();
      if (fallbackRef.current) clearInterval(fallbackRef.current);
      clearTimeout(timer);
    };
  }, []);

  return { metrics, state };
}

export default function LiveDashboard() {
  const { metrics, state } = useLiveStream();
  return <DashboardView metrics={metrics} state={state} />;
}
