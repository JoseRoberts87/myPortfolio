"""
Entities API Endpoints
Handles named entity operations and statistics
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional
from datetime import datetime

from app.db import get_db
from app.models.entity import Entity
from app.models.article import Article
from app.schemas.entity import (
    EntityResponse,
    EntityListResponse,
    EntityStats,
    EntityTrending,
    EntityTrendingResponse
)
from app.services.ner_service import get_ner_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/", response_model=EntityListResponse)
async def get_entities(
    entity_type: Optional[str] = Query(None, description="Filter by entity type (PERSON, ORG, GPE, etc.)"),
    entity_text: Optional[str] = Query(None, description="Search by entity text (partial match)"),
    article_id: Optional[int] = Query(None, description="Filter by article ID"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    sort_by: str = Query('created_at', description="Sort field"),
    sort_order: str = Query('desc', description="Sort order (asc/desc)"),
    db: Session = Depends(get_db)
):
    """
    Get entities with optional filtering, pagination, and sorting

    Supports filtering by:
    - Entity type (PERSON, ORG, GPE, LOC, DATE, etc.)
    - Entity text (partial match)
    - Article ID
    """
    try:
        # Build query
        query = db.query(Entity)

        # Apply filters
        if entity_type:
            query = query.filter(Entity.entity_type == entity_type)

        if entity_text:
            query = query.filter(Entity.entity_text.ilike(f'%{entity_text}%'))

        if article_id:
            query = query.filter(Entity.article_id == article_id)

        # Get total count before pagination
        total = query.count()

        # Apply sorting
        sort_column = getattr(Entity, sort_by, Entity.created_at)
        if sort_order == 'asc':
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(sort_column.desc())

        # Apply pagination
        offset = (page - 1) * page_size
        entities = query.offset(offset).limit(page_size).all()

        # Calculate total pages
        total_pages = (total + page_size - 1) // page_size

        return EntityListResponse(
            entities=[EntityResponse.model_validate(entity) for entity in entities],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )

    except Exception as e:
        logger.error(f"Error fetching entities: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats", response_model=EntityStats)
async def get_entity_stats(
    db: Session = Depends(get_db)
):
    """
    Get entity statistics

    Returns:
    - Total number of entities
    - Number of unique entity texts
    - Entity counts by type
    - Top 20 most mentioned entities
    """
    try:
        ner_service = get_ner_service()
        stats = ner_service.get_entity_stats(db)
        return EntityStats(**stats)

    except Exception as e:
        logger.error(f"Error fetching entity stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/trending", response_model=EntityTrendingResponse)
async def get_trending_entities(
    time_window: str = Query(
        "24h",
        description="Time window for trending calculation (24h, 7d, 30d)"
    ),
    limit: int = Query(20, ge=1, le=100, description="Number of trending entities to return"),
    db: Session = Depends(get_db)
):
    """
    Get trending entities based on recent mentions

    Time windows:
    - 24h: Entities trending in last 24 hours
    - 7d: Entities trending in last 7 days
    - 30d: Entities trending in last 30 days

    Returns entities sorted by trend score (mention_count * article_count)
    """
    try:
        # Validate time window
        if time_window not in ["24h", "7d", "30d"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid time window. Use '24h', '7d', or '30d'"
            )

        ner_service = get_ner_service()
        trending = ner_service.get_trending_entities(db, time_window, limit)

        return EntityTrendingResponse(
            trending=[EntityTrending(**item) for item in trending],
            time_window=time_window,
            generated_at=datetime.utcnow()
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching trending entities: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/process-article/{article_id}")
async def process_article_entities(
    article_id: int,
    db: Session = Depends(get_db)
):
    """
    Process an article to extract its entities

    This endpoint triggers entity extraction for a specific article.
    Useful for re-processing articles or processing articles that were
    added before NER was implemented.
    """
    try:
        # Check if article exists
        article = db.query(Article).filter(Article.id == article_id).first()
        if not article:
            raise HTTPException(status_code=404, detail=f"Article {article_id} not found")

        # Process the article
        ner_service = get_ner_service()
        entities = ner_service.process_article(article_id, db)

        logger.info(f"Processed article {article_id}, extracted {len(entities)} entities")

        return {
            "article_id": article_id,
            "entities_extracted": len(entities),
            "entity_types": list(set(e.entity_type for e in entities)),
            "message": f"Successfully extracted {len(entities)} entities from article {article_id}"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing article {article_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
