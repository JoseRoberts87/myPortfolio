"""
Keyword Model
Stores keywords extracted from articles using TF-IDF or other algorithms
"""
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Index, func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Keyword(Base):
    """
    Keywords extracted from article content

    Keywords are extracted using TF-IDF (Term Frequency-Inverse Document Frequency)
    to identify the most important terms in each article.
    """
    __tablename__ = "keywords"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Foreign key to article
    article_id = Column(Integer, ForeignKey("articles.id", ondelete="CASCADE"), nullable=False, index=True)

    # Keyword information
    keyword = Column(String(100), nullable=False, index=True)
    score = Column(Float, nullable=False)  # TF-IDF or importance score

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationship to article
    article = relationship("Article", back_populates="keywords")

    def __repr__(self):
        return f"<Keyword(id={self.id}, keyword='{self.keyword}', score={self.score:.4f})>"


# Create composite indexes for common queries
Index('idx_keywords_article', Keyword.article_id, Keyword.score.desc())
Index('idx_keywords_keyword', Keyword.keyword, Keyword.score.desc())
Index('idx_keywords_score', Keyword.score.desc())
Index('idx_keywords_created_at', Keyword.created_at.desc())
