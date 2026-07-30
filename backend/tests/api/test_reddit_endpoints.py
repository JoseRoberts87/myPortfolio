"""Tests for the Reddit endpoints (`app/api/reddit.py`)."""


class TestGetPosts:
    def test_empty_database(self, client):
        response = client.get("/api/v1/reddit/posts")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["posts"] == []

    def test_pagination_metadata(self, client, sample_reddit_posts):
        response = client.get("/api/v1/reddit/posts?page=1&page_size=5")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == len(sample_reddit_posts)
        assert data["page"] == 1
        assert data["page_size"] == 5
        assert len(data["posts"]) == 5

    def test_subreddit_filter(self, client, sample_reddit_posts):
        response = client.get("/api/v1/reddit/posts?subreddit=Python")
        assert response.status_code == 200
        for post in response.json()["posts"]:
            assert post["subreddit"] == "Python"

    def test_invalid_sentiment_returns_422(self, client):
        response = client.get("/api/v1/reddit/posts?sentiment=bogus")
        assert response.status_code == 422

    def test_page_must_be_positive(self, client):
        response = client.get("/api/v1/reddit/posts?page=0")
        assert response.status_code == 422


class TestGetPost:
    def test_missing_post_returns_404(self, client):
        response = client.get("/api/v1/reddit/posts/nonexistent_id")
        assert response.status_code == 404

    def test_existing_post(self, client, sample_reddit_posts):
        response = client.get("/api/v1/reddit/posts/test_post_0")
        assert response.status_code == 200
        assert response.json()["id"] == "test_post_0"


class TestSubreddits:
    def test_lists_subreddits_with_counts(self, client, sample_reddit_posts):
        response = client.get("/api/v1/reddit/subreddits")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert any(item["subreddit"] == "Python" for item in data)
