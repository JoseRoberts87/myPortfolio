'use client';

import { Card, Badge } from '@/components/ui';
import type { PipelineRun } from '@/types/api';

interface PipelineRunHistoryTableProps {
  runs: PipelineRun[];
  loading?: boolean;
}

export function PipelineRunHistoryTable({ runs, loading }: PipelineRunHistoryTableProps) {
  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <h3 className="text-xl font-semibold mb-6">Pipeline Run History</h3>
        <div className="text-center py-8 text-gray-400">Loading run history...</div>
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

  function formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  }

  function getStatusBadgeVariant(status: string): 'success' | 'warning' | 'error' | 'primary' {
    if (status === 'success') return 'success';
    if (status === 'failed') return 'error';
    if (status === 'running') return 'primary';
    return 'warning';
  }

  function getTriggerBadgeColor(trigger: string): string {
    if (trigger === 'manual') return 'bg-blue-600';
    if (trigger === 'scheduled') return 'bg-purple-600';
    return 'bg-gray-600';
  }

  return (
    <Card variant="elevated" padding="lg">
      <h3 className="text-xl font-semibold mb-6">Pipeline Run History</h3>

      {runs.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          No pipeline runs yet. Run the pipeline to see execution history.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="text-left py-3 px-2">Status</th>
                <th className="text-left py-3 px-2">Trigger</th>
                <th className="text-left py-3 px-2">Started</th>
                <th className="text-right py-3 px-2">Duration</th>
                <th className="text-right py-3 px-2">Records</th>
                <th className="text-right py-3 px-2">Quality</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr
                  key={run.id}
                  className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                >
                  {/* Status */}
                  <td className="py-3 px-2">
                    <Badge
                      variant={getStatusBadgeVariant(run.status)}
                      size="sm"
                    >
                      {run.status}
                    </Badge>
                  </td>

                  {/* Trigger Type */}
                  <td className="py-3 px-2">
                    <span className={`px-2 py-1 rounded text-xs ${getTriggerBadgeColor(run.trigger_type)} text-white`}>
                      {run.trigger_type}
                    </span>
                  </td>

                  {/* Started At */}
                  <td className="py-3 px-2 text-gray-300">
                    {formatDate(run.started_at)}
                  </td>

                  {/* Duration */}
                  <td className="py-3 px-2 text-right text-gray-300">
                    {formatDuration(run.duration_seconds)}
                  </td>

                  {/* Records */}
                  <td className="py-3 px-2 text-right">
                    <div className="text-gray-300">
                      {run.records_processed.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {run.records_stored > 0 && `${run.records_stored} new`}
                      {run.records_updated > 0 && ` ${run.records_updated} upd`}
                      {run.records_failed > 0 && ` ${run.records_failed} err`}
                    </div>
                  </td>

                  {/* Quality Score */}
                  <td className="py-3 px-2 text-right">
                    {run.data_quality_score !== null ? (
                      <span className={`font-semibold ${
                        run.data_quality_score >= 90 ? 'text-green-400' :
                        run.data_quality_score >= 70 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {run.data_quality_score.toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {runs.length > 0 && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Showing latest {runs.length} pipeline runs
        </div>
      )}
    </Card>
  );
}
