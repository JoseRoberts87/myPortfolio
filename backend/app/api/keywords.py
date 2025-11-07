"""
Keyword API endpoints
Provides access to keyword extraction results and statistics
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from app.db.database import get_db
from app.models.keyword import Keyword
from app.models.article import Article
from app.schemas.keyword import (
    KeywordResponse,
    KeywordListResponse,
    KeywordStats,
    KeywordTrendingResponse,
)
from app.services.keyword_service import get_keyword_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/", response_model=KeywordListResponse)
async def list_keywords(
    article_id: Optional[int] = Query(None, description="Filter by article ID"),
    keyword: Optional[str] = Query(None, description="Filter by keyword text"),
    min_score: Optional[float] = Query(None, ge=0.0, description="Minimum TF-IDF score"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum keywords to return"),
    offset: int = Query(0, ge=0, description="Number of keywords to skip"),
    db: Session = Depends(get_db),
):
    """
    List keywords with optional filtering

    - **article_id**: Filter keywords for a specific article
    - **keyword**: Filter by keyword text (partial match)
    - **min_score**: Only return keywords with score >= min_score
    - **limit**: Maximum number of keywords to return (default: 100)
    - **offset**: Number of keywords to skip for pagination
    """
    try:
        # Build query
        query = db.query(Keyword)

        # Apply filters
        if article_id is not None:
            query = query.filter(Keyword.article_id == article_id)

        if keyword:
            query = query.filter(Keyword.keyword.ilike(f"%{keyword}%"))

        if min_score is not None:
            query = query.filter(Keyword.score >= min_score)

        # Order by score descending
        query = query.order_by(desc(Keyword.score))

        # Get total count before pagination
        total = query.count()

        # Apply pagination
        keywords = query.offset(offset).limit(limit).all()

        return KeywordListResponse(
            keywords=keywords,
            total=total,
            limit=limit,
            offset=offset,
        )

    except Exception as e:
        logger.error(f"Error listing keywords: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve keywords")


@router.get("/stats", response_model=KeywordStats)
async def get_keyword_statistics(
    db: Session = Depends(get_db),
):
    """
    Get overall keyword statistics

    Returns:
    - Total number of keywords
    - Number of unique keywords
    - Average TF-IDF score
    - Top 20 most frequent keywords with their appearance counts and average scores
    """
    try:
        keyword_service = get_keyword_service()
        stats = keyword_service.get_keyword_stats(db)
        return stats

    except Exception as e:
        logger.error(f"Error getting keyword stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve keyword statistics")


@router.get("/trending", response_model=KeywordTrendingResponse)
async def get_trending_keywords(
    time_window: str = Query(
        "24h",
        description="Time window for trending calculation",
        regex="^(24h|7d|30d)$"
    ),
    limit: int = Query(20, ge=1, le=100, description="Number of trending keywords to return"),
    db: Session = Depends(get_db),
):
    """
    Get trending keywords based on recent appearance frequency

    - **time_window**: Time window for analysis (24h, 7d, or 30d)
    - **limit**: Number of trending keywords to return (default: 20)

    Trending score is calculated as: mention_count × article_count × avg_score
    """
    try:
        from datetime import datetime

        keyword_service = get_keyword_service()
        trending = keyword_service.get_trending_keywords(db, time_window, limit)

        return KeywordTrendingResponse(
            trending=trending,
            time_window=time_window,
            generated_at=datetime.utcnow(),
        )

    except Exception as e:
        logger.error(f"Error getting trending keywords: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve trending keywords")


@router.post("/process-article/{article_id}", response_model=KeywordListResponse)
async def process_article(
    article_id: int,
    db: Session = Depends(get_db),
):
    """
    Manually trigger keyword extraction for a specific article

    This will:
    1. Fetch the article from the database
    2. Extract keywords using TF-IDF
    3. Save keywords to the database (replacing any existing keywords)

    - **article_id**: ID of the article to process
    """
    try:
        # Check if article exists
        article = db.query(Article).filter(Article.id == article_id).first()
        if not article:
            raise HTTPException(status_code=404, detail=f"Article {article_id} not found")

        # Process article
        keyword_service = get_keyword_service()
        created_keywords = keyword_service.process_article(article_id, db)

        if not created_keywords:
            logger.warning(f"No keywords extracted for article {article_id}")
            return KeywordListResponse(
                keywords=[],
                total=0,
                page=1,
                page_size=100,
                total_pages=0,
            )

        logger.info(f"Extracted {len(created_keywords)} keywords for article {article_id}")

        return KeywordListResponse(
            keywords=created_keywords,
            total=len(created_keywords),
            page=1,
            page_size=100,
            total_pages=1,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing article {article_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to process article")


@router.get("/article/{article_id}", response_model=KeywordListResponse)
async def get_article_keywords(
    article_id: int,
    db: Session = Depends(get_db),
):
    """
    Get all keywords for a specific article, ordered by score

    - **article_id**: ID of the article
    """
    try:
        # Check if article exists
        article = db.query(Article).filter(Article.id == article_id).first()
        if not article:
            raise HTTPException(status_code=404, detail=f"Article {article_id} not found")

        # Get keywords
        keywords = (
            db.query(Keyword)
            .filter(Keyword.article_id == article_id)
            .order_by(desc(Keyword.score))
            .all()
        )

        return KeywordListResponse(
            keywords=keywords,
            total=len(keywords),
            page=1,
            page_size=100,
            total_pages=1 if keywords else 0,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting keywords for article {article_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve article keywords")
