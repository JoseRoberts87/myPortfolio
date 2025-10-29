"""
Reddit API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db import get_db
from app.models.reddit_post import RedditPost
from app.schemas.reddit import RedditPostResponse, RedditPostList
from app.services.reddit_service import RedditService
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/posts", response_model=RedditPostList)
async def get_reddit_posts(
    subreddit: Optional[str] = None,
    sentiment: Optional[str] = Query(None, regex="^(positive|negative|neutral)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get Reddit posts from database with pagination

    Args:
        subreddit: Filter by subreddit (optional)
        sentiment: Filter by sentiment (positive, negative, neutral) (optional)
        page: Page number (default: 1)
        page_size: Number of posts per page (default: 50, max: 100)
        db: Database session

    Returns:
        List of Reddit posts with pagination info
    """
    try:
        # Build query
        query = db.query(RedditPost)

        if subreddit:
            query = query.filter(RedditPost.subreddit == subreddit)

        if sentiment:
            query = query.filter(RedditPost.sentiment_label == sentiment)

        # Get total count
        total = query.count()

        # Apply pagination
        offset = (page - 1) * page_size
        posts = query.order_by(RedditPost.created_utc.desc()).offset(offset).limit(page_size).all()

        return RedditPostList(
            posts=posts,
            total=total,
            page=page,
            page_size=page_size
        )
    except Exception as e:
        logger.error(f"Error fetching posts: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/posts/{post_id}", response_model=RedditPostResponse)
async def get_reddit_post(post_id: str, db: Session = Depends(get_db)):
    """
    Get a specific Reddit post by ID

    Args:
        post_id: Reddit post ID
        db: Database session

    Returns:
        Reddit post details
    """
    post = db.query(RedditPost).filter(RedditPost.id == post_id).first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    return post


@router.get("/subreddits")
async def get_subreddits(db: Session = Depends(get_db)):
    """
    Get list of all subreddits in database

    Args:
        db: Database session

    Returns:
        List of subreddits with post counts
    """
    try:
        result = db.query(
            RedditPost.subreddit,
            db.func.count(RedditPost.id).label('post_count')
        ).group_by(RedditPost.subreddit).all()

        return [
            {"subreddit": r.subreddit, "post_count": r.post_count}
            for r in result
        ]
    except Exception as e:
        logger.error(f"Error fetching subreddits: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/test-connection")
async def test_reddit_connection():
    """
    Test Reddit API connection

    Returns:
        Connection status
    """
    try:
        reddit_service = RedditService()
        is_connected = reddit_service.test_connection()

        if is_connected:
            return {"status": "success", "message": "Reddit API connection successful"}
        else:
            raise HTTPException(status_code=500, detail="Reddit API connection failed")
    except Exception as e:
        logger.error(f"Connection test failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
