"""
Health Check Service
Monitors system health including database, cache, and system metrics
"""
import time
import psutil
from typing import Dict, Any
from datetime import datetime
from sqlalchemy import text
from app.db.database import get_db
from app.services.cache_service import CacheService
from app.core.logging_config import get_logger

logger = get_logger(__name__)

# Store application start time
APP_START_TIME = time.time()


def get_uptime() -> Dict[str, Any]:
    """
    Get application uptime

    Returns:
        Dictionary with uptime information
    """
    uptime_seconds = time.time() - APP_START_TIME
    uptime_minutes = uptime_seconds / 60
    uptime_hours = uptime_minutes / 60
    uptime_days = uptime_hours / 24

    return {
        "uptime_seconds": round(uptime_seconds, 2),
        "uptime_minutes": round(uptime_minutes, 2),
        "uptime_hours": round(uptime_hours, 2),
        "uptime_days": round(uptime_days, 2),
        "started_at": datetime.fromtimestamp(APP_START_TIME).isoformat(),
    }


def check_database() -> Dict[str, Any]:
    """
    Check database connectivity and health

    Returns:
        Dictionary with database health status
    """
    start_time = time.time()

    try:
        db = next(get_db())

        # Execute a simple query to test connectivity
        result = db.execute(text("SELECT 1"))
        result.fetchone()

        response_time = (time.time() - start_time) * 1000  # Convert to ms

        # Get table count
        tables_result = db.execute(
            text(
                "SELECT COUNT(*) FROM information_schema.tables "
                "WHERE table_schema = 'public'"
            )
        )
        table_count = tables_result.fetchone()[0]

        db.close()

        return {
            "status": "healthy",
            "connected": True,
            "response_time_ms": round(response_time, 2),
            "tables": table_count,
        }
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        response_time = (time.time() - start_time) * 1000
        return {
            "status": "unhealthy",
            "connected": False,
            "response_time_ms": round(response_time, 2),
            "error": str(e),
        }


def check_cache() -> Dict[str, Any]:
    """
    Check Redis cache connectivity and health

    Returns:
        Dictionary with cache health status
    """
    start_time = time.time()

    try:
        cache_service = CacheService()
        cache = cache_service.redis_client

        if cache is None:
            response_time = (time.time() - start_time) * 1000
            return {
                "status": "disabled",
                "connected": False,
                "response_time_ms": round(response_time, 2),
                "message": "Cache is disabled"
            }

        # Test cache with ping
        if cache.ping():
            response_time = (time.time() - start_time) * 1000

            # Get cache info
            info = cache.info()

            return {
                "status": "healthy",
                "connected": True,
                "response_time_ms": round(response_time, 2),
                "used_memory_mb": round(info.get("used_memory", 0) / (1024 * 1024), 2),
                "connected_clients": info.get("connected_clients", 0),
                "total_keys": cache.dbsize(),
            }
        else:
            response_time = (time.time() - start_time) * 1000
            return {
                "status": "unhealthy",
                "connected": False,
                "response_time_ms": round(response_time, 2),
                "error": "Ping failed",
            }
    except Exception as e:
        logger.error(f"Cache health check failed: {str(e)}")
        response_time = (time.time() - start_time) * 1000
        return {
            "status": "unhealthy",
            "connected": False,
            "response_time_ms": round(response_time, 2),
            "error": str(e),
        }


def get_system_metrics() -> Dict[str, Any]:
    """
    Get system resource metrics (CPU, memory, disk)

    Returns:
        Dictionary with system metrics
    """
    try:
        # CPU metrics
        cpu_percent = psutil.cpu_percent(interval=0.1)
        cpu_count = psutil.cpu_count()

        # Memory metrics
        memory = psutil.virtual_memory()
        memory_total_gb = memory.total / (1024 ** 3)
        memory_available_gb = memory.available / (1024 ** 3)
        memory_used_gb = memory.used / (1024 ** 3)
        memory_percent = memory.percent

        # Disk metrics
        disk = psutil.disk_usage('/')
        disk_total_gb = disk.total / (1024 ** 3)
        disk_used_gb = disk.used / (1024 ** 3)
        disk_free_gb = disk.free / (1024 ** 3)
        disk_percent = disk.percent

        return {
            "cpu": {
                "usage_percent": cpu_percent,
                "count": cpu_count,
            },
            "memory": {
                "total_gb": round(memory_total_gb, 2),
                "used_gb": round(memory_used_gb, 2),
                "available_gb": round(memory_available_gb, 2),
                "usage_percent": memory_percent,
            },
            "disk": {
                "total_gb": round(disk_total_gb, 2),
                "used_gb": round(disk_used_gb, 2),
                "free_gb": round(disk_free_gb, 2),
                "usage_percent": disk_percent,
            }
        }
    except Exception as e:
        logger.error(f"System metrics check failed: {str(e)}")
        return {
            "error": str(e)
        }


def get_comprehensive_health() -> Dict[str, Any]:
    """
    Get comprehensive health check including all components

    Returns:
        Dictionary with complete health status
    """
    # Check individual components
    database_health = check_database()
    cache_health = check_cache()
    system_metrics = get_system_metrics()
    uptime_info = get_uptime()

    # Determine overall status
    overall_status = "healthy"
    if database_health["status"] == "unhealthy" or cache_health["status"] == "unhealthy":
        overall_status = "degraded"

    if database_health["status"] == "unhealthy" and cache_health["status"] == "unhealthy":
        overall_status = "unhealthy"

    return {
        "status": overall_status,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "uptime": uptime_info,
        "components": {
            "database": database_health,
            "cache": cache_health,
        },
        "system": system_metrics,
    }
