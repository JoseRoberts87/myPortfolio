'use client';

import { useState, useEffect } from 'react';
import { Section, Card, Badge } from '@/components/ui';
import { getRedditPosts, getPipelineStatus, runPipeline } from '@/lib/api';
import type { RedditPost, PipelineStatus } from '@/types/api';

export default function DataPipelinesPage() {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [status, setStatus] = useState<PipelineStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningPipeline, setRunningPipeline] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const [postsData, statusData] = await Promise.all([
        getRedditPosts({ page: 1, page_size: 10 }),
        getPipelineStatus(),
      ]);

      setPosts(postsData.posts);
      setStatus(statusData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRunPipeline() {
    try {
      setRunningPipeline(true);
      await runPipeline('day');

      // Wait a few seconds and reload data
      setTimeout(() => {
        loadData();
        setRunningPipeline(false);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run pipeline');
      setRunningPipeline(false);
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="min-h-screen pt-16">
      <Section padding="xl" background="subtle">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Data Pipelines
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Real-time social media data ingestion, processing, and storage using FastAPI and PostgreSQL.
          </p>
        </div>
      </Section>

      {/* Pipeline Status Section */}
      <Section padding="lg">
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Pipeline Status</h2>
            <button
              onClick={handleRunPipeline}
              disabled={runningPipeline || loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {runningPipeline ? 'Running...' : 'Run Pipeline'}
            </button>
          </div>

          {loading && !status ? (
            <div className="text-center py-8 text-gray-400">Loading status...</div>
          ) : error ? (
            <div className="text-center py-8">
              <Badge variant="danger" size="lg" className="mb-4">
                Error
              </Badge>
              <p className="text-red-400">{error}</p>
              <button
                onClick={loadData}
                className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          ) : status ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{status.total_posts}</div>
                <div className="text-gray-400 mt-1">Total Posts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{status.total_subreddits}</div>
                <div className="text-gray-400 mt-1">Subreddits</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {status.configured_subreddits.length}
                </div>
                <div className="text-gray-400 mt-1">Configured</div>
              </div>
              <div className="text-center">
                <Badge variant={status.status === 'active' ? 'success' : 'warning'} size="lg">
                  {status.status}
                </Badge>
                <div className="text-gray-400 mt-1">Status</div>
              </div>
            </div>
          ) : null}

          {status && status.configured_subreddits.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Configured Subreddits</h3>
              <div className="flex flex-wrap gap-2">
                {status.configured_subreddits.map((subreddit) => (
                  <Badge key={subreddit} variant="primary">
                    r/{subreddit}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      </Section>

      {/* Recent Posts Section */}
      <Section padding="lg" background="subtle">
        <h2 className="text-3xl font-bold mb-8">Recent Posts</h2>

        {loading && posts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Loading posts...</div>
        ) : posts.length === 0 ? (
          <Card variant="bordered" padding="lg">
            <div className="text-center py-12">
              <Badge variant="warning" size="lg" className="mb-4">
                No Data Yet
              </Badge>
              <h3 className="text-xl font-semibold mb-4">No posts collected yet</h3>
              <p className="text-gray-400 mb-6">
                Run the pipeline to start collecting Reddit data
              </p>
              <button
                onClick={handleRunPipeline}
                disabled={runningPipeline}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {runningPipeline ? 'Running Pipeline...' : 'Run Pipeline Now'}
              </button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {posts.map((post) => (
              <Card key={post.id} variant="bordered" padding="lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="primary" size="sm">
                        r/{post.subreddit}
                      </Badge>
                      <span className="text-sm text-gray-400">by u/{post.author}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-400">
                        {formatDate(post.created_at)}
                      </span>
                    </div>

                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xl font-semibold hover:text-blue-400 transition-colors block mb-2"
                    >
                      {post.title}
                    </a>

                    {post.selftext && (
                      <p className="text-gray-400 line-clamp-2 mb-3">
                        {post.selftext}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>↑ {post.score.toLocaleString()} points</span>
                      <span>💬 {post.num_comments.toLocaleString()} comments</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>

      {/* Tech Stack Section */}
      <Section padding="lg">
        <h2 className="text-3xl font-bold mb-8">Technology Stack</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Backend (FastAPI)</h3>
            <p className="text-gray-400 mb-4">
              High-performance Python API with async support, automatic OpenAPI documentation, and data validation.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary">FastAPI</Badge>
              <Badge variant="primary">Python</Badge>
              <Badge variant="primary">SQLAlchemy</Badge>
            </div>
          </Card>

          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Database</h3>
            <p className="text-gray-400 mb-4">
              PostgreSQL with optimized schemas and indexes for efficient data storage and retrieval.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary">PostgreSQL</Badge>
              <Badge variant="primary">Railway</Badge>
            </div>
          </Card>

          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Data Collection</h3>
            <p className="text-gray-400 mb-4">
              Integration with Reddit API for real-time data collection with rate limiting and error handling.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary">Reddit API</Badge>
              <Badge variant="primary">PRAW</Badge>
            </div>
          </Card>

          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Deployment</h3>
            <p className="text-gray-400 mb-4">
              Deployed on Railway with automatic builds from GitHub and zero-downtime deployments.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary">Railway</Badge>
              <Badge variant="primary">Docker</Badge>
              <Badge variant="primary">GitHub Actions</Badge>
            </div>
          </Card>
        </div>
      </Section>
    </div>
  );
}
