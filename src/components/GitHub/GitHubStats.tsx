'use client';

import { Card } from '@/components/ui';
import { formatNumber } from '@/lib/github';
import type { GitHubStats as GitHubStatsType } from '@/types/github';

interface GitHubStatsProps {
  stats: GitHubStatsType;
}

export default function GitHubStats({ stats }: GitHubStatsProps) {
  const statCards = [
    {
      label: 'Repositories',
      value: stats.totalRepos,
      icon: '📦',
      color: 'bg-blue-500/10 border-blue-500/20',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Total Stars',
      value: stats.totalStars,
      icon: '⭐',
      color: 'bg-yellow-500/10 border-yellow-500/20',
      textColor: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      label: 'Total Forks',
      value: stats.totalForks,
      icon: '🍴',
      color: 'bg-green-500/10 border-green-500/20',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Years Active',
      value: stats.accountAge,
      icon: '📅',
      color: 'bg-purple-500/10 border-purple-500/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      suffix: stats.accountAge === 1 ? ' year' : ' years',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <Card
          key={stat.label}
          variant="bordered"
          className={`p-6 ${stat.color} border-2`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-4xl">{stat.icon}</span>
          </div>
          <div>
            <div className={`text-4xl font-bold ${stat.textColor} mb-1`}>
              {formatNumber(stat.value)}
              {stat.suffix}
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {stat.label}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
