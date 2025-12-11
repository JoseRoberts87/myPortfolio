/**
 * API Response Types
 * Types for data returned from the FastAPI backend
 */

export interface RedditPost {
  id: string;  // Reddit post ID (primary key)
  title: string;
  author: string | null;
  subreddit: string;
  content: string | null;  // Post text (selftext)
  url: string | null;
  score: number;
  num_comments: number;
  upvote_ratio: number | null;
  created_utc: string;  // Post creation time
  retrieved_at: string;  // Time we fetched it
  is_self: boolean;
  is_video: boolean;
  over_18: boolean;
  sentiment_score: number | null;
  sentiment_label: string | null;
  sentiment_analyzed_at: string | null;
}

export interface RedditPostsResponse {
  posts: RedditPost[];
  total: number;
  page: number;
  page_size: number;
}

export interface PipelineStatus {
  status: string;
  total_posts: number;
  total_subreddits: number;
  latest_post_date: string | null;
  configured_subreddits: string[];
  configured_search_queries?: string[];
  sentiment_stats?: {
    positive: number;
    negative: number;
    neutral: number;
    analyzed: number;
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface HealthStatus {
  status: string;
  service: string;
}

// Analytics types
export interface PostVolumeData {
  date: string;
  count: number;
}

export interface SentimentTrendData {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
}

export interface SubredditData {
  subreddit: string;
  post_count: number;
  avg_score: number;
  avg_comments: number;
}

export interface SubredditSentimentData {
  subreddit: string;
  positive: number;
  negative: number;
  neutral: number;
}

export interface EngagementMetrics {
  avg_score: number;
  max_score: number;
  avg_comments: number;
  max_comments: number;
  avg_upvote_ratio: number;
}

export interface AnalyticsOverview {
  post_volume: PostVolumeData[];
  sentiment_trends: SentimentTrendData[];
  top_subreddits: SubredditData[];
  sentiment_by_subreddit: SubredditSentimentData[];
  engagement_metrics: EngagementMetrics | null;
}

// Scheduler and Pipeline Run types
export interface Job {
  id: string;
  name: string;
  next_run_time: string | null;
  trigger: string;
  pending: boolean;
  metadata?: {
    function: string;
    trigger_type: string;
    trigger_args: Record<string, any>;
    next_run_time: string | null;
    added_at: string;
  };
}

export interface SchedulerStatus {
  running: boolean;
  total_jobs: number;
  jobs: Job[];
}

export interface PipelineRun {
  id: number;
  run_id: string;
  pipeline_name: string;
  trigger_type: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  records_processed: number;
  records_stored: number;
  records_updated: number;
  records_failed: number;
  data_quality_score: number | null;
  validation_errors: number;
  avg_processing_time_ms: number | null;
  error_message: string | null;
  error_type: string | null;
  retry_count: number;
  is_retry: boolean;
}

export interface PipelineMetrics {
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  running_runs: number;
  avg_duration_seconds: number;
  avg_records_per_run: number;
  total_records_processed: number;
  avg_success_rate: number;
  last_run: PipelineRun | null;
  recent_runs: PipelineRun[];
}

// Named Entity Recognition (NER) types
export interface Entity {
  id: number;
  article_id: number;
  entity_type: string;  // PERSON, ORG, GPE, LOC, etc.
  entity_text: string;
  start_char: number;
  end_char: number;
  created_at: string;
}

export interface EntityListResponse {
  entities: Entity[];
  total: number;
  limit: number;
  offset: number;
}

export interface EntityStats {
  total_entities: number;
  unique_entities: number;
  by_type: Array<{
    entity_type: string;
    count: number;
  }>;
  top_entities: Array<{
    entity_text: string;
    entity_type: string;
    count: number;
  }>;
}

// Keyword Extraction types
export interface Keyword {
  id: number;
  article_id: number;
  keyword: string;
  score: number;  // TF-IDF score
  created_at: string;
}

export interface KeywordListResponse {
  keywords: Keyword[];
  total: number;
  limit?: number;
  offset?: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
}

export interface KeywordStats {
  total_keywords: number;
  unique_keywords: number;
  avg_score: number;
  top_keywords: Array<{
    keyword: string;
    count: number;
    avg_score: number;
  }>;
}

export interface TrendingKeyword {
  keyword: string;
  mention_count: number;
  article_count: number;
  avg_score: number;
  trend_score: number;
  time_window: string;
}

export interface KeywordTrendingResponse {
  trending: TrendingKeyword[];
  time_window: string;
  generated_at: string;
}

// Articles types
export interface Article {
  id: number;
  external_id: string;
  source_type: string;
  source_name: string;
  title: string;
  content: string | null;
  summary: string | null;
  url: string | null;
  image_url: string | null;
  author: string | null;
  author_url: string | null;
  published_at: string;
  retrieved_at: string;
  updated_at: string | null;
  score: number | null;
  comment_count: number | null;
  view_count: number | null;
  engagement_rate: number | null;
  sentiment_score: number | null;
  sentiment_label: string | null;
  sentiment_analyzed_at: string | null;
  category: string | null;
  tags: string[] | null;
  language: string | null;
  is_video: boolean | null;
  is_verified_source: boolean | null;
  has_thumbnail: boolean | null;
  source_metadata: Record<string, any> | null;
  entities?: Entity[];  // Optional: populated when fetching article details
  keywords?: Keyword[];  // Optional: populated when fetching article details
}

export interface ArticlesResponse {
  articles: Article[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ArticleSourceStats {
  total_articles: number;
  by_source_type: Array<{
    source_type: string;
    count: number;
  }>;
  top_sources: Array<{
    source_name: string;
    source_type: string;
    count: number;
  }>;
  date_range: {
    earliest: string | null;
    latest: string | null;
  };
}
