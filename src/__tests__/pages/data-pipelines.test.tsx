/**
 * Integration tests for the Data Pipelines page.
 *
 * The page (`src/app/data-pipelines/page.tsx`) is a large client component that:
 *  - fans out to many `@/lib/api` functions on mount (Reddit tab is the default),
 *  - toggles between a "Reddit Posts" and a "News Articles" tab (each tab re-runs
 *    `loadData()` via a dependency-driven effect),
 *  - has a "Run Pipeline" button that calls `runPipeline('day')` (Reddit tab) or
 *    `syncNewsArticles(...)` (Articles tab) and shows a "Running..." affordance,
 *  - lazily loads per-article NLP (entities/keywords) once articles are present,
 *    surfacing them via `EntityBadge` / `KeywordTag`,
 *  - and renders an error state in the Pipeline Status card when the initial
 *    (un-caught) fetches reject.
 *
 * These tests drive the high-value branches rather than chasing 100% coverage.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DataPipelinesPage from '@/app/data-pipelines/page';
import {
  getRedditPosts,
  getPipelineStatus,
  getSchedulerStatus,
  getPipelineMetrics,
  getPipelineRuns,
  getArticles,
  syncNewsArticles,
  getArticleSourceStats,
  getArticleEntities,
  getArticleKeywords,
  runPipeline,
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
  Keyword,
} from '@/types/api';

// Mock EVERY function the page imports from @/lib/api (verified against the
// page's import list on lines 5-17 of src/app/data-pipelines/page.tsx).
jest.mock('@/lib/api', () => ({
  getRedditPosts: jest.fn(),
  getPipelineStatus: jest.fn(),
  getSchedulerStatus: jest.fn(),
  getPipelineMetrics: jest.fn(),
  getPipelineRuns: jest.fn(),
  getArticles: jest.fn(),
  syncNewsArticles: jest.fn(),
  getArticleSourceStats: jest.fn(),
  getArticleEntities: jest.fn(),
  getArticleKeywords: jest.fn(),
  runPipeline: jest.fn(),
}));

const mock = (fn: unknown) => fn as jest.Mock;

// ---------------------------------------------------------------------------
// Fixtures (shapes taken from src/types/api.ts)
// ---------------------------------------------------------------------------

const mockRedditPost: RedditPost = {
  id: 'abc123',
  title: 'Test Reddit Post Title',
  author: 'testuser',
  subreddit: 'technology',
  content: 'Some reddit post body content.',
  url: 'https://reddit.com/r/technology/abc123',
  score: 100,
  num_comments: 25,
  upvote_ratio: 0.95,
  created_utc: '2026-01-15T10:00:00Z',
  retrieved_at: '2026-01-15T11:00:00Z',
  is_self: true,
  is_video: false,
  over_18: false,
  sentiment_score: 0.8,
  sentiment_label: 'positive',
  sentiment_analyzed_at: '2026-01-15T11:05:00Z',
};

const mockStatus: PipelineStatus = {
  status: 'active',
  total_posts: 1234,
  total_subreddits: 5,
  latest_post_date: '2026-01-15T10:00:00Z',
  configured_subreddits: ['technology', 'programming'],
  configured_search_queries: ['AI', 'machine learning'],
  sentiment_stats: { positive: 10, negative: 3, neutral: 7, analyzed: 20 },
};

const mockScheduler: SchedulerStatus = {
  running: true,
  total_jobs: 1,
  jobs: [
    {
      id: 'reddit_daily',
      name: 'collect_reddit',
      next_run_time: '2026-01-16T10:00:00Z',
      trigger: 'cron',
      pending: false,
    },
  ],
};

const mockMetrics: PipelineMetrics = {
  total_runs: 42,
  successful_runs: 40,
  failed_runs: 2,
  running_runs: 0,
  avg_duration_seconds: 12.5,
  avg_records_per_run: 100,
  total_records_processed: 4200,
  avg_success_rate: 95.2,
  last_run: null,
  recent_runs: [],
};

const mockRun: PipelineRun = {
  id: 1,
  run_id: 'run-1',
  pipeline_name: 'reddit_pipeline',
  trigger_type: 'manual',
  status: 'success',
  started_at: '2026-01-15T09:00:00Z',
  completed_at: '2026-01-15T09:01:00Z',
  duration_seconds: 60,
  records_processed: 100,
  records_stored: 90,
  records_updated: 5,
  records_failed: 5,
  data_quality_score: 95,
  validation_errors: 0,
  avg_processing_time_ms: 12,
  error_message: null,
  error_type: null,
  retry_count: 0,
  is_retry: false,
};

const mockArticle: Article = {
  id: 501,
  external_id: 'ext-501',
  source_type: 'news',
  source_name: 'TechCrunch',
  title: 'Test Article Headline',
  content: 'Full article body content.',
  summary: 'Article summary text.',
  url: 'https://techcrunch.com/test-article',
  image_url: null,
  author: 'Jane Reporter',
  author_url: null,
  published_at: '2026-01-14T08:00:00Z',
  retrieved_at: '2026-01-14T09:00:00Z',
  updated_at: null,
  score: 50,
  comment_count: 10,
  view_count: 1000,
  engagement_rate: 0.5,
  sentiment_score: 0.6,
  sentiment_label: 'positive',
  sentiment_analyzed_at: '2026-01-14T09:05:00Z',
  category: 'technology',
  tags: ['ai', 'tech'],
  language: 'en',
  is_video: false,
  is_verified_source: true,
  has_thumbnail: false,
  source_metadata: null,
};

const mockArticleStats: ArticleSourceStats = {
  total_articles: 1,
  by_source_type: [{ source_type: 'news', count: 1 }],
  top_sources: [{ source_name: 'TechCrunch', source_type: 'news', count: 1 }],
  date_range: { earliest: '2026-01-14T08:00:00Z', latest: '2026-01-14T08:00:00Z' },
};

const mockEntity: Entity = {
  id: 1,
  article_id: 501,
  entity_type: 'ORG',
  entity_text: 'OpenAI',
  start_char: 0,
  end_char: 6,
  created_at: '2026-01-14T09:00:00Z',
};

const mockKeyword: Keyword = {
  id: 1,
  article_id: 501,
  keyword: 'artificial intelligence',
  score: 0.42,
  created_at: '2026-01-14T09:00:00Z',
};

// ---------------------------------------------------------------------------
// Default happy-path resolved values so the initial loadData() composes cleanly.
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();

  mock(getRedditPosts).mockResolvedValue({
    posts: [mockRedditPost],
    total: 1,
    page: 1,
    page_size: 10,
  });
  mock(getPipelineStatus).mockResolvedValue(mockStatus);
  mock(getSchedulerStatus).mockResolvedValue(mockScheduler);
  mock(getPipelineMetrics).mockResolvedValue(mockMetrics);
  mock(getPipelineRuns).mockResolvedValue([mockRun]);
  mock(getArticles).mockResolvedValue({
    articles: [mockArticle],
    total: 1,
    page: 1,
    page_size: 10,
    total_pages: 1,
  });
  mock(getArticleSourceStats).mockResolvedValue(mockArticleStats);
  mock(getArticleEntities).mockResolvedValue({
    entities: [mockEntity],
    total: 1,
    limit: 0,
    offset: 0,
  });
  mock(getArticleKeywords).mockResolvedValue({ keywords: [mockKeyword], total: 1 });
  mock(runPipeline).mockResolvedValue({ status: 'ok', message: 'started' });
  mock(syncNewsArticles).mockResolvedValue({ status: 'ok', message: 'syncing' });
});

afterEach(() => {
  // Some tests enable fake timers to neutralize the page's 5s post-run reload
  // setTimeout; restoring here discards any pending fake timer and is a no-op
  // when real timers are already active.
  jest.useRealTimers();
});

describe('Data Pipelines page', () => {
  it('renders the hero and Reddit posts on initial load (Reddit tab default)', async () => {
    render(<DataPipelinesPage />);

    // Hero + default (Reddit) content resolve.
    expect(
      await screen.findByRole('heading', { name: 'Data Pipelines', level: 1 })
    ).toBeInTheDocument();
    expect(await screen.findByText('Test Reddit Post Title')).toBeInTheDocument();
    expect(screen.getByText('Recent Posts')).toBeInTheDocument();
    // Pipeline Status card rendered the status branch (total_posts).
    expect(screen.getByText('1234')).toBeInTheDocument();

    // The Reddit-branch fetches ran with the shapes the page uses.
    expect(getRedditPosts).toHaveBeenCalledWith({
      page: 1,
      page_size: 10,
      sentiment: undefined,
    });
    expect(getPipelineStatus).toHaveBeenCalled();
    expect(getSchedulerStatus).toHaveBeenCalled();
    expect(getPipelineMetrics).toHaveBeenCalledWith({ days: 7 });
    expect(getPipelineRuns).toHaveBeenCalledWith({ limit: 20 });

    // Articles are not fetched on the default tab.
    expect(getArticles).not.toHaveBeenCalled();
  });

  it('switches to the Articles tab and loads article content', async () => {
    render(<DataPipelinesPage />);
    await screen.findByText('Test Reddit Post Title');

    fireEvent.click(screen.getByRole('button', { name: 'News Articles' }));

    expect(await screen.findByText('Test Article Headline')).toBeInTheDocument();
    expect(screen.getByText('Recent Articles')).toBeInTheDocument();

    expect(getArticles).toHaveBeenCalledWith({
      page: 1,
      page_size: 10,
      sentiment: undefined,
      source_type: undefined,
    });
    expect(getArticleSourceStats).toHaveBeenCalled();
  });

  it('surfaces per-article NLP entities and keywords on the Articles tab', async () => {
    render(<DataPipelinesPage />);
    await screen.findByText('Test Reddit Post Title');

    fireEvent.click(screen.getByRole('button', { name: 'News Articles' }));
    await screen.findByText('Test Article Headline');

    // EntityBadge / KeywordTag surface once NLP resolves for the article.
    expect(await screen.findByText('OpenAI')).toBeInTheDocument();
    expect(await screen.findByText('artificial intelligence')).toBeInTheDocument();
    expect(screen.getByText('Named Entities')).toBeInTheDocument();
    expect(screen.getByText('Key Topics')).toBeInTheDocument();

    expect(getArticleEntities).toHaveBeenCalledWith(501);
    expect(getArticleKeywords).toHaveBeenCalledWith(501);
  });

  it('runs the Reddit pipeline and shows the running affordance', async () => {
    render(<DataPipelinesPage />);
    await screen.findByText('Test Reddit Post Title');

    // Fake timers neutralize the page's 5s post-run loadData() setTimeout.
    jest.useFakeTimers();

    const runButton = screen.getByRole('button', { name: 'Run Pipeline' });
    fireEvent.click(runButton);

    await waitFor(() => expect(runPipeline).toHaveBeenCalledWith('day'));
    expect(syncNewsArticles).not.toHaveBeenCalled();
    expect(runButton).toHaveTextContent('Running...');
    expect(runButton).toBeDisabled();
  });

  it('syncs news articles when running the pipeline on the Articles tab', async () => {
    render(<DataPipelinesPage />);
    await screen.findByText('Test Reddit Post Title');

    fireEvent.click(screen.getByRole('button', { name: 'News Articles' }));
    // Wait for articles + NLP to settle before switching to fake timers.
    await screen.findByText('OpenAI');

    jest.useFakeTimers();

    const runButton = screen.getByRole('button', { name: 'Run Pipeline' });
    fireEvent.click(runButton);

    await waitFor(() =>
      expect(syncNewsArticles).toHaveBeenCalledWith({
        category: 'technology',
        page_size: 20,
      })
    );
    expect(runPipeline).not.toHaveBeenCalled();
    expect(runButton).toHaveTextContent('Running...');
    expect(runButton).toBeDisabled();
  });

  it('renders the error state when the initial fetch rejects', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // getRedditPosts is awaited without a .catch(), so its rejection propagates
    // to loadData()'s try/catch and drives the error branch.
    mock(getRedditPosts).mockRejectedValue(new Error('Network boom'));

    render(<DataPipelinesPage />);

    expect(await screen.findByText('Network boom')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
