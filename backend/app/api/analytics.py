"""
Analytics API Endpoints
Provides aggregated data and statistics for dashboard visualizations
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from datetime import datetime, timedelta
from app.db import get_db
from app.models.reddit_post import RedditPost
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/overview")
async def get_analytics_overview(
    days: int = 30,
    db: Session = Depends(get_db)
):
    """
    Get comprehensive analytics overview

    Args:
        days: Number of days to include in time-series data (default: 30)
        db: Database session

    Returns:
        Analytics data including time-series, top subreddits, and engagement metrics
    """
    try:
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)

        # Post volume over time (daily)
        posts_over_time = db.query(
            cast(RedditPost.retrieved_at, Date).label('date'),
            func.count(RedditPost.id).label('count')
        ).filter(
            RedditPost.retrieved_at >= start_date
        ).group_by(
            cast(RedditPost.retrieved_at, Date)
        ).order_by(
            cast(RedditPost.retrieved_at, Date)
        ).all()

        # Sentiment trends over time (daily)
        sentiment_trends = db.query(
            cast(RedditPost.retrieved_at, Date).label('date'),
            RedditPost.sentiment_label,
            func.count(RedditPost.id).label('count')
        ).filter(
            RedditPost.retrieved_at >= start_date,
            RedditPost.sentiment_label.isnot(None)
        ).group_by(
            cast(RedditPost.retrieved_at, Date),
            RedditPost.sentiment_label
        ).order_by(
            cast(RedditPost.retrieved_at, Date)
        ).all()

        # Top subreddits by post count
        top_subreddits = db.query(
            RedditPost.subreddit,
            func.count(RedditPost.id).label('post_count'),
            func.avg(RedditPost.score).label('avg_score'),
            func.avg(RedditPost.num_comments).label('avg_comments')
        ).group_by(
            RedditPost.subreddit
        ).order_by(
            func.count(RedditPost.id).desc()
        ).limit(10).all()

        # Engagement metrics
        engagement_stats = db.query(
            func.avg(RedditPost.score).label('avg_score'),
            func.max(RedditPost.score).label('max_score'),
            func.avg(RedditPost.num_comments).label('avg_comments'),
            func.max(RedditPost.num_comments).label('max_comments'),
            func.avg(RedditPost.upvote_ratio).label('avg_upvote_ratio')
        ).filter(
            RedditPost.retrieved_at >= start_date
        ).first()

        # Sentiment distribution by subreddit
        sentiment_by_subreddit = db.query(
            RedditPost.subreddit,
            RedditPost.sentiment_label,
            func.count(RedditPost.id).label('count')
        ).filter(
            RedditPost.sentiment_label.isnot(None)
        ).group_by(
            RedditPost.subreddit,
            RedditPost.sentiment_label
        ).all()

        # Format post volume data
        post_volume_data = [
            {
                "date": str(row.date),
                "count": row.count
            }
            for row in posts_over_time
        ]

        # Format sentiment trends data
        # Group by date first, then include all sentiments
        sentiment_by_date = {}
        for row in sentiment_trends:
            date_str = str(row.date)
            if date_str not in sentiment_by_date:
                sentiment_by_date[date_str] = {
                    "date": date_str,
                    "positive": 0,
                    "negative": 0,
                    "neutral": 0
                }
            if row.sentiment_label:
                sentiment_by_date[date_str][row.sentiment_label] = row.count

        sentiment_trends_data = list(sentiment_by_date.values())
        sentiment_trends_data.sort(key=lambda x: x["date"])

        # Format top subreddits data
        top_subreddits_data = [
            {
                "subreddit": row.subreddit,
                "post_count": row.post_count,
                "avg_score": round(float(row.avg_score or 0), 2),
                "avg_comments": round(float(row.avg_comments or 0), 2)
            }
            for row in top_subreddits
        ]

        # Format sentiment by subreddit
        subreddit_sentiment_map = {}
        for row in sentiment_by_subreddit:
            if row.subreddit not in subreddit_sentiment_map:
                subreddit_sentiment_map[row.subreddit] = {
                    "subreddit": row.subreddit,
                    "positive": 0,
                    "negative": 0,
                    "neutral": 0
                }
            if row.sentiment_label:
                subreddit_sentiment_map[row.subreddit][row.sentiment_label] = row.count

        sentiment_by_subreddit_data = list(subreddit_sentiment_map.values())

        return {
            "post_volume": post_volume_data,
            "sentiment_trends": sentiment_trends_data,
            "top_subreddits": top_subreddits_data,
            "sentiment_by_subreddit": sentiment_by_subreddit_data,
            "engagement_metrics": {
                "avg_score": round(float(engagement_stats.avg_score or 0), 2),
                "max_score": engagement_stats.max_score or 0,
                "avg_comments": round(float(engagement_stats.avg_comments or 0), 2),
                "max_comments": engagement_stats.max_comments or 0,
                "avg_upvote_ratio": round(float(engagement_stats.avg_upvote_ratio or 0), 3)
            } if engagement_stats else None
        }

    except Exception as e:
        logger.error(f"Error fetching analytics overview: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
