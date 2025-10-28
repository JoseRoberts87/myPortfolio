"""
Reddit API Schemas
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class RedditPostBase(BaseModel):
    """Base schema for Reddit post"""
    id: str
    subreddit: str
    title: str
    author: Optional[str] = None
    content: Optional[str] = None
    url: Optional[str] = None
    score: int = 0
    num_comments: int = 0
    upvote_ratio: Optional[float] = None
    created_utc: datetime
    is_self: bool = False
    is_video: bool = False
    over_18: bool = False


class RedditPostCreate(RedditPostBase):
    """Schema for creating a Reddit post"""
    pass


class RedditPostResponse(RedditPostBase):
    """Schema for Reddit post response"""
    retrieved_at: datetime
    sentiment_score: Optional[float] = None
    sentiment_label: Optional[str] = None
    sentiment_analyzed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RedditPostList(BaseModel):
    """Schema for list of Reddit posts"""
    posts: list[RedditPostResponse]
    total: int
    page: int
    page_size: int


class PipelineStats(BaseModel):
    """Schema for pipeline statistics"""
    total_posts: int
    posts_by_subreddit: dict[str, int]
    latest_post_date: Optional[datetime] = None
    oldest_post_date: Optional[datetime] = None
    average_score: float
    average_comments: float
