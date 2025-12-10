"""
Data Pipeline API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime
from app.db import get_db
from app.models.reddit_post import RedditPost
from app.models.pipeline_run import PipelineRun
from app.services.reddit_service import RedditService
from app.services.sentiment_service import SentimentService
from app.services.cache_service import cache_service
from app.core.config import settings
import logging
import uuid
import time
import traceback

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
            time_filter=time_filter,
            trigger_type="manual"
        )

        return {
            "status": "started",
            "message": f"Pipeline started with time_filter={time_filter}. Processing in background."
        }
    except Exception as e:
        logger.error(f"Error starting pipeline: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def _execute_pipeline(time_filter: str = "day", trigger_type: str = "scheduled"):
    """
    Execute the data pipeline with metrics tracking

    Args:
        time_filter: Time filter for Reddit posts
        trigger_type: How the pipeline was triggered (manual, scheduled, api)
    """
    from app.db import get_session_local

    SessionLocal = get_session_local()
    db = SessionLocal()

    # Generate unique run ID
    run_id = str(uuid.uuid4())
    start_time = time.time()
    pipeline_run = None

    try:
        logger.info(f"Starting data pipeline (run_id={run_id}) with time_filter={time_filter}")

        # Create pipeline run record
        pipeline_run = PipelineRun(
            run_id=run_id,
            pipeline_name="reddit_pipeline",
            trigger_type=trigger_type,
            status="running"
        )
        db.add(pipeline_run)
        db.commit()

        # Initialize Reddit service
        reddit_service = RedditService()

        # Fetch posts from all configured subreddits
        posts = reddit_service.fetch_posts_from_all_subreddits(
            limit_per_subreddit=settings.REDDIT_POST_LIMIT,
            time_filter=time_filter
        )

        # Fetch posts from search queries (e.g., "hasbro")
        if reddit_service.search_queries:
            logger.info(f"Searching Reddit for queries: {reddit_service.search_queries}")
            search_posts = reddit_service.fetch_posts_from_all_search_queries(
                limit_per_query=settings.REDDIT_POST_LIMIT,
                time_filter=time_filter
            )
            posts.extend(search_posts)
            logger.info(f"Total posts after search queries: {len(posts)}")

        # Store posts in database with sentiment analysis
        stored_count = 0
        updated_count = 0
        failed_count = 0
        sentiment_analyzed_count = 0
        processing_times = []

        for post_data in posts:
            record_start = time.time()

            try:
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

                # Track processing time
                record_time = (time.time() - record_start) * 1000  # Convert to ms
                processing_times.append(record_time)

            except Exception as record_error:
                logger.error(f"Error processing post {post_data.id}: {str(record_error)}")
                failed_count += 1

        db.commit()

        # Invalidate cache after successful data update
        logger.info("Invalidating cache after pipeline execution...")
        cache_service.delete_pattern("cache:reddit_*")
        cache_service.delete_pattern("cache:stats_*")
        cache_service.delete_pattern("cache:analytics_*")
        logger.info("Cache invalidated successfully")

        # Calculate final metrics
        end_time = time.time()
        duration_seconds = end_time - start_time
        total_processed = stored_count + updated_count + failed_count
        avg_processing_time = sum(processing_times) / len(processing_times) if processing_times else 0

        # Update pipeline run with success metrics
        pipeline_run.status = "success"
        pipeline_run.completed_at = datetime.utcnow()
        pipeline_run.duration_seconds = duration_seconds
        pipeline_run.records_processed = total_processed
        pipeline_run.records_stored = stored_count
        pipeline_run.records_updated = updated_count
        pipeline_run.records_failed = failed_count
        pipeline_run.avg_processing_time_ms = avg_processing_time

        # Simple data quality score based on failure rate
        if total_processed > 0:
            pipeline_run.data_quality_score = ((total_processed - failed_count) / total_processed) * 100
        else:
            pipeline_run.data_quality_score = 100.0

        db.commit()

        logger.info(
            f"Pipeline completed (run_id={run_id}). "
            f"Duration: {duration_seconds:.2f}s, "
            f"Stored: {stored_count}, Updated: {updated_count}, Failed: {failed_count}, "
            f"Sentiment analyzed: {sentiment_analyzed_count}"
        )

    except Exception as e:
        logger.error(f"Pipeline execution failed (run_id={run_id}): {str(e)}")

        # Update pipeline run with failure information
        if pipeline_run:
            end_time = time.time()
            duration_seconds = end_time - start_time

            pipeline_run.status = "failed"
            pipeline_run.completed_at = datetime.utcnow()
            pipeline_run.duration_seconds = duration_seconds
            pipeline_run.error_message = str(e)
            pipeline_run.error_type = type(e).__name__
            pipeline_run.stack_trace = traceback.format_exc()

            try:
                db.commit()
            except Exception as commit_error:
                logger.error(f"Failed to update pipeline run with error: {str(commit_error)}")

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
            "configured_search_queries": [q.strip() for q in settings.REDDIT_SEARCH_QUERIES.split(',') if q.strip()],
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
