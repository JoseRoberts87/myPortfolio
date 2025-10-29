"""API routes"""
from fastapi import APIRouter
from app.api import reddit, pipeline, stats, analytics

api_router = APIRouter()

# Include sub-routers
api_router.include_router(reddit.router, prefix="/reddit", tags=["reddit"])
api_router.include_router(pipeline.router, prefix="/pipeline", tags=["pipeline"])
api_router.include_router(stats.router, prefix="/stats", tags=["stats"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
