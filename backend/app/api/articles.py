"""
Articles API Endpoints
Handles CRUD operations for articles from all data sources
"""
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc, func
from typing import Optional, List
from datetime import datetime
from app.db import get_db
from app.models.article import Article
from app.schemas.article import (
    ArticleResponse,
    ArticlesResponse,
    ArticleFilterParams,
    ArticleCreate
)
from app.services.news_service import NewsAPIService
from app.services.sentiment_service import SentimentService
from app.services.ner_service import get_ner_service
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/", response_model=ArticlesResponse)
async def get_articles(
    source_type: Optional[str] = Query(None, description="Filter by source type (news, reddit, twitter, etc.)"),
    source_name: Optional[str] = Query(None, description="Filter by source name"),
    category: Optional[str] = Query(None, description="Filter by category"),
    sentiment: Optional[str] = Query(None, description="Filter by sentiment (positive, negative, neutral)"),
    author: Optional[str] = Query(None, description="Filter by author"),
    language: Optional[str] = Query(None, description="Filter by language"),
    search_query: Optional[str] = Query(None, description="Search in title/content"),
    from_date: Optional[datetime] = Query(None, description="Filter from date"),
    to_date: Optional[datetime] = Query(None, description="Filter to date"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    sort_by: str = Query('published_at', description="Sort field"),
    sort_order: str = Query('desc', description="Sort order (asc/desc)"),
    db: Session = Depends(get_db)
):
    """
    Get articles with optional filtering, pagination, and sorting

    Supports filtering by:
    - Source type (news, reddit, twitter, etc.)
    - Source name (specific publication/subreddit)
    - Category
    - Sentiment
    - Author
    - Language
    - Date range
    - Search query (in title/content)
    """
    try:
        # Build query
        query = db.query(Article)

        # Apply filters
        if source_type:
            query = query.filter(Article.source_type == source_type)

        if source_name:
            query = query.filter(Article.source_name.ilike(f'%{source_name}%'))

        if category:
            query = query.filter(Article.category == category)

        if sentiment:
            query = query.filter(Article.sentiment_label == sentiment)

        if author:
            query = query.filter(Article.author.ilike(f'%{author}%'))

        if language:
            query = query.filter(Article.language == language)

        if search_query:
            # Search in title and content
            search_filter = or_(
                Article.title.ilike(f'%{search_query}%'),
                Article.content.ilike(f'%{search_query}%')
            )
            query = query.filter(search_filter)

        if from_date:
            query = query.filter(Article.published_at >= from_date)

        if to_date:
            query = query.filter(Article.published_at <= to_date)

        # Get total count before pagination
        total = query.count()

        # Apply sorting
        sort_column = getattr(Article, sort_by, Article.published_at)
        if sort_order == 'asc':
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))

        # Apply pagination
        offset = (page - 1) * page_size
        articles = query.offset(offset).limit(page_size).all()

        # Calculate total pages
        total_pages = (total + page_size - 1) // page_size

        return ArticlesResponse(
            articles=articles,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )

    except Exception as e:
        logger.error(f"Error fetching articles: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(article_id: int, db: Session = Depends(get_db)):
    """
    Get a specific article by ID

    Returns detailed information about a single article
    """
    try:
        article = db.query(Article).filter(Article.id == article_id).first()

        if not article:
            raise HTTPException(status_code=404, detail=f"Article {article_id} not found")

        return article

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching article {article_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sync/news")
async def sync_news_articles(
    background_tasks: BackgroundTasks,
    category: Optional[str] = Query(None, description="News category (technology, business, etc.)"),
    sources: Optional[str] = Query(None, description="Comma-separated source IDs"),
    page_size: int = Query(20, ge=1, le=100, description="Number of articles to fetch"),
    db: Session = Depends(get_db)
):
    """
    Trigger manual sync of news articles from NewsAPI

    This endpoint fetches the latest news articles and stores them in the database.
    The operation runs in the background to avoid blocking.

    Categories: business, entertainment, general, health, science, sports, technology
    """
    try:
        # Validate NEWS_API_KEY exists
        if not hasattr(settings, 'NEWS_API_KEY') or not settings.NEWS_API_KEY:
            raise HTTPException(
                status_code=500,
                detail="NEWS_API_KEY not configured. Please add it to environment variables."
            )

        # Run sync in background
        background_tasks.add_task(
            _sync_news_articles,
            category=category,
            sources=sources,
            page_size=page_size
        )

        return {
            "status": "started",
            "message": f"News article sync started. Fetching {page_size} articles.",
            "category": category,
            "sources": sources
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting news sync: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def _sync_news_articles(
    category: Optional[str] = None,
    sources: Optional[str] = None,
    page_size: int = 20
):
    """
    Background task to fetch and store news articles

    Args:
        category: News category filter
        sources: Source IDs filter
        page_size: Number of articles to fetch
    """
    from app.db import get_session_local

    SessionLocal = get_session_local()
    db = SessionLocal()

    try:
        logger.info(f"Starting news sync: category={category}, sources={sources}, page_size={page_size}")

        # Initialize News API service
        news_service = NewsAPIService(api_key=settings.NEWS_API_KEY)

        # Fetch articles
        articles = await news_service.fetch_and_transform(
            category=category,
            sources=sources,
            page_size=page_size,
            endpoint='top-headlines'
        )

        logger.info(f"Fetched {len(articles)} articles from News API")

        # Store articles with sentiment analysis
        stored_count = 0
        updated_count = 0
        failed_count = 0

        for article_data in articles:
            try:
                # Perform sentiment analysis on title + content
                text_to_analyze = f"{article_data.get('title', '')} {article_data.get('content', '')}"
                sentiment_score, sentiment_label = SentimentService.analyze_text(text_to_analyze)

                # Check if article already exists
                existing_article = db.query(Article).filter(
                    Article.external_id == article_data['id']
                ).first()

                if existing_article:
                    # Update existing article
                    for key, value in article_data.items():
                        if hasattr(existing_article, key):
                            setattr(existing_article, key, value)

                    # Update sentiment
                    if sentiment_score is not None:
                        existing_article.sentiment_score = sentiment_score
                        existing_article.sentiment_label = sentiment_label
                        existing_article.sentiment_analyzed_at = datetime.utcnow()

                    updated_count += 1
                else:
                    # Create new article
                    new_article = Article(
                        external_id=article_data['id'],
                        source_type=article_data['source_type'],
                        source_name=article_data['source_name'],
                        title=article_data['title'],
                        content=article_data.get('content'),
                        summary=article_data.get('summary'),
                        url=article_data.get('url'),
                        image_url=article_data.get('image_url'),
                        author=article_data.get('author'),
                        published_at=article_data['published_at'],
                        sentiment_score=sentiment_score,
                        sentiment_label=sentiment_label,
                        sentiment_analyzed_at=datetime.utcnow() if sentiment_score else None,
                        source_metadata=article_data.get('source_metadata')
                    )

                    db.add(new_article)
                    stored_count += 1

            except Exception as article_error:
                logger.error(f"Error processing article: {str(article_error)}")
                failed_count += 1

        db.commit()

        logger.info(
            f"News sync completed. Stored: {stored_count}, Updated: {updated_count}, Failed: {failed_count}"
        )

        # Extract entities for newly stored articles
        if stored_count > 0:
            try:
                logger.info(f"Starting NER processing for {stored_count} new articles")
                ner_service = get_ner_service()

                # Get all newly created articles from this batch
                for article_data in articles:
                    if article_data['id']:  # Only process if we have the article ID
                        article = db.query(Article).filter(
                            Article.external_id == article_data['id']
                        ).first()

                        if article:
                            try:
                                entities = ner_service.process_article(article.id, db)
                                logger.debug(f"Extracted {len(entities)} entities from article {article.id}")
                            except Exception as ner_error:
                                logger.error(f"NER processing failed for article {article.id}: {ner_error}")

                logger.info("NER processing completed for new articles")
            except Exception as ner_batch_error:
                logger.error(f"NER batch processing failed: {ner_batch_error}")

    except Exception as e:
        logger.error(f"News sync failed: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


@router.get("/stats/sources")
async def get_source_stats(db: Session = Depends(get_db)):
    """
    Get statistics about article sources

    Returns counts by source type and source name
    """
    try:
        # Count by source type
        source_types = db.query(
            Article.source_type,
            func.count(Article.id).label('count')
        ).group_by(Article.source_type).all()

        # Count by source name (top 10)
        source_names = db.query(
            Article.source_name,
            Article.source_type,
            func.count(Article.id).label('count')
        ).group_by(Article.source_name, Article.source_type)\
         .order_by(desc('count'))\
         .limit(10).all()

        # Get date range
        date_range = db.query(
            func.min(Article.published_at).label('earliest'),
            func.max(Article.published_at).label('latest')
        ).first()

        return {
            "total_articles": db.query(Article).count(),
            "by_source_type": [
                {"source_type": st, "count": count}
                for st, count in source_types
            ],
            "top_sources": [
                {"source_name": name, "source_type": stype, "count": count}
                for name, stype, count in source_names
            ],
            "date_range": {
                "earliest": date_range.earliest if date_range else None,
                "latest": date_range.latest if date_range else None
            }
        }

    except Exception as e:
        logger.error(f"Error fetching source stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
