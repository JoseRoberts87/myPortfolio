"""
Article Schemas - Pydantic models for API validation
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime


class ArticleBase(BaseModel):
    """Base schema for Article"""
    external_id: str = Field(..., description="Source-specific unique ID")
    source_type: str = Field(..., description="Type of source (reddit, news, twitter, etc.)")
    source_name: str = Field(..., description="Specific source name")
    title: str = Field(..., min_length=1, max_length=500)
    content: Optional[str] = None
    summary: Optional[str] = None
    url: Optional[str] = None
    image_url: Optional[str] = None
    author: Optional[str] = None
    author_url: Optional[str] = None
    published_at: datetime
    score: int = 0
    comment_count: int = 0
    view_count: Optional[int] = None
    engagement_rate: Optional[float] = None
    sentiment_score: Optional[float] = None
    sentiment_label: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    language: str = 'en'
    is_video: bool = False
    is_verified_source: bool = False
    has_thumbnail: bool = False
    source_metadata: Optional[Dict[str, Any]] = None


class ArticleCreate(ArticleBase):
    """Schema for creating a new article"""
    pass


class ArticleUpdate(BaseModel):
    """Schema for updating an article"""
    title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    score: Optional[int] = None
    comment_count: Optional[int] = None
    view_count: Optional[int] = None
    sentiment_score: Optional[float] = None
    sentiment_label: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    source_metadata: Optional[Dict[str, Any]] = None


class ArticleResponse(ArticleBase):
    """Schema for article response"""
    id: int
    retrieved_at: datetime
    updated_at: Optional[datetime] = None
    sentiment_analyzed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ArticlesResponse(BaseModel):
    """Schema for paginated articles response"""
    articles: List[ArticleResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class ArticleFilterParams(BaseModel):
    """Schema for article filter parameters"""
    source_type: Optional[str] = Field(None, description="Filter by source type")
    source_name: Optional[str] = Field(None, description="Filter by source name")
    category: Optional[str] = Field(None, description="Filter by category")
    sentiment: Optional[str] = Field(None, description="Filter by sentiment label")
    author: Optional[str] = Field(None, description="Filter by author")
    language: Optional[str] = Field(None, description="Filter by language")
    search_query: Optional[str] = Field(None, description="Search in title/content")
    from_date: Optional[datetime] = Field(None, description="Filter from date")
    to_date: Optional[datetime] = Field(None, description="Filter to date")
    page: int = Field(1, ge=1, description="Page number")
    page_size: int = Field(20, ge=1, le=100, description="Items per page")
    sort_by: str = Field('published_at', description="Sort field")
    sort_order: str = Field('desc', description="Sort order (asc/desc)")


class NewsAPIConfig(BaseModel):
    """Configuration for News API sources"""
    api_key: str
    query: Optional[str] = None
    sources: Optional[List[str]] = None  # BBC News, CNN, etc.
    category: Optional[str] = None  # business, entertainment, health, science, sports, technology
    language: str = 'en'
    page_size: int = 20
