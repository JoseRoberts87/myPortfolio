"""
Contact Form Schemas
"""
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class ContactMessageBase(BaseModel):
    """Base schema for contact messages"""
    name: str = Field(..., min_length=2, max_length=100, description="Sender's full name")
    email: EmailStr = Field(..., description="Sender's email address")
    subject: str = Field(..., min_length=3, max_length=200, description="Message subject")
    message: str = Field(..., min_length=10, max_length=5000, description="Message content")
    company: Optional[str] = Field(None, max_length=100, description="Company name (optional)")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number (optional)")


class ContactMessageCreate(ContactMessageBase):
    """Schema for creating a contact message"""
    pass


class ContactMessageResponse(BaseModel):
    """Schema for contact message response"""
    success: bool
    message: str
    message_id: Optional[str] = None
    timestamp: datetime


class ContactMessageDB(ContactMessageBase):
    """Schema for contact message in database"""
    id: int
    submitted_at: datetime
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    status: str = "pending"  # pending, read, responded

    class Config:
        from_attributes = True
