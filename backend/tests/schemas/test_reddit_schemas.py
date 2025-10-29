"""
Test Reddit Pydantic Schemas
"""
import pytest
from datetime import datetime
from pydantic import ValidationError
from app.schemas.reddit import (
    RedditPostBase,
    RedditPostResponse,
    RedditPostList,
    PipelineStats
)


class TestRedditPostBase:
    """Tests for RedditPostBase schema"""

    def test_valid_reddit_post_base(self):
        """Test creating valid RedditPostBase"""
        data = {
            "id": "test123",
            "subreddit": "Python",
            "title": "Test Post",
            "created_utc": datetime.utcnow()
        }
        post = RedditPostBase(**data)

        assert post.id == "test123"
        assert post.subreddit == "Python"
        assert post.title == "Test Post"
        assert post.score == 0  # Default value
        assert post.num_comments == 0  # Default value
        assert post.is_self is False  # Default value

    def test_reddit_post_with_optional_fields(self):
        """Test RedditPostBase with all optional fields"""
        data = {
            "id": "test456",
            "subreddit": "test",
            "title": "Full Post",
            "author": "testuser",
            "content": "Post content here",
            "url": "https://reddit.com/test",
            "score": 100,
            "num_comments": 50,
            "upvote_ratio": 0.95,
            "created_utc": datetime.utcnow(),
            "is_self": True,
            "is_video": False,
            "over_18": False
        }
        post = RedditPostBase(**data)

        assert post.author == "testuser"
        assert post.content == "Post content here"
        assert post.score == 100
        assert post.upvote_ratio == 0.95

    def test_missing_required_field(self):
        """Test that missing required fields raise ValidationError"""
        with pytest.raises(ValidationError):
            RedditPostBase(
                id="test",
                subreddit="test"
                # Missing title and created_utc
            )

    def test_invalid_data_type(self):
        """Test that invalid data types raise ValidationError"""
        with pytest.raises(ValidationError):
            RedditPostBase(
                id="test",
                subreddit="test",
                title="Test",
                created_utc=datetime.utcnow(),
                score="not a number"  # Should be int
            )


class TestRedditPostResponse:
    """Tests for RedditPostResponse schema"""

    def test_reddit_post_response_with_sentiment(self):
        """Test RedditPostResponse with sentiment data"""
        data = {
            "id": "test789",
            "subreddit": "test",
            "title": "Test",
            "created_utc": datetime.utcnow(),
            "retrieved_at": datetime.utcnow(),
            "sentiment_score": 0.85,
            "sentiment_label": "positive",
            "sentiment_analyzed_at": datetime.utcnow()
        }
        post = RedditPostResponse(**data)

        assert post.sentiment_score == 0.85
        assert post.sentiment_label == "positive"
        assert post.sentiment_analyzed_at is not None

    def test_reddit_post_response_without_sentiment(self):
        """Test RedditPostResponse without sentiment data"""
        data = {
            "id": "test000",
            "subreddit": "test",
            "title": "Test",
            "created_utc": datetime.utcnow(),
            "retrieved_at": datetime.utcnow()
        }
        post = RedditPostResponse(**data)

        assert post.sentiment_score is None
        assert post.sentiment_label is None
        assert post.sentiment_analyzed_at is None


class TestRedditPostList:
    """Tests for RedditPostList schema"""

    def test_reddit_post_list_empty(self):
        """Test empty RedditPostList"""
        data = {
            "posts": [],
            "total": 0,
            "page": 1,
            "page_size": 50
        }
        post_list = RedditPostList(**data)

        assert len(post_list.posts) == 0
        assert post_list.total == 0
        assert post_list.page == 1
        assert post_list.page_size == 50

    def test_reddit_post_list_with_posts(self):
        """Test RedditPostList with posts"""
        now = datetime.utcnow()
        data = {
            "posts": [
                {
                    "id": "post1",
                    "subreddit": "test",
                    "title": "Post 1",
                    "created_utc": now,
                    "retrieved_at": now
                },
                {
                    "id": "post2",
                    "subreddit": "test",
                    "title": "Post 2",
                    "created_utc": now,
                    "retrieved_at": now
                }
            ],
            "total": 2,
            "page": 1,
            "page_size": 10
        }
        post_list = RedditPostList(**data)

        assert len(post_list.posts) == 2
        assert post_list.total == 2
        assert post_list.posts[0].id == "post1"
        assert post_list.posts[1].id == "post2"


class TestPipelineStats:
    """Tests for PipelineStats schema"""

    def test_pipeline_stats_basic(self):
        """Test basic PipelineStats"""
        data = {
            "total_posts": 100,
            "posts_by_subreddit": {
                "Python": 50,
                "javascript": 30,
                "MachineLearning": 20
            },
            "average_score": 45.5,
            "average_comments": 12.3
        }
        stats = PipelineStats(**data)

        assert stats.total_posts == 100
        assert stats.posts_by_subreddit["Python"] == 50
        assert stats.average_score == 45.5
        assert stats.average_comments == 12.3
        assert stats.latest_post_date is None
        assert stats.oldest_post_date is None

    def test_pipeline_stats_with_dates(self):
        """Test PipelineStats with date fields"""
        now = datetime.utcnow()
        data = {
            "total_posts": 50,
            "posts_by_subreddit": {"test": 50},
            "latest_post_date": now,
            "oldest_post_date": now,
            "average_score": 10.0,
            "average_comments": 5.0
        }
        stats = PipelineStats(**data)

        assert stats.latest_post_date == now
        assert stats.oldest_post_date == now

    def test_pipeline_stats_validation(self):
        """Test PipelineStats validation"""
        with pytest.raises(ValidationError):
            PipelineStats(
                total_posts="not a number",  # Should be int
                posts_by_subreddit={},
                average_score=0.0,
                average_comments=0.0
            )
