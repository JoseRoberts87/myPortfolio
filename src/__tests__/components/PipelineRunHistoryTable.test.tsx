import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PipelineRunHistoryTable } from '@/components/DataPipelines/PipelineRunHistoryTable';
import type { PipelineRun } from '@/types/api';

const runs: PipelineRun[] = [
  {
    id: 1,
    run_id: 'run-001',
    pipeline_name: 'reddit_ingestion',
    trigger_type: 'manual',
    status: 'success',
    started_at: '2026-07-27T14:30:00Z',
    completed_at: '2026-07-27T14:31:05Z',
    duration_seconds: 65,
    records_processed: 5120, // -> "5,120"
    records_stored: 300,
    records_updated: 20,
    records_failed: 0,
    data_quality_score: 98, // -> "98%"
    validation_errors: 0,
    avg_processing_time_ms: 12.5,
    error_message: null,
    error_type: null,
    retry_count: 0,
    is_retry: false,
  },
  {
    id: 2,
    run_id: 'run-002',
    pipeline_name: 'reddit_ingestion',
    trigger_type: 'scheduled',
    status: 'failed',
    started_at: '2026-07-26T02:00:00Z',
    completed_at: '2026-07-26T02:00:45Z',
    duration_seconds: 45.5,
    records_processed: 3400, // -> "3,400"
    records_stored: 0,
    records_updated: 0,
    records_failed: 12,
    data_quality_score: 72, // -> "72%"
    validation_errors: 3,
    avg_processing_time_ms: 20,
    error_message: 'Connection timeout',
    error_type: 'TimeoutError',
    retry_count: 1,
    is_retry: true,
  },
];

describe('PipelineRunHistoryTable', () => {
  it('renders a loading affordance and no table while loading', () => {
    render(<PipelineRunHistoryTable runs={[]} loading={true} />);

    expect(screen.getByText(/Loading run history/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders an empty message when there are no runs', () => {
    render(<PipelineRunHistoryTable runs={[]} loading={false} />);

    expect(
      screen.getByText(/No pipeline runs yet\. Run the pipeline to see execution history\./i)
    ).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByText(/Showing latest/)).not.toBeInTheDocument();
  });

  it('renders a table with column headers and one row per run', () => {
    render(<PipelineRunHistoryTable runs={runs} loading={false} />);

    expect(screen.getByRole('table')).toBeInTheDocument();

    for (const header of ['Status', 'Trigger', 'Started', 'Duration', 'Records', 'Quality']) {
      expect(screen.getByText(header)).toBeInTheDocument();
    }

    // One header row + one row per run.
    expect(screen.getAllByRole('row')).toHaveLength(runs.length + 1);
    expect(screen.getByText('Showing latest 2 pipeline runs')).toBeInTheDocument();
  });

  it('renders each run\'s status, trigger, records, and quality score', () => {
    render(<PipelineRunHistoryTable runs={runs} loading={false} />);

    // Status pills.
    expect(screen.getByText('success')).toBeInTheDocument();
    expect(screen.getByText('failed')).toBeInTheDocument();

    // Trigger types.
    expect(screen.getByText('manual')).toBeInTheDocument();
    expect(screen.getByText('scheduled')).toBeInTheDocument();

    // Processed record counts (locale-grouped).
    expect(screen.getByText('5,120')).toBeInTheDocument();
    expect(screen.getByText('3,400')).toBeInTheDocument();

    // Data quality scores.
    expect(screen.getByText('98%')).toBeInTheDocument();
    expect(screen.getByText('72%')).toBeInTheDocument();
  });

  it('renders a dash for a run with no data quality score', () => {
    const runWithoutQuality: PipelineRun[] = [
      { ...runs[0], id: 3, run_id: 'run-003', data_quality_score: null },
    ];
    render(<PipelineRunHistoryTable runs={runWithoutQuality} loading={false} />);

    expect(screen.getByText('-')).toBeInTheDocument();
    expect(screen.getByText('Showing latest 1 pipeline runs')).toBeInTheDocument();
  });
});
