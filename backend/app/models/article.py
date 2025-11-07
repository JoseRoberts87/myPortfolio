"""
Article Model - Unified data model for content from all sources
Represents articles, posts, tweets, etc. in a consistent format
"""
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Article(Base):
    """
    Unified content model for all data sources

    Supports content from:
    - Reddit posts
    - News articles
    - Tweets
    - Blog posts
    - etc.
    """
    __tablename__ = "articles"

    # Primary identification
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    external_id = Column(String, unique=True, index=True, nullable=False)  # Source-specific ID

    # Source information
    source_type = Column(String(50), nullable=False, index=True)  # reddit, news, twitter, etc.
    source_name = Column(String(100), nullable=False, index=True)  # Specific source (e.g., "BBC News", "r/technology")

    # Content fields
    title = Column(String(500), nullable=False, index=True)
    content = Column(Text, nullable=True)  # Full text content
    summary = Column(Text, nullable=True)  # Short summary/excerpt
    url = Column(String(1000), nullable=True)
    image_url = Column(String(1000), nullable=True)

    # Author/creator information
    author = Column(String(200), nullable=True, index=True)
    author_url = Column(String(1000), nullable=True)

    # Timestamps
    published_at = Column(DateTime, nullable=False, index=True)  # When content was published
    retrieved_at = Column(DateTime, server_default=func.now(), nullable=False)  # When we fetched it
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Engagement metrics
    score = Column(Integer, default=0)  # Upvotes, likes, shares, etc.
    comment_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0, nullable=True)
    engagement_rate = Column(Float, nullable=True)  # Calculated engagement metric

    # Sentiment analysis
    sentiment_score = Column(Float, nullable=True)  # -1 to 1
    sentiment_label = Column(String(20), nullable=True, index=True)  # positive, negative, neutral
    sentiment_analyzed_at = Column(DateTime, nullable=True)

    # Classification
    category = Column(String(100), nullable=True, index=True)  # Technology, Politics, Sports, etc.
    tags = Column(JSON, nullable=True)  # Array of tags/keywords
    language = Column(String(10), default='en')  # Language code

    # Content flags
    is_video = Column(Boolean, default=False)
    is_verified_source = Column(Boolean, default=False)  # Verified account/source
    has_thumbnail = Column(Boolean, default=False)

    # Source-specific metadata (flexible JSON field)
    source_metadata = Column(JSON, nullable=True)
    # Examples:
    # - Reddit: {"subreddit": "technology", "upvote_ratio": 0.95, "num_awards": 3}
    # - News: {"publisher": "BBC", "section": "technology", "word_count": 1200}
    # - Twitter: {"retweet_count": 500, "quote_count": 50, "hashtags": ["AI", "ML"]}

    # Relationships
    entities = relationship("Entity", back_populates="article", cascade="all, delete-orphan")
    keywords = relationship("Keyword", back_populates="article", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Article(id={self.id}, source={self.source_type}, title='{self.title[:50]}...')>"

    @property
    def source_display_name(self) -> str:
        """Get formatted source display name"""
        if self.source_type == 'reddit':
            return f"r/{self.source_name}"
        elif self.source_type == 'twitter':
            return f"@{self.source_name}"
        return self.source_name

    def to_dict(self) -> dict:
        """Convert article to dictionary representation"""
        return {
            "id": self.id,
            "external_id": self.external_id,
            "source_type": self.source_type,
            "source_name": self.source_name,
            "title": self.title,
            "content": self.content,
            "summary": self.summary,
            "url": self.url,
            "image_url": self.image_url,
            "author": self.author,
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "retrieved_at": self.retrieved_at.isoformat() if self.retrieved_at else None,
            "score": self.score,
            "comment_count": self.comment_count,
            "sentiment_score": self.sentiment_score,
            "sentiment_label": self.sentiment_label,
            "category": self.category,
            "tags": self.tags,
            "source_metadata": self.source_metadata,
        }
