"""
Named Entity Recognition Service
Extracts and manages named entities from article content using spaCy
"""
import spacy
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
import logging

from app.models.entity import Entity
from app.models.article import Article
from app.schemas.entity import EntityCreate, EntityResponse

logger = logging.getLogger(__name__)


class NERService:
    """Service for Named Entity Recognition operations"""

    def __init__(self):
        """Initialize NER service and load spaCy model"""
        try:
            self.nlp = spacy.load("en_core_web_sm")
            logger.info("spaCy model loaded successfully")
        except OSError as e:
            logger.error(f"Failed to load spaCy model: {e}")
            logger.error("Please run: python -m spacy download en_core_web_sm")
            raise

    def extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract named entities from text using spaCy

        Args:
            text: Text to extract entities from

        Returns:
            List of entity dictionaries with text, type, start, end, and confidence
        """
        if not text or not text.strip():
            return []

        try:
            doc = self.nlp(text)
            entities = []

            for ent in doc.ents:
                entities.append({
                    "entity_text": ent.text,
                    "entity_type": ent.label_,
                    "start_char": ent.start_char,
                    "end_char": ent.end_char,
                    # spaCy doesn't provide confidence by default, but we can use entity length as a proxy
                    "confidence": None
                })

            logger.debug(f"Extracted {len(entities)} entities from text of length {len(text)}")
            return entities

        except Exception as e:
            logger.error(f"Error extracting entities: {e}")
            return []

    def extract_and_save_entities(
        self,
        article_id: int,
        text: str,
        db: Session
    ) -> List[Entity]:
        """
        Extract entities from text and save them to database

        Args:
            article_id: ID of the article
            text: Text to extract entities from
            db: Database session

        Returns:
            List of created Entity objects
        """
        # Extract entities from text
        extracted_entities = self.extract_entities(text)

        if not extracted_entities:
            logger.debug(f"No entities found for article {article_id}")
            return []

        # Delete existing entities for this article (in case of re-processing)
        db.query(Entity).filter(Entity.article_id == article_id).delete()

        # Create Entity objects and save to database
        created_entities = []
        for entity_data in extracted_entities:
            entity = Entity(
                article_id=article_id,
                **entity_data
            )
            db.add(entity)
            created_entities.append(entity)

        try:
            db.commit()
            logger.info(f"Saved {len(created_entities)} entities for article {article_id}")
            return created_entities
        except Exception as e:
            db.rollback()
            logger.error(f"Error saving entities for article {article_id}: {e}")
            return []

    def process_article(self, article_id: int, db: Session) -> List[Entity]:
        """
        Process an article and extract its entities

        Args:
            article_id: ID of the article to process
            db: Database session

        Returns:
            List of created Entity objects
        """
        # Fetch the article
        article = db.query(Article).filter(Article.id == article_id).first()
        if not article:
            logger.warning(f"Article {article_id} not found")
            return []

        # Combine title and content for entity extraction
        text_to_process = f"{article.title}\n\n{article.content or ''}"

        return self.extract_and_save_entities(article_id, text_to_process, db)

    def get_entity_stats(self, db: Session) -> Dict[str, Any]:
        """
        Get statistics about entities in the database

        Args:
            db: Database session

        Returns:
            Dictionary with entity statistics
        """
        # Total entities
        total_entities = db.query(func.count(Entity.id)).scalar() or 0

        # Unique entities
        unique_entities = db.query(func.count(func.distinct(Entity.entity_text))).scalar() or 0

        # Entities by type
        entities_by_type = (
            db.query(Entity.entity_type, func.count(Entity.id))
            .group_by(Entity.entity_type)
            .order_by(desc(func.count(Entity.id)))
            .all()
        )
        by_type = {entity_type: count for entity_type, count in entities_by_type}

        # Top entities (most frequently mentioned)
        top_entities = (
            db.query(
                Entity.entity_text,
                Entity.entity_type,
                func.count(Entity.id).label("count")
            )
            .group_by(Entity.entity_text, Entity.entity_type)
            .order_by(desc("count"))
            .limit(20)
            .all()
        )

        top_entities_list = [
            {
                "entity_text": text,
                "entity_type": entity_type,
                "count": count
            }
            for text, entity_type, count in top_entities
        ]

        return {
            "total_entities": total_entities,
            "unique_entities": unique_entities,
            "by_type": by_type,
            "top_entities": top_entities_list
        }

    def get_trending_entities(
        self,
        db: Session,
        time_window: str = "24h",
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Get trending entities based on recent mention frequency

        Args:
            db: Database session
            time_window: Time window for trending calculation (24h, 7d, 30d)
            limit: Maximum number of trending entities to return

        Returns:
            List of trending entities with their scores
        """
        # Calculate time cutoff
        now = datetime.utcnow()
        if time_window == "24h":
            cutoff = now - timedelta(hours=24)
        elif time_window == "7d":
            cutoff = now - timedelta(days=7)
        elif time_window == "30d":
            cutoff = now - timedelta(days=30)
        else:
            cutoff = now - timedelta(hours=24)

        # Query entities created within the time window
        trending = (
            db.query(
                Entity.entity_text,
                Entity.entity_type,
                func.count(Entity.id).label("mention_count"),
                func.count(func.distinct(Entity.article_id)).label("article_count")
            )
            .filter(Entity.created_at >= cutoff)
            .group_by(Entity.entity_text, Entity.entity_type)
            .order_by(desc("mention_count"))
            .limit(limit)
            .all()
        )

        trending_list = []
        for text, entity_type, mention_count, article_count in trending:
            # Simple trending score: mentions * articles
            trend_score = mention_count * article_count

            trending_list.append({
                "entity_text": text,
                "entity_type": entity_type,
                "mention_count": mention_count,
                "article_count": article_count,
                "trend_score": trend_score,
                "time_window": time_window
            })

        return trending_list


# Global NER service instance
_ner_service: Optional[NERService] = None


def get_ner_service() -> NERService:
    """Get or create the global NER service instance"""
    global _ner_service
    if _ner_service is None:
        _ner_service = NERService()
    return _ner_service
