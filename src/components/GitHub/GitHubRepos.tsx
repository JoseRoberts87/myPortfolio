'use client';

import { useState, useMemo } from 'react';
import { Card, Badge } from '@/components/ui';
import { formatNumber, formatTimeAgo } from '@/lib/github';
import type { GitHubRepo, RepoSortOption } from '@/types/github';

interface GitHubReposProps {
  repos: GitHubRepo[];
  limit?: number;
}

export default function GitHubRepos({ repos, limit = 6 }: GitHubReposProps) {
  const [sortBy, setSortBy] = useState<RepoSortOption>('stars');
  const [showForks, setShowForks] = useState(false);

  // Sort and filter repos
  const sortedRepos = useMemo(() => {
    let filtered = showForks ? repos : repos.filter(repo => !repo.fork);

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'stars':
          return b.stargazers_count - a.stargazers_count;
        case 'forks':
          return b.forks_count - a.forks_count;
        case 'updated':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return sorted.slice(0, limit);
  }, [repos, sortBy, showForks, limit]);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        {/* Sort Dropdown */}
        <div className="flex items-center gap-3">
          <label htmlFor="sort-repos" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sort by:
          </label>
          <select
            id="sort-repos"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as RepoSortOption)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="stars">Most Stars</option>
            <option value="forks">Most Forks</option>
            <option value="updated">Recently Updated</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>

        {/* Show Forks Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showForks}
            onChange={(e) => setShowForks(e.target.checked)}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Show Forked Repos
          </span>
        </label>
      </div>

      {/* Repos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedRepos.map((repo) => (
          <Card key={repo.id} variant="bordered" className="p-6 flex flex-col h-full">
            {/* Repo Name and Fork Badge */}
            <div className="mb-3">
              <div className="flex items-start gap-2 mb-2">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl font-bold text-purple-600 dark:text-purple-400 hover:underline flex-1"
                >
                  {repo.name}
                </a>
                {repo.fork && (
                  <Badge variant="secondary" className="text-xs">
                    Fork
                  </Badge>
                )}
              </div>

              {/* Language Badge */}
              {repo.language && (
                <Badge variant="primary" className="text-xs">
                  {repo.language}
                </Badge>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-1 line-clamp-3">
              {repo.description || 'No description provided'}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <div className="flex items-center gap-1" title="Stars">
                <span>⭐</span>
                <span>{formatNumber(repo.stargazers_count)}</span>
              </div>
              <div className="flex items-center gap-1" title="Forks">
                <span>🍴</span>
                <span>{formatNumber(repo.forks_count)}</span>
              </div>
              <div className="flex items-center gap-1" title="Watchers">
                <span>👁️</span>
                <span>{formatNumber(repo.watchers_count)}</span>
              </div>
            </div>

            {/* Updated Time */}
            <div className="text-xs text-gray-500 dark:text-gray-500 mb-4">
              Updated {formatTimeAgo(repo.updated_at)}
            </div>

            {/* View Code Button */}
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors text-sm mt-auto"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              View Code
            </a>
          </Card>
        ))}
      </div>

      {/* No Repos Message */}
      {sortedRepos.length === 0 && (
        <Card variant="bordered" className="p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No repositories found matching the current filters.
          </p>
        </Card>
      )}
    </div>
  );
}
