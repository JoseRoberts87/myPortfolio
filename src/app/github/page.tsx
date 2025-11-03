'use client';

import { Section } from '@/components/ui';
import { useGitHub } from '@/hooks/useGitHub';
import GitHubProfile from '@/components/GitHub/GitHubProfile';
import GitHubStats from '@/components/GitHub/GitHubStats';
import GitHubRepos from '@/components/GitHub/GitHubRepos';
import GitHubActivity from '@/components/GitHub/GitHubActivity';
import GitHubLanguages from '@/components/GitHub/GitHubLanguages';
import GitHubContributions from '@/components/GitHub/GitHubContributions';

// GitHub username from environment variable or default
const GITHUB_USERNAME = process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'JoseRoberts87';

export default function GitHubPage() {
  const { user, repos, stats, events, languages, loading, error, refetch } = useGitHub(GITHUB_USERNAME);

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <Section padding="xl" background="subtle">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            GitHub Activity
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Explore my open source work, contributions, and active development on GitHub
          </p>
        </div>
      </Section>

      {/* Loading State */}
      {loading && (
        <Section padding="lg">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Loading GitHub data...
            </p>
          </div>
        </Section>
      )}

      {/* Error State */}
      {error && !loading && (
        <Section padding="lg">
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">
              Error Loading GitHub Data
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={refetch}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
              >
                Try Again
              </button>
              <a
                href={`https://github.com/${GITHUB_USERNAME}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border-2 border-purple-600 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white font-semibold rounded-lg transition-colors"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </Section>
      )}

      {/* Content */}
      {!loading && !error && user && stats && (
        <>
          {/* Profile Section */}
          <Section padding="lg">
            <GitHubProfile user={user} />
          </Section>

          {/* Stats Section */}
          <Section padding="lg" background="subtle">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">GitHub Statistics</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Key metrics and contributions overview
              </p>
            </div>
            <GitHubStats stats={stats} />
          </Section>

          {/* Repositories Section */}
          <Section padding="lg">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Repositories</h2>
              <p className="text-gray-600 dark:text-gray-400">
                My most popular and recent public repositories
              </p>
            </div>
            <GitHubRepos repos={repos} limit={6} />
          </Section>

          {/* Activity & Languages Section */}
          <Section padding="lg" background="subtle">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Activity & Languages</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Recent contributions and programming language distribution
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Activity - 60% width on desktop */}
              <div className="lg:col-span-3">
                <GitHubActivity events={events} />
              </div>
              {/* Languages - 40% width on desktop */}
              <div className="lg:col-span-2">
                <GitHubLanguages languages={languages} />
              </div>
            </div>
          </Section>

          {/* Contribution Graph Section */}
          <Section padding="lg">
            <GitHubContributions username={GITHUB_USERNAME} />
          </Section>

          {/* Call to Action */}
          <Section padding="lg" background="subtle">
            <div className="text-center py-12">
              <h2 className="text-3xl font-bold mb-4">
                Want to see more?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                Check out my full GitHub profile to explore all my repositories, contributions, and open source work.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <a
                  href={`https://github.com/${GITHUB_USERNAME}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors text-lg"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  View Full GitHub Profile
                </a>
                <button
                  onClick={refetch}
                  className="inline-flex items-center gap-2 px-8 py-4 border-2 border-purple-600 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white font-semibold rounded-lg transition-colors text-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Data
                </button>
              </div>
            </div>
          </Section>
        </>
      )}
    </div>
  );
}
