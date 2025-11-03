'use client';

import Image from 'next/image';
import { Card } from '@/components/ui';
import { formatNumber } from '@/lib/github';
import type { GitHubUser } from '@/types/github';

interface GitHubProfileProps {
  user: GitHubUser;
}

export default function GitHubProfile({ user }: GitHubProfileProps) {
  return (
    <Card variant="bordered" className="p-8">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="relative w-32 h-32 md:w-40 md:h-40">
            <Image
              src={user.avatar_url}
              alt={user.name || user.login}
              fill
              className="rounded-full object-cover border-4 border-purple-500/30"
              priority
            />
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex-1 text-center md:text-left">
          {/* Name and Username */}
          <div className="mb-4">
            <h2 className="text-3xl font-bold mb-1">
              {user.name || user.login}
            </h2>
            <a
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 dark:text-purple-400 hover:underline text-lg"
            >
              @{user.login}
            </a>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg">
              {user.bio}
            </p>
          )}

          {/* Location and Company */}
          <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-6 text-gray-600 dark:text-gray-400">
            {user.location && (
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span>{user.location}</span>
              </div>
            )}
            {user.company && (
              <div className="flex items-center gap-2">
                <span>🏢</span>
                <span>{user.company}</span>
              </div>
            )}
            {user.blog && (
              <a
                href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <span>🔗</span>
                <span>{user.blog}</span>
              </a>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-6 justify-center md:justify-start">
            <div className="text-center md:text-left">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(user.public_repos)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Repositories
              </div>
            </div>

            <div className="w-px bg-gray-300 dark:bg-gray-700" />

            <div className="text-center md:text-left">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(user.followers)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Followers
              </div>
            </div>

            <div className="w-px bg-gray-300 dark:bg-gray-700" />

            <div className="text-center md:text-left">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(user.following)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Following
              </div>
            </div>
          </div>

          {/* View on GitHub Button */}
          <div className="mt-6">
            <a
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
}
