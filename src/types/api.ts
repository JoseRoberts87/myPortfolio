/**
 * API Response Types
 * Types for data returned from the FastAPI backend
 */

export interface RedditPost {
  id: number;
  post_id: string;
  title: string;
  author: string;
  subreddit: string;
  created_at: string;
  score: number;
  url: string;
  num_comments: number;
  selftext: string | null;
  fetched_at: string;
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
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface HealthStatus {
  status: string;
  service: string;
}
