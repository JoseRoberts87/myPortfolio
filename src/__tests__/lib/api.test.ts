/**
 * Tests for API client functions
 */

import { getHealth, getAnalyticsOverview } from '@/lib/api';

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
});
