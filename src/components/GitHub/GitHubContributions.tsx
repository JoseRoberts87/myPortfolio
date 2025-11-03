'use client';

import { Card } from '@/components/ui';

interface GitHubContributionsProps {
  username: string;
}

export default function GitHubContributions({ username }: GitHubContributionsProps) {
  // Using ghchart.rshah.org for contribution graph
  // This is a simple image-based approach that doesn't require additional dependencies
  const contributionImageUrl = `https://ghchart.rshah.org/${username}`;

  return (
    <Card variant="bordered" className="p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold mb-2">Contribution Activity</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          GitHub contribution graph showing activity over the past year
        </p>
      </div>

      {/* Contribution Graph */}
      <div className="flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg overflow-x-auto">
        <img
          src={contributionImageUrl}
          alt={`${username}'s GitHub contribution graph`}
          className="max-w-full h-auto"
          loading="lazy"
        />
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-2 text-xs text-gray-600 dark:text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-sm" />
          <div className="w-3 h-3 bg-green-200 dark:bg-green-900 rounded-sm" />
          <div className="w-3 h-3 bg-green-400 dark:bg-green-700 rounded-sm" />
          <div className="w-3 h-3 bg-green-600 dark:bg-green-500 rounded-sm" />
          <div className="w-3 h-3 bg-green-800 dark:bg-green-300 rounded-sm" />
        </div>
        <span>More</span>
      </div>

      {/* View on GitHub Link */}
      <div className="mt-4 text-center">
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
        >
          View detailed contribution activity on GitHub →
        </a>
      </div>
    </Card>
  );
}
