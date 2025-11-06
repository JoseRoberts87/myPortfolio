'use client';

import { Card } from '@/components/ui';
import type { PipelineMetrics } from '@/types/api';

interface PipelineMetricsDashboardProps {
  metrics: PipelineMetrics | null;
  loading?: boolean;
}

export function PipelineMetricsDashboard({ metrics, loading }: PipelineMetricsDashboardProps) {
  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <h3 className="text-xl font-semibold mb-6">Pipeline Metrics (Last 7 Days)</h3>
        <div className="text-center py-8 text-gray-400">Loading metrics...</div>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card variant="elevated" padding="lg">
        <h3 className="text-xl font-semibold mb-6">Pipeline Metrics (Last 7 Days)</h3>
        <div className="text-center py-8 text-gray-400">Unable to load metrics</div>
      </Card>
    );
  }

  function formatDuration(seconds: number | null): string {
    if (seconds === null || seconds === 0) return '0s';
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  }

  function formatNumber(num: number): string {
    return num.toLocaleString();
  }

  const successRate = metrics.avg_success_rate || 0;

  return (
    <Card variant="elevated" padding="lg">
      <h3 className="text-xl font-semibold mb-6">Pipeline Metrics (Last 7 Days)</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Runs */}
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-400">{metrics.total_runs}</div>
          <div className="text-sm text-gray-400 mt-1">Total Runs</div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics.successful_runs} success, {metrics.failed_runs} failed
          </div>
        </div>

        {/* Success Rate */}
        <div className="text-center">
          <div className="text-3xl font-bold text-green-400">{successRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-400 mt-1">Success Rate</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${successRate}%` }}
            ></div>
          </div>
        </div>

        {/* Avg Duration */}
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-400">
            {formatDuration(metrics.avg_duration_seconds)}
          </div>
          <div className="text-sm text-gray-400 mt-1">Avg Duration</div>
          <div className="text-xs text-gray-500 mt-1">Per pipeline run</div>
        </div>

        {/* Total Records Processed */}
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-400">
            {formatNumber(metrics.total_records_processed)}
          </div>
          <div className="text-sm text-gray-400 mt-1">Records Processed</div>
          <div className="text-xs text-gray-500 mt-1">
            Avg {formatNumber(Math.round(metrics.avg_records_per_run))} per run
          </div>
        </div>
      </div>

      {/* Last Run Info */}
      {metrics.last_run && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h4 className="text-sm font-semibold text-gray-400 mb-3">Latest Pipeline Run</h4>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Status:</span>
                <span className={`ml-2 font-semibold ${
                  metrics.last_run.status === 'success' ? 'text-green-400' :
                  metrics.last_run.status === 'failed' ? 'text-red-400' :
                  'text-yellow-400'
                }`}>
                  {metrics.last_run.status}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Duration:</span>
                <span className="ml-2 text-white">
                  {formatDuration(metrics.last_run.duration_seconds)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Records:</span>
                <span className="ml-2 text-white">
                  {formatNumber(metrics.last_run.records_processed)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Quality:</span>
                <span className="ml-2 text-white">
                  {metrics.last_run.data_quality_score?.toFixed(0)}%
                </span>
              </div>
            </div>
            {metrics.last_run.started_at && (
              <div className="mt-2 text-xs text-gray-500">
                Started: {new Date(metrics.last_run.started_at).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}

      {metrics.total_runs === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          No pipeline runs in the last 7 days
        </div>
      )}
    </Card>
  );
}
