"""
Keyword Extraction Service
Extracts and manages keywords from article content using TF-IDF
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
import logging
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS
import numpy as np

from app.models.keyword import Keyword
from app.models.article import Article
from app.schemas.keyword import KeywordCreate, KeywordResponse

logger = logging.getLogger(__name__)


class KeywordService:
    """Service for keyword extraction and analysis"""

    def __init__(self, max_keywords: int = 10, min_df: int = 1, max_df: float = 0.85):
        """
        Initialize keyword service

        Args:
            max_keywords: Maximum number of keywords to extract per article
            min_df: Minimum document frequency for a term to be considered
            max_df: Maximum document frequency (terms appearing in > max_df% of docs are ignored)
        """
        self.max_keywords = max_keywords
        self.min_df = min_df
        self.max_df = max_df

        # Extended stop words (common words that aren't meaningful keywords)
        self.custom_stop_words = set(ENGLISH_STOP_WORDS).union({
            'said', 'says', 'new', 'just', 'like', 'way', 'know', 'people',
            'time', 'year', 'years', 'got', 'going', 'want', 'make', 'lot',
            'really', 'thing', 'things', 'use', 'used', 'don', 'didn', 've',
            'll', 're', 'isn', 'wasn', 'weren', 'won', 'shouldn', 'wouldn',
            'http', 'https', 'com', 'www', 'html'
        })

    def _preprocess_text(self, text: str) -> str:
        """
        Preprocess text for keyword extraction

        Args:
            text: Raw text to preprocess

        Returns:
            Cleaned text
        """
        if not text:
            return ""

        # Convert to lowercase
        text = text.lower()

        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)

        # Remove email addresses
        text = re.sub(r'\S+@\S+', '', text)

        # Remove special characters but keep spaces and alphanumeric
        text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)

        # Remove extra whitespace
        text = ' '.join(text.split())

        return text

    def extract_keywords_single(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract keywords from a single text using TF-IDF

        Args:
            text: Text to extract keywords from

        Returns:
            List of keyword dictionaries with 'keyword' and 'score'
        """
        if not text or not text.strip():
            return []

        try:
            # Preprocess text
            clean_text = self._preprocess_text(text)

            if not clean_text:
                return []

            # Create TF-IDF vectorizer
            vectorizer = TfidfVectorizer(
                max_features=self.max_keywords * 3,  # Get more candidates
                stop_words=list(self.custom_stop_words),
                ngram_range=(1, 2),  # Consider 1-2 word phrases
                min_df=1,
                max_df=1.0,
                lowercase=True,
                token_pattern=r'\b[a-zA-Z]{3,}\b'  # Words with 3+ letters
            )

            # Fit and transform
            tfidf_matrix = vectorizer.fit_transform([clean_text])
            feature_names = vectorizer.get_feature_names_out()

            # Get TF-IDF scores
            tfidf_scores = tfidf_matrix.toarray()[0]

            # Create keyword-score pairs
            keyword_scores = [
                {"keyword": feature_names[i], "score": float(tfidf_scores[i])}
                for i in range(len(feature_names))
                if tfidf_scores[i] > 0
            ]

            # Sort by score and take top keywords
            keyword_scores.sort(key=lambda x: x['score'], reverse=True)
            keywords = keyword_scores[:self.max_keywords]

            logger.debug(f"Extracted {len(keywords)} keywords from text of length {len(text)}")
            return keywords

        except Exception as e:
            logger.error(f"Error extracting keywords: {e}")
            return []

    def extract_and_save_keywords(
        self,
        article_id: int,
        text: str,
        db: Session
    ) -> List[Keyword]:
        """
        Extract keywords from text and save them to database

        Args:
            article_id: ID of the article
            text: Text to extract keywords from
            db: Database session

        Returns:
            List of created Keyword objects
        """
        # Extract keywords
        extracted_keywords = self.extract_keywords_single(text)

        if not extracted_keywords:
            logger.debug(f"No keywords found for article {article_id}")
            return []

        # Delete existing keywords for this article (in case of re-processing)
        db.query(Keyword).filter(Keyword.article_id == article_id).delete()

        # Create Keyword objects and save to database
        created_keywords = []
        for kw_data in extracted_keywords:
            keyword = Keyword(
                article_id=article_id,
                keyword=kw_data["keyword"],
                score=kw_data["score"]
            )
            db.add(keyword)
            created_keywords.append(keyword)

        try:
            db.commit()
            logger.info(f"Saved {len(created_keywords)} keywords for article {article_id}")
            return created_keywords
        except Exception as e:
            db.rollback()
            logger.error(f"Error saving keywords for article {article_id}: {e}")
            return []

    def process_article(self, article_id: int, db: Session) -> List[Keyword]:
        """
        Process an article and extract its keywords

        Args:
            article_id: ID of the article to process
            db: Database session

        Returns:
            List of created Keyword objects
        """
        # Fetch the article
        article = db.query(Article).filter(Article.id == article_id).first()
        if not article:
            logger.warning(f"Article {article_id} not found")
            return []

        # Combine title and content for keyword extraction
        text_to_process = f"{article.title} {article.content or ''}"

        return self.extract_and_save_keywords(article_id, text_to_process, db)

    def get_keyword_stats(self, db: Session) -> Dict[str, Any]:
        """
        Get statistics about keywords in the database

        Args:
            db: Database session

        Returns:
            Dictionary with keyword statistics
        """
        # Total keywords
        total_keywords = db.query(func.count(Keyword.id)).scalar() or 0

        # Unique keywords
        unique_keywords = db.query(func.count(func.distinct(Keyword.keyword))).scalar() or 0

        # Average score
        avg_score = db.query(func.avg(Keyword.score)).scalar() or 0.0

        # Top keywords (most frequently appearing)
        top_keywords = (
            db.query(
                Keyword.keyword,
                func.count(Keyword.id).label("count"),
                func.avg(Keyword.score).label("avg_score")
            )
            .group_by(Keyword.keyword)
            .order_by(desc("count"))
            .limit(20)
            .all()
        )

        top_keywords_list = [
            {
                "keyword": kw,
                "count": count,
                "avg_score": float(avg_score)
            }
            for kw, count, avg_score in top_keywords
        ]

        return {
            "total_keywords": total_keywords,
            "unique_keywords": unique_keywords,
            "avg_score": float(avg_score),
            "top_keywords": top_keywords_list
        }

    def get_trending_keywords(
        self,
        db: Session,
        time_window: str = "24h",
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Get trending keywords based on recent appearance frequency

        Args:
            db: Database session
            time_window: Time window for trending calculation (24h, 7d, 30d)
            limit: Maximum number of trending keywords to return

        Returns:
            List of trending keywords with their scores
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

        # Query keywords created within the time window
        trending = (
            db.query(
                Keyword.keyword,
                func.count(Keyword.id).label("mention_count"),
                func.count(func.distinct(Keyword.article_id)).label("article_count"),
                func.avg(Keyword.score).label("avg_score")
            )
            .filter(Keyword.created_at >= cutoff)
            .group_by(Keyword.keyword)
            .order_by(desc("mention_count"))
            .limit(limit)
            .all()
        )

        trending_list = []
        for keyword, mention_count, article_count, avg_score in trending:
            # Trending score: mentions × articles × avg_score
            trend_score = mention_count * article_count * float(avg_score)

            trending_list.append({
                "keyword": keyword,
                "mention_count": mention_count,
                "article_count": article_count,
                "avg_score": float(avg_score),
                "trend_score": trend_score,
                "time_window": time_window
            })

        # Sort by trend score
        trending_list.sort(key=lambda x: x["trend_score"], reverse=True)

        return trending_list


# Global keyword service instance
_keyword_service: Optional[KeywordService] = None


def get_keyword_service() -> KeywordService:
    """Get or create the global keyword service instance"""
    global _keyword_service
    if _keyword_service is None:
        _keyword_service = KeywordService()
    return _keyword_service
