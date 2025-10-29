"""
Cache Management API Endpoints
"""
from fastapi import APIRouter, HTTPException
from app.services.cache_service import cache_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/stats")
async def get_cache_stats():
    """
    Get cache statistics and performance metrics

    Returns:
        Cache statistics including hit rate, memory usage, and key count
    """
    try:
        stats = cache_service.get_stats()
        return stats
    except Exception as e:
        logger.error(f"Error fetching cache stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/clear")
async def clear_cache():
    """
    Clear all cache entries (admin endpoint)

    Returns:
        Success status
    """
    try:
        success = cache_service.clear_all()
        if success:
            return {
                "status": "success",
                "message": "Cache cleared successfully"
            }
        else:
            return {
                "status": "disabled",
                "message": "Cache is not enabled"
            }
    except Exception as e:
        logger.error(f"Error clearing cache: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/pattern/{pattern}")
async def delete_cache_pattern(pattern: str):
    """
    Delete cache entries matching a pattern

    Args:
        pattern: Pattern to match (e.g., "reddit", "stats", "analytics")

    Returns:
        Number of keys deleted
    """
    try:
        # Convert simple pattern to Redis pattern
        redis_pattern = f"cache:{pattern}_*"
        deleted = cache_service.delete_pattern(redis_pattern)

        return {
            "status": "success",
            "pattern": pattern,
            "keys_deleted": deleted
        }
    except Exception as e:
        logger.error(f"Error deleting cache pattern: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
