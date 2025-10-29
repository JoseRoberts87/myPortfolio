"""
Data Pipeline API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime
from app.db import get_db
from app.models.reddit_post import RedditPost
from app.services.reddit_service import RedditService
from app.services.sentiment_service import SentimentService
from app.services.cache_service import cache_service
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/run")
async def run_pipeline(
    background_tasks: BackgroundTasks,
    time_filter: str = "day",
    db: Session = Depends(get_db)
):
    """
    Trigger the data pipeline to fetch and store Reddit posts

    Args:
        background_tasks: FastAPI background tasks
        time_filter: Time filter for posts (hour, day, week, month, year, all)
        db: Database session

    Returns:
        Pipeline execution status
    """
    try:
        # Run pipeline in background
        background_tasks.add_task(
            _execute_pipeline,
            time_filter=time_filter
        )

        return {
            "status": "started",
            "message": f"Pipeline started with time_filter={time_filter}. Processing in background."
        }
    except Exception as e:
        logger.error(f"Error starting pipeline: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def _execute_pipeline(time_filter: str = "day"):
    """
    Execute the data pipeline

    Args:
        time_filter: Time filter for Reddit posts
    """
    from app.db import get_session_local

    SessionLocal = get_session_local()
    db = SessionLocal()

    try:
        logger.info(f"Starting data pipeline with time_filter={time_filter}")

        # Initialize Reddit service
        reddit_service = RedditService()

        # Fetch posts from all configured subreddits
        posts = reddit_service.fetch_posts_from_all_subreddits(
            limit_per_subreddit=settings.REDDIT_POST_LIMIT,
            time_filter=time_filter
        )

        # Store posts in database with sentiment analysis
        stored_count = 0
        updated_count = 0
        sentiment_analyzed_count = 0

        for post_data in posts:
            # Perform sentiment analysis
            sentiment_score, sentiment_label = SentimentService.analyze_reddit_post(
                title=post_data.title,
                content=post_data.content
            )

            # Check if post already exists
            existing_post = db.query(RedditPost).filter(
                RedditPost.id == post_data.id
            ).first()

            if existing_post:
                # Update existing post
                for key, value in post_data.model_dump().items():
                    setattr(existing_post, key, value)

                # Update sentiment data
                if sentiment_score is not None:
                    existing_post.sentiment_score = sentiment_score
                    existing_post.sentiment_label = sentiment_label
                    existing_post.sentiment_analyzed_at = datetime.utcnow()
                    sentiment_analyzed_count += 1

                updated_count += 1
            else:
                # Create new post with sentiment data
                new_post = RedditPost(**post_data.model_dump())

                if sentiment_score is not None:
                    new_post.sentiment_score = sentiment_score
                    new_post.sentiment_label = sentiment_label
                    new_post.sentiment_analyzed_at = datetime.utcnow()
                    sentiment_analyzed_count += 1

                db.add(new_post)
                stored_count += 1

        db.commit()

        # Invalidate cache after successful data update
        logger.info("Invalidating cache after pipeline execution...")
        cache_service.delete_pattern("cache:reddit_*")
        cache_service.delete_pattern("cache:stats_*")
        cache_service.delete_pattern("cache:analytics_*")
        logger.info("Cache invalidated successfully")

        logger.info(f"Pipeline completed. Stored: {stored_count}, Updated: {updated_count}, Sentiment analyzed: {sentiment_analyzed_count}")

    except Exception as e:
        logger.error(f"Pipeline execution failed: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


@router.get("/status")
async def get_pipeline_status(db: Session = Depends(get_db)):
    """
    Get current pipeline status and statistics

    Returns:
        Pipeline status and database statistics
    """
    try:
        total_posts = db.query(RedditPost).count()
        subreddits = db.query(RedditPost.subreddit).distinct().count()

        # Get latest post date
        latest_post = db.query(RedditPost).order_by(
            RedditPost.created_utc.desc()
        ).first()

        # Get sentiment statistics
        positive_count = db.query(RedditPost).filter(
            RedditPost.sentiment_label == "positive"
        ).count()
        negative_count = db.query(RedditPost).filter(
            RedditPost.sentiment_label == "negative"
        ).count()
        neutral_count = db.query(RedditPost).filter(
            RedditPost.sentiment_label == "neutral"
        ).count()

        return {
            "status": "active",
            "total_posts": total_posts,
            "total_subreddits": subreddits,
            "latest_post_date": latest_post.created_utc if latest_post else None,
            "configured_subreddits": settings.REDDIT_SUBREDDITS.split(','),
            "sentiment_stats": {
                "positive": positive_count,
                "negative": negative_count,
                "neutral": neutral_count,
                "analyzed": positive_count + negative_count + neutral_count
            }
        }
    except Exception as e:
        logger.error(f"Error fetching pipeline status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
