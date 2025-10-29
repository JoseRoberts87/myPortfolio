"""
Statistics API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db import get_db
from app.models.reddit_post import RedditPost
from app.schemas.reddit import PipelineStats
from app.services.cache_service import cached
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/overview", response_model=PipelineStats)
@cached(prefix="stats_overview", ttl=settings.CACHE_STATS_TTL)
async def get_statistics_overview(db: Session = Depends(get_db)):
    """
    Get overall statistics for the data pipeline

    Args:
        db: Database session

    Returns:
        Pipeline statistics including counts, averages, and breakdowns
    """
    try:
        # Total posts
        total_posts = db.query(RedditPost).count()

        if total_posts == 0:
            raise HTTPException(
                status_code=404,
                detail="No data available. Run the pipeline first."
            )

        # Posts by subreddit
        subreddit_counts = db.query(
            RedditPost.subreddit,
            func.count(RedditPost.id).label('count')
        ).group_by(RedditPost.subreddit).all()

        posts_by_subreddit = {
            r.subreddit: r.count for r in subreddit_counts
        }

        # Date ranges
        latest_post_date = db.query(func.max(RedditPost.created_utc)).scalar()
        oldest_post_date = db.query(func.min(RedditPost.created_utc)).scalar()

        # Averages
        avg_score = db.query(func.avg(RedditPost.score)).scalar() or 0
        avg_comments = db.query(func.avg(RedditPost.num_comments)).scalar() or 0

        return PipelineStats(
            total_posts=total_posts,
            posts_by_subreddit=posts_by_subreddit,
            latest_post_date=latest_post_date,
            oldest_post_date=oldest_post_date,
            average_score=float(avg_score),
            average_comments=float(avg_comments)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/subreddit/{subreddit_name}")
@cached(prefix="stats_subreddit", ttl=settings.CACHE_STATS_TTL)
async def get_subreddit_stats(subreddit_name: str, db: Session = Depends(get_db)):
    """
    Get statistics for a specific subreddit

    Args:
        subreddit_name: Name of the subreddit
        db: Database session

    Returns:
        Statistics for the specified subreddit
    """
    try:
        posts = db.query(RedditPost).filter(
            RedditPost.subreddit == subreddit_name
        ).all()

        if not posts:
            raise HTTPException(
                status_code=404,
                detail=f"No posts found for subreddit: {subreddit_name}"
            )

        total_posts = len(posts)
        total_score = sum(p.score for p in posts)
        total_comments = sum(p.num_comments for p in posts)

        return {
            "subreddit": subreddit_name,
            "total_posts": total_posts,
            "average_score": total_score / total_posts if total_posts > 0 else 0,
            "average_comments": total_comments / total_posts if total_posts > 0 else 0,
            "top_post": max(posts, key=lambda p: p.score).title if posts else None,
            "latest_post_date": max(posts, key=lambda p: p.created_utc).created_utc if posts else None
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching subreddit stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
