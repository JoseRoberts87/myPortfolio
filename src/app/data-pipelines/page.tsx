'use client';

import { useState, useEffect } from 'react';
import { Section, Card, Badge } from '@/components/ui';
import {
  getRedditPosts,
  getPipelineStatus,
  runPipeline,
  getSchedulerStatus,
  getPipelineMetrics,
  getPipelineRuns,
  getArticles,
  syncNewsArticles,
  getArticleSourceStats,
  getArticleEntities,
  getArticleKeywords
} from '@/lib/api';
import type {
  RedditPost,
  PipelineStatus,
  SchedulerStatus,
  PipelineMetrics,
  PipelineRun,
  Article,
  ArticleSourceStats,
  Entity,
  Keyword
} from '@/types/api';
import { SchedulerStatusWidget } from '@/components/DataPipelines/SchedulerStatusWidget';
import { PipelineMetricsDashboard } from '@/components/DataPipelines/PipelineMetricsDashboard';
import { PipelineRunHistoryTable } from '@/components/DataPipelines/PipelineRunHistoryTable';
import { EntityBadge, KeywordTag } from '@/components/NLP';

export default function DataPipelinesPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'reddit' | 'articles'>('reddit');

  // Reddit state
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [status, setStatus] = useState<PipelineStatus | null>(null);

  // Articles state
  const [articles, setArticles] = useState<Article[]>([]);
  const [articleStats, setArticleStats] = useState<ArticleSourceStats | null>(null);

  // NLP data state (keyed by article ID)
  const [articleEntities, setArticleEntities] = useState<Record<number, Entity[]>>({});
  const [articleKeywords, setArticleKeywords] = useState<Record<number, Keyword[]>>({});
  const [loadingNLP, setLoadingNLP] = useState<Record<number, boolean>>({});

  // Shared state
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null);
  const [pipelineMetrics, setPipelineMetrics] = useState<PipelineMetrics | null>(null);
  const [pipelineRuns, setPipelineRuns] = useState<PipelineRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningPipeline, setRunningPipeline] = useState(false);
  const [sentimentFilter, setSentimentFilter] = useState<'positive' | 'negative' | 'neutral' | null>(null);
  const [sourceTypeFilter, setSourceTypeFilter] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [sentimentFilter, sourceTypeFilter, activeTab]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'reddit') {
        const [postsData, statusData, schedulerData, metricsData, runsData] = await Promise.all([
          getRedditPosts({
            page: 1,
            page_size: 10,
            sentiment: sentimentFilter || undefined
          }),
          getPipelineStatus(),
          getSchedulerStatus().catch(() => null),
          getPipelineMetrics({ days: 7 }).catch(() => null),
          getPipelineRuns({ limit: 20 }).catch(() => []),
        ]);

        setPosts(postsData.posts);
        setStatus(statusData);
        setSchedulerStatus(schedulerData);
        setPipelineMetrics(metricsData);
        setPipelineRuns(runsData);
      } else {
        const [articlesData, statsData, schedulerData, metricsData, runsData] = await Promise.all([
          getArticles({
            page: 1,
            page_size: 10,
            sentiment: sentimentFilter || undefined,
            source_type: sourceTypeFilter || undefined
          }),
          getArticleSourceStats().catch(() => null),
          getSchedulerStatus().catch(() => null),
          getPipelineMetrics({ days: 7 }).catch(() => null),
          getPipelineRuns({ limit: 20 }).catch(() => []),
        ]);

        setArticles(articlesData.articles);
        setArticleStats(statsData);
        setSchedulerStatus(schedulerData);
        setPipelineMetrics(metricsData);
        setPipelineRuns(runsData);
      }
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
      if (activeTab === 'reddit') {
        await runPipeline('day');
      } else {
        await syncNewsArticles({ category: 'technology', page_size: 20 });
      }

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

  // Load NLP data (entities and keywords) for an article
  async function loadArticleNLP(articleId: number) {
    // Skip if already loading or loaded
    if (loadingNLP[articleId] || (articleEntities[articleId] && articleKeywords[articleId])) {
      return;
    }

    setLoadingNLP(prev => ({ ...prev, [articleId]: true }));

    try {
      const [entitiesResponse, keywordsResponse] = await Promise.all([
        getArticleEntities(articleId).catch(() => ({ entities: [], total: 0, limit: 0, offset: 0 })),
        getArticleKeywords(articleId).catch(() => ({ keywords: [], total: 0 }))
      ]);

      setArticleEntities(prev => ({ ...prev, [articleId]: entitiesResponse.entities }));
      setArticleKeywords(prev => ({ ...prev, [articleId]: keywordsResponse.keywords }));
    } catch (err) {
      console.error(`Error loading NLP data for article ${articleId}:`, err);
    } finally {
      setLoadingNLP(prev => ({ ...prev, [articleId]: false }));
    }
  }

  // Load NLP data for all articles when articles change
  useEffect(() => {
    if (activeTab === 'articles' && articles.length > 0) {
      articles.forEach(article => {
        loadArticleNLP(article.id);
      });
    }
  }, [articles, activeTab]);

  function formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  }

  function getSentimentBadgeVariant(sentiment: string | null): 'success' | 'warning' | 'error' {
    if (sentiment === 'positive') return 'success';
    if (sentiment === 'negative') return 'error';
    return 'warning';
  }

  function getSentimentEmoji(sentiment: string | null): string {
    if (sentiment === 'positive') return '😊';
    if (sentiment === 'negative') return '😞';
    if (sentiment === 'neutral') return '😐';
    return '';
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

      {/* Scheduler and Metrics Section */}
      <Section padding="lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SchedulerStatusWidget
            schedulerStatus={schedulerStatus}
            loading={loading && !schedulerStatus}
          />
          <PipelineMetricsDashboard
            metrics={pipelineMetrics}
            loading={loading && !pipelineMetrics}
          />
        </div>
      </Section>

      {/* Pipeline Run History */}
      <Section padding="lg" background="subtle">
        <PipelineRunHistoryTable
          runs={pipelineRuns}
          loading={loading && pipelineRuns.length === 0}
        />
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
              <Badge variant="error" size="lg" className="mb-4">
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

          {/* Sentiment Distribution */}
          {status?.sentiment_stats && status.sentiment_stats.analyzed > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Sentiment Analysis</h3>
              <div className="space-y-3">
                {/* Positive */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300">😊 Positive</span>
                    <span className="text-sm font-semibold text-green-400">
                      {status.sentiment_stats.positive} ({Math.round((status.sentiment_stats.positive / status.sentiment_stats.analyzed) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${(status.sentiment_stats.positive / status.sentiment_stats.analyzed) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Neutral */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300">😐 Neutral</span>
                    <span className="text-sm font-semibold text-yellow-400">
                      {status.sentiment_stats.neutral} ({Math.round((status.sentiment_stats.neutral / status.sentiment_stats.analyzed) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all"
                      style={{ width: `${(status.sentiment_stats.neutral / status.sentiment_stats.analyzed) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Negative */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300">😞 Negative</span>
                    <span className="text-sm font-semibold text-red-400">
                      {status.sentiment_stats.negative} ({Math.round((status.sentiment_stats.negative / status.sentiment_stats.analyzed) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all"
                      style={{ width: `${(status.sentiment_stats.negative / status.sentiment_stats.analyzed) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

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

      {/* Recent Content Section with Tabs */}
      <Section padding="lg" background="subtle">
        {/* Tab Navigation */}
        <div className="flex items-center gap-4 mb-8 border-b border-gray-700">
          <button
            onClick={() => {
              setActiveTab('reddit');
              setSentimentFilter(null);
              setSourceTypeFilter(null);
            }}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'reddit'
                ? 'text-blue-400 border-blue-400'
                : 'text-gray-400 border-transparent hover:text-gray-300'
            }`}
          >
            Reddit Posts
          </button>
          <button
            onClick={() => {
              setActiveTab('articles');
              setSentimentFilter(null);
              setSourceTypeFilter(null);
            }}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'articles'
                ? 'text-blue-400 border-blue-400'
                : 'text-gray-400 border-transparent hover:text-gray-300'
            }`}
          >
            News Articles
          </button>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">
            {activeTab === 'reddit' ? 'Recent Posts' : 'Recent Articles'}
          </h2>

          {/* Sentiment Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Filter by sentiment:</span>
            <button
              onClick={() => setSentimentFilter(null)}
              className={`px-3 py-1 rounded-lg transition-colors ${
                sentimentFilter === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSentimentFilter('positive')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                sentimentFilter === 'positive'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Positive
            </button>
            <button
              onClick={() => setSentimentFilter('neutral')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                sentimentFilter === 'neutral'
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Neutral
            </button>
            <button
              onClick={() => setSentimentFilter('negative')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                sentimentFilter === 'negative'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Negative
            </button>
          </div>
        </div>

        {activeTab === 'reddit' ? (
          // Reddit Posts Display
          loading && posts.length === 0 ? (
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
                        {post.sentiment_label && (
                          <Badge
                            variant={getSentimentBadgeVariant(post.sentiment_label)}
                            size="sm"
                            className="cursor-help"
                            title={post.sentiment_score !== null ? `Sentiment Score: ${post.sentiment_score.toFixed(3)}` : undefined}
                          >
                            {getSentimentEmoji(post.sentiment_label)} {post.sentiment_label}
                          </Badge>
                        )}
                        <span className="text-sm text-gray-400">by u/{post.author || '[deleted]'}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-400">
                          {formatDate(post.created_utc)}
                        </span>
                      </div>

                      <a
                        href={post.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xl font-semibold hover:text-blue-400 transition-colors block mb-2"
                      >
                        {post.title}
                      </a>

                      {post.content && (
                        <p className="text-gray-400 line-clamp-2 mb-3">
                          {post.content}
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
          )
        ) : (
          // Articles Display
          loading && articles.length === 0 ? (
            <div className="text-center py-12 text-gray-400">Loading articles...</div>
          ) : articles.length === 0 ? (
            <Card variant="bordered" padding="lg">
              <div className="text-center py-12">
                <Badge variant="warning" size="lg" className="mb-4">
                  No Articles Yet
                </Badge>
                <h3 className="text-xl font-semibold mb-4">No articles collected yet</h3>
                <p className="text-gray-400 mb-6">
                  Sync news articles to start collecting data
                </p>
                <button
                  onClick={handleRunPipeline}
                  disabled={runningPipeline}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {runningPipeline ? 'Syncing Articles...' : 'Sync News Now'}
                </button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {articles.map((article) => (
                <Card key={article.id} variant="bordered" padding="lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="primary" size="sm">
                          {article.source_name}
                        </Badge>
                        {article.sentiment_label && (
                          <Badge
                            variant={getSentimentBadgeVariant(article.sentiment_label)}
                            size="sm"
                            className="cursor-help"
                            title={article.sentiment_score !== null ? `Sentiment Score: ${article.sentiment_score.toFixed(3)}` : undefined}
                          >
                            {getSentimentEmoji(article.sentiment_label)} {article.sentiment_label}
                          </Badge>
                        )}
                        {article.category && (
                          <Badge variant="secondary" size="sm">
                            {article.category}
                          </Badge>
                        )}
                        {article.author && (
                          <span className="text-sm text-gray-400">by {article.author}</span>
                        )}
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-400">
                          {formatDate(article.published_at)}
                        </span>
                      </div>

                      <a
                        href={article.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xl font-semibold hover:text-blue-400 transition-colors block mb-2"
                      >
                        {article.title}
                      </a>

                      {(article.summary || article.content) && (
                        <p className="text-gray-400 line-clamp-2 mb-3">
                          {article.summary || article.content}
                        </p>
                      )}

                      {article.image_url && (
                        <div className="mt-3 mb-3">
                          <img
                            src={article.image_url}
                            alt={article.title}
                            className="rounded-lg max-h-48 w-auto object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        </div>
                      )}

                      {/* NLP Features: Entities and Keywords */}
                      {(articleEntities[article.id]?.length > 0 || articleKeywords[article.id]?.length > 0) && (
                        <div className="mt-4 space-y-3 pt-3 border-t border-gray-700/50">
                          {/* Entities Section */}
                          {articleEntities[article.id]?.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold text-gray-400 uppercase">
                                  Named Entities
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({articleEntities[article.id].length})
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {articleEntities[article.id].slice(0, 8).map((entity, idx) => (
                                  <EntityBadge key={`${article.id}-entity-${idx}`} entity={entity} size="sm" />
                                ))}
                                {articleEntities[article.id].length > 8 && (
                                  <Badge variant="secondary" size="sm">
                                    +{articleEntities[article.id].length - 8} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Keywords Section */}
                          {articleKeywords[article.id]?.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold text-gray-400 uppercase">
                                  Key Topics
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({articleKeywords[article.id].length})
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {articleKeywords[article.id]
                                  .sort((a, b) => b.score - a.score)
                                  .slice(0, 10)
                                  .map((keyword, idx) => (
                                    <KeywordTag key={`${article.id}-keyword-${idx}`} keyword={keyword} size="sm" compact />
                                  ))}
                                {articleKeywords[article.id].length > 10 && (
                                  <Badge variant="secondary" size="sm">
                                    +{articleKeywords[article.id].length - 10} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Loading indicator for NLP data */}
                      {loadingNLP[article.id] && (
                        <div className="mt-4 pt-3 border-t border-gray-700/50">
                          <span className="text-xs text-gray-500 italic">
                            Loading NLP analysis...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )
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
