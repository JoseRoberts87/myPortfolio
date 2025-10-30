"""API routes"""
from fastapi import APIRouter
from app.api import reddit, pipeline, stats, analytics, cache, health, contact

api_router = APIRouter()

# Include sub-routers
api_router.include_router(health.router, tags=["health"])
api_router.include_router(contact.router, tags=["contact"])
api_router.include_router(reddit.router, prefix="/reddit", tags=["reddit"])
api_router.include_router(pipeline.router, prefix="/pipeline", tags=["pipeline"])
api_router.include_router(stats.router, prefix="/stats", tags=["stats"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(cache.router, prefix="/cache", tags=["cache"])
