/**
 * Integration tests for the Analytics page (`src/app/analytics/page.tsx`).
 *
 * The page fetches `getAnalyticsOverview(days)` on mount and whenever the
 * time-range selector changes, then renders engagement stat cards, a set of
 * Recharts charts, a subreddit table, and loading / error affordances.
 *
 * Recharts is stubbed (it needs canvas/layout that jsdom lacks) as passthrough
 * containers, mirroring `src/__tests__/components/SkillsMatrix.test.tsx`.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnalyticsPage from '@/app/analytics/page';
import type { AnalyticsOverview } from '@/types/api';

// --- Mock the API module: the page imports `getAnalyticsOverview` from '@/lib/api'.
jest.mock('@/lib/api', () => ({ getAnalyticsOverview: jest.fn() }));
import { getAnalyticsOverview } from '@/lib/api';
const mockGet = getAnalyticsOverview as jest.Mock;

// --- Stub Recharts. Chart wrappers pass their children through as <div>s (so we
// can assert they mounted); leaf primitives render nothing. Props like
// width/height/dataKey are intentionally ignored so jsdom emits no warnings.
jest.mock('recharts', () => {
  const ReactLib = require('react');
  const container = (testid: string) =>
    function MockChartContainer({ children }: any) {
      return ReactLib.createElement('div', { 'data-testid': testid }, children);
    };
  const leaf = () => function MockChartLeaf() { return null; };
  return {
    __esModule: true,
    ResponsiveContainer: container('responsive-container'),
    LineChart: container('line-chart'),
    BarChart: container('bar-chart'),
    PieChart: container('pie-chart'),
    AreaChart: container('area-chart'),
    Pie: container('pie'),
    Line: leaf(),
    Bar: leaf(),
    Area: leaf(),
    Cell: leaf(),
    XAxis: leaf(),
    YAxis: leaf(),
    CartesianGrid: leaf(),
    Tooltip: leaf(),
    Legend: leaf(),
  };
});

// --- Realistic AnalyticsOverview fixture (shape from `src/types/api.ts`).
// Engagement values are chosen to render distinct text and not collide with the
// subreddit table numbers below.
const fixture: AnalyticsOverview = {
  post_volume: [
    { date: '2026-07-01', count: 12 },
    { date: '2026-07-02', count: 18 },
    { date: '2026-07-03', count: 9 },
  ],
  sentiment_trends: [
    { date: '2026-07-01', positive: 10, neutral: 5, negative: 2 },
    { date: '2026-07-02', positive: 8, neutral: 6, negative: 3 },
  ],
  top_subreddits: [
    { subreddit: 'programming', post_count: 40, avg_score: 210, avg_comments: 33 },
    { subreddit: 'datascience', post_count: 25, avg_score: 175, avg_comments: 21 },
  ],
  sentiment_by_subreddit: [
    { subreddit: 'programming', positive: 18, neutral: 15, negative: 7 },
    { subreddit: 'datascience', positive: 12, neutral: 9, negative: 4 },
  ],
  engagement_metrics: {
    avg_score: 128.6, // -> toFixed(0) => "129"
    max_score: 950,
    avg_comments: 42.5, // -> toFixed(1) => "42.5"
    max_comments: 310,
    avg_upvote_ratio: 0.94, // -> (x*100).toFixed(0) => "94%"
  },
};

describe('Analytics Page', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it('shows the loading state before the fetch resolves', () => {
    // A promise that never settles keeps the component in its initial
    // loading state (loading === true && data === null).
    mockGet.mockReturnValue(new Promise(() => {}));

    render(<AnalyticsPage />);

    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
    // Hero renders in every state, including while loading.
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    // The default time range (30) drives the initial fetch.
    expect(mockGet).toHaveBeenCalledWith(30);
  });

  it('renders the hero, engagement metrics and charts once data loads', async () => {
    mockGet.mockResolvedValue(fixture);

    render(<AnalyticsPage />);

    // Wait for the mount fetch to resolve and the dashboard to render.
    expect(await screen.findByText('Engagement Metrics')).toBeInTheDocument();

    // Hero copy.
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    expect(
      screen.getByText(/Comprehensive analytics and insights from the Reddit data pipeline/i)
    ).toBeInTheDocument();

    // Key engagement numbers (formatted by the page).
    expect(screen.getByText('129')).toBeInTheDocument();   // avg_score.toFixed(0)
    expect(screen.getByText('950')).toBeInTheDocument();   // max_score
    expect(screen.getByText('42.5')).toBeInTheDocument();  // avg_comments.toFixed(1)
    expect(screen.getByText('310')).toBeInTheDocument();   // max_comments
    expect(screen.getByText('94%')).toBeInTheDocument();   // (avg_upvote_ratio * 100).toFixed(0)%

    // Stat-card labels. "Avg Score"/"Avg Comments" also appear as table headers,
    // so query them permissively; the rest are unique to the cards.
    expect(screen.getByText('Max Score')).toBeInTheDocument();
    expect(screen.getByText('Max Comments')).toBeInTheDocument();
    expect(screen.getByText('Upvote Ratio')).toBeInTheDocument();
    expect(screen.getAllByText('Avg Score').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Avg Comments').length).toBeGreaterThan(0);

    // Chart section titles.
    expect(screen.getByText('Post Volume Over Time')).toBeInTheDocument();
    expect(screen.getByText('Sentiment Trends')).toBeInTheDocument();
    expect(screen.getByText('Top Subreddits')).toBeInTheDocument();
    expect(screen.getByText('Sentiment Distribution')).toBeInTheDocument();
    expect(screen.getByText('Sentiment by Subreddit')).toBeInTheDocument();

    // Subreddit performance table rows.
    expect(screen.getByText('Subreddit Performance')).toBeInTheDocument();
    expect(screen.getByText('r/programming')).toBeInTheDocument();
    expect(screen.getByText('r/datascience')).toBeInTheDocument();

    // Mocked Recharts containers appear: 5 ResponsiveContainers wrapping
    // 2 LineCharts, 2 BarCharts and 1 PieChart.
    expect(screen.getAllByTestId('responsive-container')).toHaveLength(5);
    expect(screen.getAllByTestId('line-chart')).toHaveLength(2);
    expect(screen.getAllByTestId('bar-chart')).toHaveLength(2);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('renders the error state when the fetch rejects', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGet.mockRejectedValue(new Error('boom'));

    render(<AnalyticsPage />);

    // The page surfaces the error message and an "Error" badge + Retry control.
    expect(await screen.findByText('boom')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    // Hero still renders above the error card.
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    // Loading affordance is gone.
    expect(screen.queryByText('Loading analytics...')).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('re-fetches with the new day count when the time range changes', async () => {
    mockGet.mockResolvedValue(fixture);

    render(<AnalyticsPage />);

    // Initial mount fetch uses the default range (30).
    await screen.findByText('Engagement Metrics');
    expect(mockGet).toHaveBeenCalledWith(30);
    expect(mockGet).toHaveBeenCalledTimes(1);

    // Switch to the "90 days" range.
    fireEvent.click(screen.getByRole('button', { name: '90 days' }));

    // The change triggers a fresh fetch with days === 90 (plain number arg).
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(90));
    expect(mockGet).toHaveBeenCalledTimes(2);
  });
});
