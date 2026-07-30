"""Tests for the statistics endpoints (`app/api/stats.py`)."""


class TestStatsOverview:
    def test_empty_database_returns_404(self, client):
        response = client.get("/api/v1/stats/overview")
        assert response.status_code == 404

    def test_with_data_returns_stats(self, client, sample_reddit_posts):
        response = client.get("/api/v1/stats/overview")
        assert response.status_code == 200
        data = response.json()
        assert data["total_posts"] == len(sample_reddit_posts)
        assert isinstance(data["posts_by_subreddit"], dict)
        assert "average_score" in data


class TestSubredditStats:
    def test_unknown_subreddit_returns_404(self, client):
        response = client.get("/api/v1/stats/subreddit/DoesNotExist")
        assert response.status_code == 404

    def test_known_subreddit_returns_stats(self, client, sample_reddit_posts):
        response = client.get("/api/v1/stats/subreddit/Python")
        assert response.status_code == 200
        data = response.json()
        assert data["subreddit"] == "Python"
        assert data["total_posts"] > 0
