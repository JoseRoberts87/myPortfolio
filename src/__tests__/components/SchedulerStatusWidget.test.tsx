import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SchedulerStatusWidget } from '@/components/DataPipelines/SchedulerStatusWidget';
import type { SchedulerStatus } from '@/types/api';

// A realistic, running scheduler with two jobs. One job is ready to run
// (pending: false) and one is still pending, so "Active Jobs" (total_jobs) and
// "Ready to Run" (count of non-pending jobs) render distinct numbers.
const runningStatus: SchedulerStatus = {
  running: true,
  total_jobs: 2,
  jobs: [
    {
      id: 'reddit_pipeline_hourly',
      name: 'run_reddit_pipeline',
      next_run_time: '2030-01-01T00:00:00Z',
      trigger: 'interval',
      pending: false,
    },
    {
      id: 'sentiment_analysis_daily',
      name: 'run_sentiment_analysis',
      next_run_time: null,
      trigger: 'cron',
      pending: true,
    },
  ],
};

describe('SchedulerStatusWidget', () => {
  it('renders a loading affordance and no real data while loading', () => {
    render(<SchedulerStatusWidget schedulerStatus={null} loading={true} />);

    expect(screen.getByText(/Loading scheduler status/i)).toBeInTheDocument();
    // The populated "Automated Scheduler" view must not render while loading.
    expect(screen.queryByText('Automated Scheduler')).not.toBeInTheDocument();
    expect(screen.queryByText('reddit_pipeline_hourly')).not.toBeInTheDocument();
  });

  it('renders a graceful message when scheduler status is null', () => {
    render(<SchedulerStatusWidget schedulerStatus={null} loading={false} />);

    expect(screen.getByText('Unable to load scheduler status')).toBeInTheDocument();
    expect(screen.queryByText('Automated Scheduler')).not.toBeInTheDocument();
  });

  it('renders scheduler status, counts, and jobs when running', () => {
    render(<SchedulerStatusWidget schedulerStatus={runningStatus} loading={false} />);

    // Header + running status pill.
    expect(screen.getByText('Automated Scheduler')).toBeInTheDocument();
    expect(screen.getByText(/Running/)).toBeInTheDocument();
    expect(screen.queryByText(/Stopped/)).not.toBeInTheDocument();

    // Counts: 2 active jobs total, 1 ready to run (only the non-pending job).
    expect(screen.getByText('Active Jobs')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Ready to Run')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

    // Each scheduled job renders its id, trigger, and function name.
    expect(screen.getByText('reddit_pipeline_hourly')).toBeInTheDocument();
    expect(screen.getByText('sentiment_analysis_daily')).toBeInTheDocument();
    expect(screen.getByText('interval')).toBeInTheDocument();
    expect(screen.getByText('cron')).toBeInTheDocument();
    expect(screen.getByText(/Function: run_reddit_pipeline/)).toBeInTheDocument();
  });

  it('shows a stopped pill when the scheduler is not running', () => {
    render(
      <SchedulerStatusWidget
        schedulerStatus={{ ...runningStatus, running: false }}
        loading={false}
      />
    );

    expect(screen.getByText(/Stopped/)).toBeInTheDocument();
    expect(screen.queryByText(/Running/)).not.toBeInTheDocument();
  });

  it('shows an empty message when there are no scheduled jobs', () => {
    const emptyStatus: SchedulerStatus = { running: true, total_jobs: 0, jobs: [] };
    render(<SchedulerStatusWidget schedulerStatus={emptyStatus} loading={false} />);

    expect(screen.getByText('No jobs scheduled')).toBeInTheDocument();
    // No job rows should be present.
    expect(screen.queryByText('Scheduled Jobs')).not.toBeInTheDocument();
  });
});
