'use client';

import { Card, Badge } from '@/components/ui';
import type { SchedulerStatus } from '@/types/api';

interface SchedulerStatusWidgetProps {
  schedulerStatus: SchedulerStatus | null;
  loading?: boolean;
}

export function SchedulerStatusWidget({ schedulerStatus, loading }: SchedulerStatusWidgetProps) {
  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <h3 className="text-xl font-semibold mb-4">Scheduler Status</h3>
        <div className="text-center py-4 text-gray-400">Loading scheduler status...</div>
      </Card>
    );
  }

  if (!schedulerStatus) {
    return (
      <Card variant="elevated" padding="lg">
        <h3 className="text-xl font-semibold mb-4">Scheduler Status</h3>
        <div className="text-center py-4 text-gray-400">Unable to load scheduler status</div>
      </Card>
    );
  }

  function formatNextRunTime(timeString: string | null): string {
    if (!timeString) return 'Not scheduled';

    try {
      const date = new Date(timeString);
      const now = new Date();
      const diffMs = date.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (diffMs < 0) return 'Overdue';
      if (diffHours > 0) return `in ${diffHours}h ${diffMinutes}m`;
      return `in ${diffMinutes}m`;
    } catch {
      return timeString;
    }
  }

  return (
    <Card variant="elevated" padding="lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Automated Scheduler</h3>
        <Badge variant={schedulerStatus.running ? 'success' : 'error'} size="lg">
          {schedulerStatus.running ? '● Running' : '● Stopped'}
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Scheduler Info */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">{schedulerStatus.total_jobs}</div>
            <div className="text-sm text-gray-400">Active Jobs</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {schedulerStatus.jobs.filter(j => !j.pending).length}
            </div>
            <div className="text-sm text-gray-400">Ready to Run</div>
          </div>
        </div>

        {/* Active Jobs */}
        {schedulerStatus.jobs.length > 0 && (
          <div className="pt-4 border-t border-gray-700">
            <h4 className="text-sm font-semibold text-gray-400 mb-3">Scheduled Jobs</h4>
            <div className="space-y-3">
              {schedulerStatus.jobs.map((job) => (
                <div key={job.id} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{job.id}</span>
                    <Badge variant="primary" size="sm">
                      {job.trigger}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Function: {job.name}</span>
                    <span className="text-blue-400">
                      Next run: {formatNextRunTime(job.next_run_time)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {schedulerStatus.total_jobs === 0 && (
          <div className="text-center py-4 text-gray-400 text-sm">
            No jobs scheduled
          </div>
        )}
      </div>
    </Card>
  );
}
