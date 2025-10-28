"""
Reddit Post Model
"""
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, Boolean
from sqlalchemy.sql import func
from app.db.database import Base


class RedditPost(Base):
    """Reddit post data model"""
    __tablename__ = "reddit_posts"

    id = Column(String, primary_key=True, index=True)  # Reddit post ID
    subreddit = Column(String, index=True, nullable=False)
    title = Column(Text, nullable=False)
    author = Column(String, index=True)
    content = Column(Text)
    url = Column(String)
    score = Column(Integer, default=0)
    num_comments = Column(Integer, default=0)
    upvote_ratio = Column(Float)
    created_utc = Column(DateTime, index=True)
    retrieved_at = Column(DateTime, server_default=func.now())

    # Sentiment Analysis Fields (will be populated later)
    sentiment_score = Column(Float, nullable=True)
    sentiment_label = Column(String, nullable=True)  # positive, negative, neutral
    sentiment_analyzed_at = Column(DateTime, nullable=True)

    # Flags
    is_self = Column(Boolean, default=False)
    is_video = Column(Boolean, default=False)
    over_18 = Column(Boolean, default=False)

    def __repr__(self):
        return f"<RedditPost(id={self.id}, subreddit={self.subreddit}, title={self.title[:50]})>"
