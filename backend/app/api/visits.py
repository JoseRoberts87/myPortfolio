"""
Visit Tracking API Endpoints
Provides endpoints for logging and retrieving visit statistics
"""
from fastapi import APIRouter, status, Request, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import Dict, Any
import uuid

from app.db.database import get_db
from app.models.visit import Visit
from app.schemas.visit import VisitCreate, VisitResponse, VisitStats
from app.core.logging_config import get_logger

logger = get_logger(__name__)

router = APIRouter()


@router.post(
    "/track",
    response_model=VisitResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Track page visit",
    description="Log a page visit with referrer information",
)
async def track_visit(
    visit_data: VisitCreate,
    request: Request,
    db: Session = Depends(get_db)
) -> VisitResponse:
    """
    Track a page visit

    Args:
        visit_data: Visit information (page_url, referrer)
        request: FastAPI request object for extracting metadata
        db: Database session

    Returns:
        Visit response with success status and visit_id
    """
    try:
        # Generate unique visit ID
        visit_id = str(uuid.uuid4())

        # Extract client information
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")

        # Create visit record
        visit = Visit(
            visit_id=visit_id,
            page_url=visit_data.page_url,
            referrer=visit_data.referrer,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        db.add(visit)
        db.commit()
        db.refresh(visit)

        logger.info(f"Visit tracked: {visit_id} - {visit_data.page_url}")

        return VisitResponse(
            success=True,
            message="Visit tracked successfully",
            visit_id=visit_id,
            timestamp=datetime.utcnow()
        )

    except Exception as e:
        logger.error(f"Error tracking visit: {str(e)}")
        db.rollback()
        return VisitResponse(
            success=False,
            message=f"Failed to track visit: {str(e)}",
            timestamp=datetime.utcnow()
        )


@router.get(
    "/stats",
    response_model=VisitStats,
    summary="Get visit statistics",
    description="Retrieve aggregated visit statistics including total visits, unique visitors, and top referrers",
)
async def get_visit_stats(db: Session = Depends(get_db)) -> VisitStats:
    """
    Get visit statistics

    Args:
        db: Database session

    Returns:
        Aggregated visit statistics
    """
    try:
        # Total visits
        total_visits = db.query(Visit).count()

        # Unique visitors (by IP address)
        unique_visitors = db.query(func.count(func.distinct(Visit.ip_address))).scalar() or 0

        # Recent visits (last 24 hours)
        twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
        recent_visits = db.query(Visit).filter(Visit.visited_at >= twenty_four_hours_ago).count()

        # Top referrers (excluding None/null and direct visits)
        top_referrers_query = (
            db.query(
                Visit.referrer,
                func.count(Visit.id).label('count')
            )
            .filter(Visit.referrer.isnot(None))
            .filter(Visit.referrer != '')
            .group_by(Visit.referrer)
            .order_by(desc('count'))
            .limit(5)
            .all()
        )

        from app.schemas.visit import ReferrerStat, PageStat

        top_referrers = [
            ReferrerStat(referrer=ref, count=count)
            for ref, count in top_referrers_query
        ]

        # Visits by page
        visits_by_page_query = (
            db.query(
                Visit.page_url,
                func.count(Visit.id).label('count')
            )
            .group_by(Visit.page_url)
            .order_by(desc('count'))
            .limit(10)
            .all()
        )

        visits_by_page = [
            PageStat(page=page, count=count)
            for page, count in visits_by_page_query
        ]

        return VisitStats(
            total_visits=total_visits,
            unique_visitors=unique_visitors,
            top_referrers=top_referrers,
            visits_by_page=visits_by_page,
            recent_visits=recent_visits
        )

    except Exception as e:
        logger.error(f"Error fetching visit stats: {str(e)}")
        # Return empty stats on error
        return VisitStats(
            total_visits=0,
            unique_visitors=0,
            top_referrers=[],
            visits_by_page=[],
            recent_visits=0
        )
