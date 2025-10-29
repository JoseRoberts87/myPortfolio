"""
Test Analytics API Endpoints
"""
import pytest
from datetime import datetime, timedelta


class TestAnalyticsOverviewEndpoint:
    """Tests for GET /api/v1/analytics/overview"""

    def test_analytics_empty_database(self, client):
        """Test analytics with empty database"""
        response = client.get("/api/v1/analytics/overview?days=30")
        assert response.status_code == 200
        data = response.json()

        # Should return empty arrays but valid structure
        assert "post_volume" in data
        assert "sentiment_trends" in data
        assert "top_subreddits" in data
        assert "sentiment_by_subreddit" in data
        assert "engagement_metrics" in data

    def test_analytics_with_data(self, client, sample_posts_different_dates):
        """Test analytics returns correct structure with data"""
        response = client.get("/api/v1/analytics/overview?days=30")
        assert response.status_code == 200
        data = response.json()

        # Post volume should have daily data
        assert len(data["post_volume"]) > 0
        for item in data["post_volume"]:
            assert "date" in item
            assert "count" in item
            assert item["count"] > 0

        # Sentiment trends should have daily sentiment breakdown
        assert len(data["sentiment_trends"]) > 0
        for item in data["sentiment_trends"]:
            assert "date" in item
            assert "positive" in item
            assert "negative" in item
            assert "neutral" in item

        # Top subreddits
        assert len(data["top_subreddits"]) > 0
        for item in data["top_subreddits"]:
            assert "subreddit" in item
            assert "post_count" in item
            assert "avg_score" in item
            assert "avg_comments" in item

        # Sentiment by subreddit
        assert len(data["sentiment_by_subreddit"]) > 0
        for item in data["sentiment_by_subreddit"]:
            assert "subreddit" in item
            assert "positive" in item
            assert "negative" in item
            assert "neutral" in item

        # Engagement metrics
        metrics = data["engagement_metrics"]
        assert metrics is not None
        assert "avg_score" in metrics
        assert "max_score" in metrics
        assert "avg_comments" in metrics
        assert "max_comments" in metrics
        assert "avg_upvote_ratio" in metrics

    def test_analytics_different_time_ranges(self, client, sample_posts_different_dates):
        """Test analytics with different time ranges"""
        # 7 days
        response_7 = client.get("/api/v1/analytics/overview?days=7")
        assert response_7.status_code == 200
        data_7 = response_7.json()

        # 30 days
        response_30 = client.get("/api/v1/analytics/overview?days=30")
        assert response_30.status_code == 200
        data_30 = response_30.json()

        # 30 days should have more data points than 7 days
        assert len(data_30["post_volume"]) >= len(data_7["post_volume"])

    def test_analytics_post_volume_dates_ordered(self, client, sample_posts_different_dates):
        """Test that post volume data is ordered by date"""
        response = client.get("/api/v1/analytics/overview?days=30")
        assert response.status_code == 200
        data = response.json()

        post_volume = data["post_volume"]
        if len(post_volume) > 1:
            dates = [item["date"] for item in post_volume]
            assert dates == sorted(dates)

    def test_analytics_engagement_metrics_validity(self, client, sample_posts_different_dates):
        """Test that engagement metrics are calculated correctly"""
        response = client.get("/api/v1/analytics/overview?days=30")
        assert response.status_code == 200
        data = response.json()

        metrics = data["engagement_metrics"]
        assert metrics["avg_score"] > 0
        assert metrics["max_score"] >= metrics["avg_score"]
        assert metrics["avg_comments"] >= 0
        assert metrics["max_comments"] >= metrics["avg_comments"]
        assert 0 <= metrics["avg_upvote_ratio"] <= 1
