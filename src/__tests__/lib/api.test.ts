/**
 * Tests for API client functions
 */

import {
  getHealth,
  getAnalyticsOverview,
  getRedditPosts,
  getRedditPost,
  testRedditConnection,
  getPipelineStatus,
  runPipeline
} from '@/lib/api';

// Mock fetch globally
global.fetch = jest.fn();

describe('API Client', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getHealth', () => {
    it('should fetch health status successfully', async () => {
      const mockResponse = {
        status: 'healthy',
        service: 'portfolio-api',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getHealth();

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/health');
      expect(result).toEqual(mockResponse);
    });

    it('should handle fetch errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(getHealth()).rejects.toThrow('Network error');
    });
  });

  describe('getAnalyticsOverview', () => {
    it('should fetch analytics with default days parameter', async () => {
      const mockAnalytics = {
        post_volume: [],
        sentiment_trends: [],
        top_subreddits: [],
        sentiment_by_subreddit: [],
        engagement_metrics: null,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalytics,
        headers: {
          get: () => 'application/json',
        },
      });

      const result = await getAnalyticsOverview();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/analytics/overview?days=30',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockAnalytics);
    });

    it('should fetch analytics with custom days parameter', async () => {
      const mockAnalytics = {
        post_volume: [{ date: '2025-10-29', count: 10 }],
        sentiment_trends: [],
        top_subreddits: [],
        sentiment_by_subreddit: [],
        engagement_metrics: {
          avg_score: 50,
          max_score: 100,
          avg_comments: 10,
          max_comments: 50,
          avg_upvote_ratio: 0.9,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalytics,
        headers: {
          get: () => 'application/json',
        },
      });

      const result = await getAnalyticsOverview(7);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/analytics/overview?days=7',
        expect.anything()
      );
      expect(result.engagement_metrics?.avg_score).toBe(50);
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ detail: 'Server error' }),
      });

      await expect(getAnalyticsOverview()).rejects.toThrow();
    });
  });

  describe('getRedditPosts', () => {
    it('should fetch posts without parameters', async () => {
      const mockPosts = {
        posts: [],
        total: 0,
        page: 1,
        page_size: 20,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPosts,
        headers: {
          get: () => 'application/json',
        },
      });

      const result = await getRedditPosts();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/reddit/posts',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockPosts);
    });

    it('should fetch posts with subreddit filter', async () => {
      const mockPosts = {
        posts: [{ id: '1', title: 'Test Post', subreddit: 'Python' }],
        total: 1,
        page: 1,
        page_size: 20,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPosts,
        headers: {
          get: () => 'application/json',
        },
      });

      const result = await getRedditPosts({ subreddit: 'Python' });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/reddit/posts?subreddit=Python',
        expect.anything()
      );
      expect(result.posts).toHaveLength(1);
    });

    it('should fetch posts with sentiment filter', async () => {
      const mockPosts = {
        posts: [],
        total: 0,
        page: 1,
        page_size: 20,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPosts,
        headers: {
          get: () => 'application/json',
        },
      });

      await getRedditPosts({ sentiment: 'positive' });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/reddit/posts?sentiment=positive',
        expect.anything()
      );
    });

    it('should fetch posts with pagination parameters', async () => {
      const mockPosts = {
        posts: [],
        total: 100,
        page: 2,
        page_size: 50,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPosts,
        headers: {
          get: () => 'application/json',
        },
      });

      await getRedditPosts({ page: 2, page_size: 50 });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/reddit/posts?page=2&page_size=50',
        expect.anything()
      );
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ detail: 'Posts not found' }),
      });

      await expect(getRedditPosts()).rejects.toThrow();
    });
  });

  describe('getRedditPost', () => {
    it('should fetch a specific post by ID', async () => {
      const mockPost = {
        id: 'test123',
        title: 'Test Post',
        subreddit: 'Python',
        score: 100,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPost,
        headers: {
          get: () => 'application/json',
        },
      });

      const result = await getRedditPost('test123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/reddit/posts/test123',
        expect.anything()
      );
      expect(result.id).toBe('test123');
    });

    it('should handle post not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ detail: 'Post not found' }),
      });

      await expect(getRedditPost('nonexistent')).rejects.toThrow();
    });
  });

  describe('testRedditConnection', () => {
    it('should test Reddit connection successfully', async () => {
      const mockResponse = {
        status: 'success',
        message: 'Connected to Reddit API',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: {
          get: () => 'application/json',
        },
      });

      const result = await testRedditConnection();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/reddit/test-connection',
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result.status).toBe('success');
    });

    it('should handle connection failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ detail: 'Reddit API connection failed' }),
      });

      await expect(testRedditConnection()).rejects.toThrow();
    });
  });

  describe('getPipelineStatus', () => {
    it('should fetch pipeline status', async () => {
      const mockStatus = {
        is_running: false,
        last_run: '2025-10-29T12:00:00',
        total_posts: 1000,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus,
        headers: {
          get: () => 'application/json',
        },
      });

      const result = await getPipelineStatus();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/pipeline/status',
        expect.anything()
      );
      expect(result.total_posts).toBe(1000);
    });

    it('should handle status fetch error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ detail: 'Failed to get status' }),
      });

      await expect(getPipelineStatus()).rejects.toThrow();
    });
  });

  describe('runPipeline', () => {
    it('should run pipeline with default time filter', async () => {
      const mockResponse = {
        status: 'success',
        message: 'Pipeline started',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: {
          get: () => 'application/json',
        },
      });

      const result = await runPipeline();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/pipeline/run?time_filter=day',
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result.status).toBe('success');
    });

    it('should run pipeline with custom time filter', async () => {
      const mockResponse = {
        status: 'success',
        message: 'Pipeline started with week filter',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: {
          get: () => 'application/json',
        },
      });

      const result = await runPipeline('week');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/pipeline/run?time_filter=week',
        expect.anything()
      );
      expect(result.status).toBe('success');
    });

    it('should handle pipeline run failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ detail: 'Pipeline execution failed' }),
      });

      await expect(runPipeline()).rejects.toThrow();
    });
  });
});
