"""
Entity Model
Stores named entities extracted from articles using NLP
"""
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Index, func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Entity(Base):
    """
    Named entities extracted from article content

    Entity types include:
    - PERSON: People, including fictional
    - ORG: Companies, agencies, institutions
    - GPE: Countries, cities, states (Geo-Political Entity)
    - LOC: Non-GPE locations
    - DATE: Absolute or relative dates or periods
    - TIME: Times smaller than a day
    - MONEY: Monetary values
    - PERCENT: Percentage values
    - PRODUCT: Objects, vehicles, foods, etc.
    - EVENT: Named hurricanes, battles, wars, sports events
    - WORK_OF_ART: Titles of books, songs, etc.
    - LAW: Named documents made into laws
    - LANGUAGE: Any named language
    """
    __tablename__ = "entities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Foreign key to article
    article_id = Column(Integer, ForeignKey("articles.id", ondelete="CASCADE"), nullable=False, index=True)

    # Entity information
    entity_text = Column(String(200), nullable=False, index=True)
    entity_type = Column(String(50), nullable=False, index=True)  # PERSON, ORG, GPE, etc.

    # Position in text
    start_char = Column(Integer, nullable=True)
    end_char = Column(Integer, nullable=True)

    # Confidence score (if available from model)
    confidence = Column(Float, nullable=True)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationship to article
    article = relationship("Article", back_populates="entities")

    def __repr__(self):
        return f"<Entity(id={self.id}, text='{self.entity_text}', type='{self.entity_type}')>"


# Create composite indexes for common queries
Index('idx_entities_article_type', Entity.article_id, Entity.entity_type)
Index('idx_entities_text_type', Entity.entity_text, Entity.entity_type)
Index('idx_entities_created_at', Entity.created_at.desc())
