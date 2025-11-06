"""
Reddit API Service
Handles fetching data from Reddit using PRAW
"""
import praw
from datetime import datetime
from typing import List, Optional
from app.core.config import settings
from app.schemas.reddit import RedditPostCreate
from app.core.retry import api_retry, CircuitBreaker
import logging

logger = logging.getLogger(__name__)

# Circuit breaker for Reddit API
reddit_circuit_breaker = CircuitBreaker(failure_threshold=3, timeout=300)


class RedditService:
    """Service for interacting with Reddit API"""

    def __init__(self):
        """Initialize Reddit API client"""
        self.reddit = praw.Reddit(
            client_id=settings.REDDIT_CLIENT_ID,
            client_secret=settings.REDDIT_CLIENT_SECRET,
            user_agent=settings.REDDIT_USER_AGENT
        )
        self.subreddits = settings.REDDIT_SUBREDDITS.split(',')

    @api_retry
    def fetch_posts(
        self,
        subreddit_name: str,
        limit: int = 100,
        time_filter: str = "day"
    ) -> List[RedditPostCreate]:
        """
        Fetch posts from a specific subreddit

        Args:
            subreddit_name: Name of the subreddit
            limit: Maximum number of posts to fetch
            time_filter: Time filter (hour, day, week, month, year, all)

        Returns:
            List of RedditPostCreate objects
        """
        # Check circuit breaker
        if reddit_circuit_breaker.is_open():
            logger.error(f"Circuit breaker is open, skipping r/{subreddit_name}")
            raise Exception("Reddit API circuit breaker is open")

        try:
            subreddit = self.reddit.subreddit(subreddit_name)
            posts = []

            for submission in subreddit.top(time_filter=time_filter, limit=limit):
                post_data = self._submission_to_schema(submission)
                posts.append(post_data)

            logger.info(f"Fetched {len(posts)} posts from r/{subreddit_name}")
            reddit_circuit_breaker.record_success()
            return posts

        except Exception as e:
            logger.error(f"Error fetching posts from r/{subreddit_name}: {str(e)}")
            reddit_circuit_breaker.record_failure()
            raise

    def fetch_posts_from_all_subreddits(
        self,
        limit_per_subreddit: int = 100,
        time_filter: str = "day"
    ) -> List[RedditPostCreate]:
        """
        Fetch posts from all configured subreddits

        Args:
            limit_per_subreddit: Maximum posts per subreddit
            time_filter: Time filter

        Returns:
            Combined list of posts from all subreddits
        """
        all_posts = []

        for subreddit_name in self.subreddits:
            try:
                posts = self.fetch_posts(
                    subreddit_name.strip(),
                    limit=limit_per_subreddit,
                    time_filter=time_filter
                )
                all_posts.extend(posts)
            except Exception as e:
                logger.error(f"Failed to fetch from r/{subreddit_name}: {str(e)}")
                continue

        logger.info(f"Total posts fetched: {len(all_posts)}")
        return all_posts

    def _submission_to_schema(self, submission) -> RedditPostCreate:
        """
        Convert Reddit submission to RedditPostCreate schema

        Args:
            submission: PRAW submission object

        Returns:
            RedditPostCreate object
        """
        return RedditPostCreate(
            id=submission.id,
            subreddit=submission.subreddit.display_name,
            title=submission.title,
            author=str(submission.author) if submission.author else "[deleted]",
            content=submission.selftext if submission.is_self else None,
            url=submission.url,
            score=submission.score,
            num_comments=submission.num_comments,
            upvote_ratio=submission.upvote_ratio,
            created_utc=datetime.fromtimestamp(submission.created_utc),
            is_self=submission.is_self,
            is_video=submission.is_video,
            over_18=submission.over_18
        )

    def test_connection(self) -> bool:
        """
        Test Reddit API connection

        Returns:
            True if connection successful, False otherwise
        """
        try:
            # Try to fetch user info (read-only operation)
            user = self.reddit.user.me()
            logger.info(f"Reddit API connection successful. Authenticated as: {user}")
            return True
        except Exception as e:
            logger.error(f"Reddit API connection failed: {str(e)}")
            return False
