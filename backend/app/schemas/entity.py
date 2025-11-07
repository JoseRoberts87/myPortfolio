"""
Entity Schemas
Pydantic schemas for entity data validation and serialization
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class EntityBase(BaseModel):
    """Base entity schema with common fields"""
    entity_text: str = Field(..., min_length=1, max_length=200, description="The text of the entity")
    entity_type: str = Field(..., min_length=1, max_length=50, description="Entity type (PERSON, ORG, GPE, etc.)")
    start_char: Optional[int] = Field(None, ge=0, description="Starting character position in text")
    end_char: Optional[int] = Field(None, ge=0, description="Ending character position in text")
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="Confidence score from NER model")


class EntityCreate(EntityBase):
    """Schema for creating a new entity"""
    article_id: int = Field(..., gt=0, description="ID of the article this entity belongs to")


class EntityResponse(EntityBase):
    """Schema for entity responses from API"""
    id: int
    article_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EntityListResponse(BaseModel):
    """Schema for paginated entity list responses"""
    entities: list[EntityResponse]
    total: int = Field(..., ge=0, description="Total number of entities matching filters")
    page: int = Field(..., ge=1, description="Current page number")
    page_size: int = Field(..., ge=1, le=100, description="Number of entities per page")
    total_pages: int = Field(..., ge=0, description="Total number of pages")


class EntityStats(BaseModel):
    """Schema for entity statistics"""
    total_entities: int = Field(..., ge=0, description="Total number of entities")
    unique_entities: int = Field(..., ge=0, description="Number of unique entity texts")
    by_type: dict[str, int] = Field(..., description="Entity counts by type")
    top_entities: list[dict[str, int | str]] = Field(..., description="Most frequently mentioned entities")


class EntityTrending(BaseModel):
    """Schema for trending entities"""
    entity_text: str
    entity_type: str
    mention_count: int = Field(..., ge=0, description="Number of mentions")
    article_count: int = Field(..., ge=0, description="Number of articles mentioning this entity")
    trend_score: float = Field(..., description="Trending score (higher = more trending)")
    time_window: str = Field(..., description="Time window for trending calculation (24h, 7d, 30d)")


class EntityTrendingResponse(BaseModel):
    """Schema for trending entities response"""
    trending: list[EntityTrending]
    time_window: str
    generated_at: datetime
