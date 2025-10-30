"""
Contact Message Model
"""
from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.sql import func
from app.db.database import Base


class ContactMessage(Base):
    """Contact form message data model"""
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    message_id = Column(String, unique=True, index=True, nullable=False)  # UUID

    # Contact Information
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    subject = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    company = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)

    # Metadata
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(Text, nullable=True)
    submitted_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)

    # Status tracking
    status = Column(String(20), default="pending", nullable=False)  # pending, read, responded
    read_at = Column(DateTime, nullable=True)
    responded_at = Column(DateTime, nullable=True)

    # Email notification status
    email_sent = Column(String(20), default="pending", nullable=False)  # pending, sent, failed
    email_sent_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<ContactMessage(id={self.id}, name={self.name}, email={self.email}, subject={self.subject[:30]})>"
