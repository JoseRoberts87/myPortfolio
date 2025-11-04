"""
Visit Tracking Schemas
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Any


class VisitBase(BaseModel):
    """Base schema for visit tracking"""
    page_url: str = Field(..., max_length=500, description="Page URL visited")
    referrer: Optional[str] = Field(None, max_length=500, description="Referrer URL")


class VisitCreate(VisitBase):
    """Schema for creating a visit record"""
    pass


class VisitResponse(BaseModel):
    """Schema for visit tracking response"""
    success: bool
    message: str
    visit_id: Optional[str] = None
    timestamp: datetime


class VisitDB(VisitBase):
    """Schema for visit record in database"""
    id: int
    visit_id: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    visited_at: datetime

    class Config:
        from_attributes = True


class ReferrerStat(BaseModel):
    """Schema for a single referrer statistic"""
    referrer: str
    count: int


class PageStat(BaseModel):
    """Schema for a single page visit statistic"""
    page: str
    count: int


class VisitStats(BaseModel):
    """Schema for visit statistics"""
    total_visits: int
    unique_visitors: int
    top_referrers: list[ReferrerStat]
    visits_by_page: list[PageStat]
    recent_visits: int  # Last 24 hours
