/**
 * API Service Layer
 * Functions for interacting with the FastAPI backend
 */

import type { RedditPostsResponse, PipelineStatus, HealthStatus, AnalyticsOverview } from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_V1 = `${API_URL}/api/v1`;

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_V1}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

/**
 * Health check endpoint
 */
export async function getHealth(): Promise<HealthStatus> {
  const response = await fetch(`${API_URL}/health`);
  return await response.json();
}

/**
 * Get Reddit posts with optional filters
 */
export async function getRedditPosts(params?: {
  subreddit?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  page?: number;
  page_size?: number;
}): Promise<RedditPostsResponse> {
  const queryParams = new URLSearchParams();

  if (params?.subreddit) queryParams.append('subreddit', params.subreddit);
  if (params?.sentiment) queryParams.append('sentiment', params.sentiment);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

  const query = queryParams.toString();
  const endpoint = `/reddit/posts${query ? `?${query}` : ''}`;

  return fetchApi<RedditPostsResponse>(endpoint);
}

/**
 * Get a specific Reddit post by ID
 */
export async function getRedditPost(postId: string): Promise<any> {
  return fetchApi(`/reddit/posts/${postId}`);
}

/**
 * Test Reddit API connection
 */
export async function testRedditConnection(): Promise<{ status: string; message: string }> {
  return fetchApi('/reddit/test-connection', { method: 'POST' });
}

/**
 * Get pipeline status
 */
export async function getPipelineStatus(): Promise<PipelineStatus> {
  return fetchApi('/pipeline/status');
}

/**
 * Run the data collection pipeline
 */
export async function runPipeline(timeFilter: 'day' | 'week' | 'month' | 'year' | 'all' = 'day'): Promise<{
  status: string;
  message: string;
}> {
  return fetchApi(`/pipeline/run?time_filter=${timeFilter}`, { method: 'POST' });
}

/**
 * Get analytics overview data
 */
export async function getAnalyticsOverview(days: number = 30): Promise<AnalyticsOverview> {
  return fetchApi<AnalyticsOverview>(`/analytics/overview?days=${days}`);
}
