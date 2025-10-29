"""
Test RedditPost Model
"""
import pytest
from datetime import datetime, timedelta
from app.models.reddit_post import RedditPost


class TestRedditPostModel:
    """Tests for RedditPost model"""

    def test_create_reddit_post(self):
        """Test creating a RedditPost instance"""
        post = RedditPost(
            id="test123",
            title="Test Title",
            author="test_user",
            subreddit="Python",
            content="Test content",
            url="https://reddit.com/test",
            score=100,
            num_comments=50,
            upvote_ratio=0.95,
            created_utc=datetime.utcnow(),
            is_self=True,
            is_video=False,
            over_18=False
        )

        assert post.id == "test123"
        assert post.title == "Test Title"
        assert post.author == "test_user"
        assert post.subreddit == "Python"
        assert post.score == 100
        assert post.num_comments == 50
        assert post.upvote_ratio == 0.95
        assert post.is_self is True

    def test_reddit_post_with_sentiment(self):
        """Test RedditPost with sentiment fields"""
        post = RedditPost(
            id="test456",
            title="Sentiment Test",
            author="user",
            subreddit="test",
            score=10,
            created_utc=datetime.utcnow(),
            sentiment_score=0.85,
            sentiment_label="positive",
            sentiment_analyzed_at=datetime.utcnow()
        )

        assert post.sentiment_score == 0.85
        assert post.sentiment_label == "positive"
        assert post.sentiment_analyzed_at is not None

    def test_reddit_post_repr(self):
        """Test string representation of RedditPost"""
        post = RedditPost(
            id="test789",
            title="A very long title that should be truncated in the repr",
            subreddit="Python",
            score=0,
            created_utc=datetime.utcnow()
        )

        repr_str = repr(post)
        assert "test789" in repr_str
        assert "Python" in repr_str
        assert "RedditPost" in repr_str

    def test_reddit_post_nullable_fields(self):
        """Test that nullable sentiment fields default to None"""
        post = RedditPost(
            id="test_defaults",
            title="Test",
            subreddit="test",
            score=50,
            num_comments=10,
            created_utc=datetime.utcnow()
        )

        # Check nullable sentiment fields
        assert post.sentiment_score is None
        assert post.sentiment_label is None
        assert post.sentiment_analyzed_at is None
        assert post.author is None  # Author can be deleted
        assert post.content is None  # Content can be None
        assert post.url is None
        assert post.upvote_ratio is None
