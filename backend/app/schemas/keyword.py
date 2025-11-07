"""
Keyword Schemas
Pydantic schemas for keyword data validation and serialization
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class KeywordBase(BaseModel):
    """Base keyword schema with common fields"""
    keyword: str = Field(..., min_length=1, max_length=100, description="The keyword text")
    score: float = Field(..., ge=0.0, description="TF-IDF or importance score")


class KeywordCreate(KeywordBase):
    """Schema for creating a new keyword"""
    article_id: int = Field(..., gt=0, description="ID of the article this keyword belongs to")


class KeywordResponse(KeywordBase):
    """Schema for keyword responses from API"""
    id: int
    article_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class KeywordListResponse(BaseModel):
    """Schema for paginated keyword list responses"""
    keywords: list[KeywordResponse]
    total: int = Field(..., ge=0, description="Total number of keywords matching filters")
    page: int = Field(..., ge=1, description="Current page number")
    page_size: int = Field(..., ge=1, le=100, description="Number of keywords per page")
    total_pages: int = Field(..., ge=0, description="Total number of pages")


class KeywordStats(BaseModel):
    """Schema for keyword statistics"""
    total_keywords: int = Field(..., ge=0, description="Total number of keywords")
    unique_keywords: int = Field(..., ge=0, description="Number of unique keywords")
    avg_score: float = Field(..., description="Average keyword score")
    top_keywords: list[dict[str, int | str | float]] = Field(..., description="Most frequently appearing keywords")


class KeywordTrending(BaseModel):
    """Schema for trending keywords"""
    keyword: str
    mention_count: int = Field(..., ge=0, description="Number of times keyword appears")
    article_count: int = Field(..., ge=0, description="Number of articles containing this keyword")
    avg_score: float = Field(..., description="Average TF-IDF score across articles")
    trend_score: float = Field(..., description="Trending score (higher = more trending)")
    time_window: str = Field(..., description="Time window for trending calculation (24h, 7d, 30d)")


class KeywordTrendingResponse(BaseModel):
    """Schema for trending keywords response"""
    trending: list[KeywordTrending]
    time_window: str
    generated_at: datetime


class KeywordCooccurrence(BaseModel):
    """Schema for keyword co-occurrence analysis"""
    keyword1: str
    keyword2: str
    cooccurrence_count: int = Field(..., ge=0, description="Number of times keywords appear together")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Co-occurrence confidence score")
