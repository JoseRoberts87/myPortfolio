import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PipelineMetricsDashboard } from '@/components/DataPipelines/PipelineMetricsDashboard';
import type { PipelineMetrics, PipelineRun } from '@/types/api';

const lastRun: PipelineRun = {
  id: 101,
  run_id: 'run-2026-07-27-001',
  pipeline_name: 'reddit_ingestion',
  trigger_type: 'scheduled',
  status: 'success',
  started_at: '2026-07-27T14:30:00Z',
  completed_at: '2026-07-27T14:31:05Z',
  duration_seconds: 65, // -> "1m 5s"
  records_processed: 5120, // -> "5,120"
  records_stored: 300,
  records_updated: 20,
  records_failed: 1,
  data_quality_score: 98, // -> "98%"
  validation_errors: 0,
  avg_processing_time_ms: 12.5,
  error_message: null,
  error_type: null,
  retry_count: 0,
  is_retry: false,
};

const metrics: PipelineMetrics = {
  total_runs: 42,
  successful_runs: 40,
  failed_runs: 2,
  running_runs: 0,
  avg_duration_seconds: 45.5, // -> "45.5s"
  avg_records_per_run: 3047.6, // Math.round -> 3048 -> "3,048"
  total_records_processed: 128450, // -> "128,450"
  avg_success_rate: 95.2, // -> "95.2%"
  last_run: lastRun,
  recent_runs: [lastRun],
};

describe('PipelineMetricsDashboard', () => {
  it('renders a loading affordance and no metric values while loading', () => {
    render(<PipelineMetricsDashboard metrics={null} loading={true} />);

    expect(screen.getByText(/Loading metrics/i)).toBeInTheDocument();
    // The metric grid must not render while loading.
    expect(screen.queryByText('Success Rate')).not.toBeInTheDocument();
    expect(screen.queryByText('42')).not.toBeInTheDocument();
  });

  it('renders a graceful message when metrics are null', () => {
    render(<PipelineMetricsDashboard metrics={null} loading={false} />);

    expect(screen.getByText('Unable to load metrics')).toBeInTheDocument();
    expect(screen.queryByText('Success Rate')).not.toBeInTheDocument();
  });

  it('renders aggregate metrics for a populated fixture', () => {
    render(<PipelineMetricsDashboard metrics={metrics} loading={false} />);

    // Total runs and the success/failed breakdown.
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Total Runs')).toBeInTheDocument();
    expect(screen.getByText(/40 success, 2 failed/)).toBeInTheDocument();

    // Success rate, average duration, and processed-record totals.
    expect(screen.getByText('95.2%')).toBeInTheDocument();
    expect(screen.getByText('Success Rate')).toBeInTheDocument();
    expect(screen.getByText('45.5s')).toBeInTheDocument();
    expect(screen.getByText('128,450')).toBeInTheDocument();
    expect(screen.getByText(/Avg 3,048 per run/)).toBeInTheDocument();
  });

  it('renders the latest pipeline run details', () => {
    render(<PipelineMetricsDashboard metrics={metrics} loading={false} />);

    expect(screen.getByText('Latest Pipeline Run')).toBeInTheDocument();
    // Status value (its own node is exactly "success", distinct from the
    // "40 success, 2 failed" breakdown text).
    expect(screen.getByText('success')).toBeInTheDocument();
    expect(screen.getByText('1m 5s')).toBeInTheDocument(); // last run duration
    expect(screen.getByText('5,120')).toBeInTheDocument(); // last run records
    expect(screen.getByText('98%')).toBeInTheDocument(); // data quality score
  });

  it('shows an empty message and hides the latest-run block when there are no runs', () => {
    const emptyMetrics: PipelineMetrics = {
      total_runs: 0,
      successful_runs: 0,
      failed_runs: 0,
      running_runs: 0,
      avg_duration_seconds: 0,
      avg_records_per_run: 0,
      total_records_processed: 0,
      avg_success_rate: 0,
      last_run: null,
      recent_runs: [],
    };
    render(<PipelineMetricsDashboard metrics={emptyMetrics} loading={false} />);

    expect(screen.getByText('No pipeline runs in the last 7 days')).toBeInTheDocument();
    expect(screen.queryByText('Latest Pipeline Run')).not.toBeInTheDocument();
  });
});
