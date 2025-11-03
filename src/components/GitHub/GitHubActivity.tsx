'use client';

import { Card } from '@/components/ui';
import { formatTimeAgo } from '@/lib/github';
import type { GitHubEvent } from '@/types/github';

interface GitHubActivityProps {
  events: GitHubEvent[];
}

export default function GitHubActivity({ events }: GitHubActivityProps) {
  // Helper to get event icon
  const getEventIcon = (type: string): string => {
    switch (type) {
      case 'PushEvent':
        return '📝';
      case 'PullRequestEvent':
        return '🔀';
      case 'IssuesEvent':
        return '🐛';
      case 'CreateEvent':
        return '✨';
      case 'WatchEvent':
        return '⭐';
      case 'ForkEvent':
        return '🍴';
      case 'DeleteEvent':
        return '🗑️';
      case 'ReleaseEvent':
        return '🚀';
      case 'PublicEvent':
        return '🌍';
      default:
        return '💻';
    }
  };

  // Helper to get event description
  const getEventDescription = (event: GitHubEvent): string => {
    const repoName = event.repo.name;

    switch (event.type) {
      case 'PushEvent':
        const commitCount = event.payload.size || 1;
        return `Pushed ${commitCount} commit${commitCount > 1 ? 's' : ''} to ${repoName}`;

      case 'PullRequestEvent':
        const prAction = event.payload.action;
        const prNumber = event.payload.pull_request?.number;
        return `${prAction === 'opened' ? 'Opened' : prAction === 'closed' ? 'Closed' : 'Updated'} pull request #${prNumber} in ${repoName}`;

      case 'IssuesEvent':
        const issueAction = event.payload.action;
        const issueNumber = event.payload.issue?.number;
        return `${issueAction === 'opened' ? 'Opened' : issueAction === 'closed' ? 'Closed' : 'Updated'} issue #${issueNumber} in ${repoName}`;

      case 'CreateEvent':
        const refType = event.payload.ref_type;
        return `Created ${refType} in ${repoName}`;

      case 'WatchEvent':
        return `Starred ${repoName}`;

      case 'ForkEvent':
        return `Forked ${repoName}`;

      case 'DeleteEvent':
        return `Deleted ${event.payload.ref_type} in ${repoName}`;

      case 'ReleaseEvent':
        return `Published release in ${repoName}`;

      case 'PublicEvent':
        return `Made ${repoName} public`;

      default:
        return `Activity in ${repoName}`;
    }
  };

  // Get repository URL
  const getRepoUrl = (repoName: string): string => {
    return `https://github.com/${repoName}`;
  };

  if (events.length === 0) {
    return (
      <Card variant="bordered" className="p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          No recent activity found.
        </p>
      </Card>
    );
  }

  return (
    <Card variant="bordered" className="p-6">
      <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex gap-4 items-start pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0"
          >
            {/* Icon */}
            <div className="text-2xl flex-shrink-0">
              {getEventIcon(event.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 dark:text-white mb-1">
                {getEventDescription(event)}
              </p>

              {/* Repository Link */}
              <a
                href={getRepoUrl(event.repo.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-purple-600 dark:text-purple-400 hover:underline inline-block mb-1"
              >
                {event.repo.name}
              </a>

              {/* Show commit message for PushEvent */}
              {event.type === 'PushEvent' && event.payload.commits && event.payload.commits.length > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  "{event.payload.commits[0].message}"
                </p>
              )}

              {/* Show PR/Issue title */}
              {event.type === 'PullRequestEvent' && event.payload.pull_request && (
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  "{event.payload.pull_request.title}"
                </p>
              )}
              {event.type === 'IssuesEvent' && event.payload.issue && (
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  "{event.payload.issue.title}"
                </p>
              )}

              {/* Time */}
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {formatTimeAgo(event.created_at)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
