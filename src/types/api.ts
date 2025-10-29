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
