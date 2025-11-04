"""
Visit Tracking Model
"""
from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.sql import func
from app.db.database import Base


class Visit(Base):
    """Page visit tracking data model"""
    __tablename__ = "visits"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    visit_id = Column(String, unique=True, index=True, nullable=False)  # UUID

    # Visit Information
    page_url = Column(String(500), nullable=False, index=True)
    referrer = Column(String(500), nullable=True, index=True)

    # User Information
    ip_address = Column(String(50), nullable=True, index=True)
    user_agent = Column(Text, nullable=True)

    # Location (optional, can be enriched later)
    country = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)

    # Timestamp
    visited_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)

    def __repr__(self):
        return f"<Visit(id={self.id}, page_url={self.page_url}, referrer={self.referrer}, visited_at={self.visited_at})>"
