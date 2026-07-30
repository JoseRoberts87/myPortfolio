import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Recharts needs ResizeObserver/layout that jsdom lacks — stub the primitives
// used by the dashboard (matching the house style in GitHubLanguages.test).
jest.mock('recharts', () => {
  const Passthrough = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  const Empty = () => <div />;
  return {
    ResponsiveContainer: Passthrough,
    AreaChart: Passthrough,
    LineChart: Passthrough,
    Area: Empty,
    Line: Empty,
    XAxis: Empty,
    YAxis: Empty,
    CartesianGrid: Empty,
    Tooltip: Empty,
  };
});

import { DashboardView } from '@/components/Streaming/LiveDashboard';
import { emptyMetrics, reduceEvent, StreamEvent, StreamMetrics } from '@/lib/streaming';

function buildMetrics(): StreamMetrics {
  let m = emptyMetrics();
  const events: StreamEvent[] = [
    { id: 'a', ts: 1000, source: 'orders', latencyMs: 400, status: 'ok', bytes: 2048 },
    { id: 'b', ts: 1200, source: 'sensors', latencyMs: 800, status: 'error', bytes: 512 },
    { id: 'c', ts: 1400, source: 'orders', latencyMs: 600, status: 'retry', bytes: 1024 },
  ];
  for (const e of events) m = reduceEvent(m, e);
  return m;
}

describe('DashboardView', () => {
  it('renders headline stats from the metrics', () => {
    render(<DashboardView metrics={buildMetrics()} state="live" />);
    expect(screen.getByText('Events processed')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // total
    expect(screen.getByText('Throughput')).toBeInTheDocument();
    expect(screen.getByText('Avg latency')).toBeInTheDocument();
    expect(screen.getByText('Error rate')).toBeInTheDocument();
  });

  it('shows the LIVE badge when connected via SSE', () => {
    render(<DashboardView metrics={buildMetrics()} state="live" />);
    expect(screen.getByText(/LIVE/)).toBeInTheDocument();
  });

  it('shows the SIMULATED badge when falling back', () => {
    render(<DashboardView metrics={buildMetrics()} state="simulated" />);
    expect(screen.getByText(/SIMULATED/)).toBeInTheDocument();
  });

  it('renders the live event feed rows', () => {
    render(<DashboardView metrics={buildMetrics()} state="live" />);
    // Newest event first: the retry from "orders".
    expect(screen.getAllByText('orders').length).toBeGreaterThan(0);
    expect(screen.getByText('retry')).toBeInTheDocument();
    expect(screen.getByText('error')).toBeInTheDocument();
  });

  it('shows an empty state before any events arrive', () => {
    render(<DashboardView metrics={emptyMetrics()} state="connecting" />);
    expect(screen.getByText(/Waiting for events/)).toBeInTheDocument();
    expect(screen.getByText(/Connecting/)).toBeInTheDocument();
  });

  it('renders the per-source breakdown', () => {
    render(<DashboardView metrics={buildMetrics()} state="live" />);
    expect(screen.getByText('Events by source')).toBeInTheDocument();
    expect(screen.getByText('telemetry')).toBeInTheDocument();
    expect(screen.getByText('clickstream')).toBeInTheDocument();
  });
});
