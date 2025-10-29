"""
Test Reddit Service
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime
from app.services.reddit_service import RedditService


class TestRedditService:
    """Tests for RedditService"""

    def test_init_creates_instance(self):
        """Test that RedditService can be instantiated"""
        service = RedditService()
        assert service is not None

    @patch('app.services.reddit_service.praw.Reddit')
    def test_test_connection_success(self, mock_reddit_class):
        """Test successful Reddit API connection"""
        # Mock Reddit instance
        mock_reddit = Mock()
        mock_user = Mock()
        mock_user.name = "test_user"
        mock_reddit.user.me.return_value = mock_user
        mock_reddit_class.return_value = mock_reddit

        service = RedditService()
        result = service.test_connection()

        assert result is True
        mock_reddit.user.me.assert_called_once()

    @patch('app.services.reddit_service.praw.Reddit')
    def test_test_connection_failure(self, mock_reddit_class):
        """Test failed Reddit API connection"""
        mock_reddit = Mock()
        mock_reddit.user.me.side_effect = Exception("Connection failed")
        mock_reddit_class.return_value = mock_reddit

        service = RedditService()
        result = service.test_connection()

        assert result is False

    @patch('app.services.reddit_service.praw.Reddit')
    def test_fetch_posts(self, mock_reddit_class):
        """Test fetching posts from a subreddit"""
        # Create mock submission
        mock_submission = Mock()
        mock_submission.id = "test123"
        mock_submission.title = "Test Post"
        mock_submission.author = Mock()
        mock_submission.author.__str__ = Mock(return_value="test_author")
        mock_submission.subreddit.display_name = "Python"
        mock_submission.selftext = "Test content"
        mock_submission.url = "https://reddit.com/test"
        mock_submission.score = 100
        mock_submission.num_comments = 50
        mock_submission.upvote_ratio = 0.95
        mock_submission.created_utc = datetime.utcnow().timestamp()
        mock_submission.is_self = True
        mock_submission.is_video = False
        mock_submission.over_18 = False

        # Mock Reddit instance
        mock_reddit = Mock()
        mock_subreddit = Mock()
        mock_subreddit.top.return_value = [mock_submission]
        mock_reddit.subreddit.return_value = mock_subreddit
        mock_reddit_class.return_value = mock_reddit

        service = RedditService()
        posts = service.fetch_posts("Python", limit=10, time_filter="day")

        assert len(posts) == 1
        assert posts[0].id == "test123"
        assert posts[0].title == "Test Post"
        assert posts[0].subreddit == "Python"

    @patch('app.services.reddit_service.praw.Reddit')
    def test_fetch_posts_with_deleted_author(self, mock_reddit_class):
        """Test fetching posts with deleted author"""
        mock_submission = Mock()
        mock_submission.id = "test456"
        mock_submission.title = "Test Post"
        mock_submission.author = None  # Deleted author
        mock_submission.subreddit.display_name = "Python"
        mock_submission.selftext = ""
        mock_submission.url = "https://reddit.com/test"
        mock_submission.score = 50
        mock_submission.num_comments = 10
        mock_submission.upvote_ratio = 0.85
        mock_submission.created_utc = datetime.utcnow().timestamp()
        mock_submission.is_self = False
        mock_submission.is_video = False
        mock_submission.over_18 = False

        mock_reddit = Mock()
        mock_subreddit = Mock()
        mock_subreddit.top.return_value = [mock_submission]
        mock_reddit.subreddit.return_value = mock_subreddit
        mock_reddit_class.return_value = mock_reddit

        service = RedditService()
        posts = service.fetch_posts("Python")

        assert len(posts) == 1
        assert posts[0].author == "[deleted]"

    @patch('app.services.reddit_service.praw.Reddit')
    def test_fetch_posts_error_handling(self, mock_reddit_class):
        """Test error handling when fetching posts"""
        mock_reddit = Mock()
        mock_reddit.subreddit.side_effect = Exception("API Error")
        mock_reddit_class.return_value = mock_reddit

        service = RedditService()

        # fetch_posts raises the exception instead of returning empty list
        with pytest.raises(Exception, match="API Error"):
            service.fetch_posts("Python")

    @patch('app.services.reddit_service.praw.Reddit')
    def test_fetch_posts_empty_result(self, mock_reddit_class):
        """Test fetching posts when no posts are returned"""
        mock_reddit = Mock()
        mock_subreddit = Mock()
        mock_subreddit.top.return_value = []
        mock_reddit.subreddit.return_value = mock_subreddit
        mock_reddit_class.return_value = mock_reddit

        service = RedditService()
        posts = service.fetch_posts("EmptySubreddit")

        assert posts == []

    @patch('app.services.reddit_service.praw.Reddit')
    def test_fetch_posts_multiple_submissions(self, mock_reddit_class):
        """Test fetching multiple posts from a subreddit"""
        mock_submission1 = Mock()
        mock_submission1.id = "test789"
        mock_submission1.title = "Test 1"
        mock_submission1.author = Mock()
        mock_submission1.author.__str__ = Mock(return_value="user1")
        mock_submission1.subreddit.display_name = "Python"
        mock_submission1.selftext = ""
        mock_submission1.url = "https://test.com/1"
        mock_submission1.score = 100
        mock_submission1.num_comments = 10
        mock_submission1.upvote_ratio = 0.95
        mock_submission1.created_utc = datetime.utcnow().timestamp()
        mock_submission1.is_self = False
        mock_submission1.is_video = False
        mock_submission1.over_18 = False

        mock_submission2 = Mock()
        mock_submission2.id = "test790"
        mock_submission2.title = "Test 2"
        mock_submission2.author = Mock()
        mock_submission2.author.__str__ = Mock(return_value="user2")
        mock_submission2.subreddit.display_name = "Python"
        mock_submission2.selftext = "Content"
        mock_submission2.url = "https://test.com/2"
        mock_submission2.score = 50
        mock_submission2.num_comments = 5
        mock_submission2.upvote_ratio = 0.90
        mock_submission2.created_utc = datetime.utcnow().timestamp()
        mock_submission2.is_self = True
        mock_submission2.is_video = False
        mock_submission2.over_18 = False

        mock_reddit = Mock()
        mock_subreddit = Mock()
        mock_subreddit.top.return_value = [mock_submission1, mock_submission2]
        mock_reddit.subreddit.return_value = mock_subreddit
        mock_reddit_class.return_value = mock_reddit

        service = RedditService()
        posts = service.fetch_posts("Python")

        assert len(posts) == 2
        assert posts[0].id == "test789"
        assert posts[1].id == "test790"

    @patch('app.services.reddit_service.praw.Reddit')
    def test_fetch_posts_from_all_subreddits(self, mock_reddit_class):
        """Test fetching posts from all configured subreddits"""
        mock_submission = Mock()
        mock_submission.id = "multi_test"
        mock_submission.title = "Multi Test"
        mock_submission.author = Mock()
        mock_submission.author.__str__ = Mock(return_value="test_user")
        mock_submission.subreddit.display_name = "Python"
        mock_submission.selftext = "Content"
        mock_submission.url = "https://test.com"
        mock_submission.score = 100
        mock_submission.num_comments = 10
        mock_submission.upvote_ratio = 0.95
        mock_submission.created_utc = datetime.utcnow().timestamp()
        mock_submission.is_self = True
        mock_submission.is_video = False
        mock_submission.over_18 = False

        mock_reddit = Mock()
        mock_subreddit = Mock()
        mock_subreddit.top.return_value = [mock_submission]
        mock_reddit.subreddit.return_value = mock_subreddit
        mock_reddit_class.return_value = mock_reddit

        service = RedditService()
        posts = service.fetch_posts_from_all_subreddits(limit_per_subreddit=10, time_filter="day")

        # Should fetch from all configured subreddits
        assert isinstance(posts, list)
        assert len(posts) > 0

    @patch('app.services.reddit_service.praw.Reddit')
    def test_fetch_posts_from_all_subreddits_with_failures(self, mock_reddit_class):
        """Test fetching from multiple subreddits with some failures"""
        mock_reddit = Mock()

        # First subreddit succeeds
        mock_submission = Mock()
        mock_submission.id = "success_test"
        mock_submission.title = "Success"
        mock_submission.author = Mock()
        mock_submission.author.__str__ = Mock(return_value="user")
        mock_submission.subreddit.display_name = "Python"
        mock_submission.selftext = ""
        mock_submission.url = "https://test.com"
        mock_submission.score = 50
        mock_submission.num_comments = 5
        mock_submission.upvote_ratio = 0.9
        mock_submission.created_utc = datetime.utcnow().timestamp()
        mock_submission.is_self = False
        mock_submission.is_video = False
        mock_submission.over_18 = False

        mock_subreddit_success = Mock()
        mock_subreddit_success.top.return_value = [mock_submission]

        # Second subreddit fails
        mock_subreddit_fail = Mock()
        mock_subreddit_fail.top.side_effect = Exception("Subreddit not found")

        # Alternate between success and failure
        call_count = 0
        def subreddit_side_effect(name):
            nonlocal call_count
            call_count += 1
            if call_count % 2 == 1:
                return mock_subreddit_success
            else:
                return mock_subreddit_fail

        mock_reddit.subreddit.side_effect = subreddit_side_effect
        mock_reddit_class.return_value = mock_reddit

        service = RedditService()
        # Should continue despite failures
        posts = service.fetch_posts_from_all_subreddits(limit_per_subreddit=5)

        # Should have at least some posts from successful subreddits
        assert isinstance(posts, list)
