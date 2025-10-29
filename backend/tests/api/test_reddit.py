"""
Test Reddit API Endpoints
"""
import pytest
from datetime import datetime, timedelta


class TestRedditPostsEndpoint:
    """Tests for GET /api/v1/reddit/posts"""

    def test_get_posts_empty_database(self, client):
        """Test getting posts from empty database"""
        response = client.get("/api/v1/reddit/posts")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["posts"] == []
        assert data["page"] == 1
        assert data["page_size"] == 50

    def test_get_posts_with_data(self, client, sample_reddit_posts):
        """Test getting posts with data in database"""
        response = client.get("/api/v1/reddit/posts")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 15
        assert len(data["posts"]) == 15
        assert data["page"] == 1

    def test_get_posts_pagination(self, client, sample_reddit_posts):
        """Test posts pagination"""
        # Page 1, page_size 5
        response = client.get("/api/v1/reddit/posts?page=1&page_size=5")
        assert response.status_code == 200
        data = response.json()
        assert len(data["posts"]) == 5
        assert data["total"] == 15
        assert data["page"] == 1
        assert data["page_size"] == 5

        # Page 2, page_size 5
        response = client.get("/api/v1/reddit/posts?page=2&page_size=5")
        assert response.status_code == 200
        data = response.json()
        assert len(data["posts"]) == 5
        assert data["page"] == 2

    def test_filter_by_subreddit(self, client, sample_reddit_posts):
        """Test filtering posts by subreddit"""
        response = client.get("/api/v1/reddit/posts?subreddit=Python")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 5  # Should have 5 Python posts (0, 3, 6, 9, 12)
        for post in data["posts"]:
            assert post["subreddit"] == "Python"

    def test_filter_by_sentiment(self, client, sample_reddit_posts):
        """Test filtering posts by sentiment"""
        response = client.get("/api/v1/reddit/posts?sentiment=positive")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 5  # Should have 5 positive posts (0, 3, 6, 9, 12)
        for post in data["posts"]:
            assert post["sentiment_label"] == "positive"

    def test_filter_by_subreddit_and_sentiment(self, client, sample_reddit_posts):
        """Test filtering by multiple parameters"""
        response = client.get("/api/v1/reddit/posts?subreddit=Python&sentiment=positive")
        assert response.status_code == 200
        data = response.json()
        for post in data["posts"]:
            assert post["subreddit"] == "Python"
            assert post["sentiment_label"] == "positive"

    def test_invalid_sentiment_parameter(self, client):
        """Test that invalid sentiment returns error"""
        response = client.get("/api/v1/reddit/posts?sentiment=invalid")
        assert response.status_code == 422  # Validation error

    def test_posts_ordered_by_date(self, client, sample_reddit_posts):
        """Test that posts are ordered by created_utc descending"""
        response = client.get("/api/v1/reddit/posts")
        assert response.status_code == 200
        data = response.json()
        posts = data["posts"]

        # Check that posts are in descending order
        for i in range(len(posts) - 1):
            date1 = datetime.fromisoformat(posts[i]["created_utc"].replace('Z', '+00:00'))
            date2 = datetime.fromisoformat(posts[i+1]["created_utc"].replace('Z', '+00:00'))
            assert date1 >= date2


class TestRedditPostByIdEndpoint:
    """Tests for GET /api/v1/reddit/posts/{post_id}"""

    def test_get_post_by_id_success(self, client, test_db, sample_reddit_post):
        """Test getting a specific post by ID"""
        test_db.add(sample_reddit_post)
        test_db.commit()

        response = client.get(f"/api/v1/reddit/posts/{sample_reddit_post.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_reddit_post.id
        assert data["title"] == sample_reddit_post.title
        assert data["subreddit"] == sample_reddit_post.subreddit

    def test_get_post_by_id_not_found(self, client):
        """Test getting non-existent post returns 404"""
        response = client.get("/api/v1/reddit/posts/nonexistent_id")
        assert response.status_code == 404
        assert response.json()["detail"] == "Post not found"


class TestSubredditsEndpoint:
    """Tests for GET /api/v1/reddit/subreddits"""

    def test_get_subreddits_empty(self, client):
        """Test getting subreddits from empty database"""
        response = client.get("/api/v1/reddit/subreddits")
        assert response.status_code == 200
        assert response.json() == []

    def test_get_subreddits_with_data(self, client, sample_reddit_posts):
        """Test getting subreddits with post counts"""
        response = client.get("/api/v1/reddit/subreddits")
        assert response.status_code == 200
        data = response.json()

        # Should have 3 subreddits (Python, javascript, MachineLearning)
        assert len(data) == 3

        # Check that each subreddit has name and post count
        for item in data:
            assert "subreddit" in item
            assert "post_count" in item
            assert item["post_count"] > 0

        # Verify total posts matches
        total_posts = sum(item["post_count"] for item in data)
        assert total_posts == 15
