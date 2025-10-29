"""
Health Check API Endpoints
Provides health and monitoring endpoints for the application
"""
from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from typing import Dict, Any
from app.services.health_check import (
    get_comprehensive_health,
    check_database,
    check_cache,
    get_system_metrics,
    get_uptime,
)
from app.core.logging_config import get_logger

logger = get_logger(__name__)

router = APIRouter()


@router.get(
    "/health",
    summary="Basic health check",
    description="Simple health check endpoint that returns 200 OK if the service is running",
)
async def health_check() -> Dict[str, str]:
    """
    Basic health check endpoint

    Returns:
        Simple status message
    """
    return {
        "status": "healthy",
        "service": "portfolio-api"
    }


@router.get(
    "/health/detailed",
    summary="Detailed health check",
    description="Comprehensive health check including database, cache, and system metrics",
)
async def detailed_health_check() -> JSONResponse:
    """
    Detailed health check endpoint with component status

    Returns:
        Comprehensive health status including all components
    """
    health_data = get_comprehensive_health()

    # Return appropriate status code based on health
    if health_data["status"] == "healthy":
        status_code = status.HTTP_200_OK
    elif health_data["status"] == "degraded":
        status_code = status.HTTP_207_MULTI_STATUS
    else:
        status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return JSONResponse(
        status_code=status_code,
        content=health_data
    )


@router.get(
    "/health/database",
    summary="Database health check",
    description="Check database connectivity and performance",
)
async def database_health() -> Dict[str, Any]:
    """
    Database-specific health check

    Returns:
        Database health status
    """
    return check_database()


@router.get(
    "/health/cache",
    summary="Cache health check",
    description="Check Redis cache connectivity and performance",
)
async def cache_health() -> Dict[str, Any]:
    """
    Cache-specific health check

    Returns:
        Cache health status
    """
    return check_cache()


@router.get(
    "/health/metrics",
    summary="System metrics",
    description="Get system resource metrics (CPU, memory, disk)",
)
async def system_metrics() -> Dict[str, Any]:
    """
    System metrics endpoint

    Returns:
        System resource metrics
    """
    return get_system_metrics()


@router.get(
    "/health/uptime",
    summary="Application uptime",
    description="Get application uptime information",
)
async def uptime() -> Dict[str, Any]:
    """
    Application uptime endpoint

    Returns:
        Uptime information
    """
    return get_uptime()


@router.get(
    "/health/readiness",
    summary="Readiness probe",
    description="Kubernetes readiness probe - checks if app is ready to serve traffic",
)
async def readiness_probe() -> JSONResponse:
    """
    Readiness probe for Kubernetes

    Checks if the application is ready to serve traffic by verifying
    database and cache connectivity.

    Returns:
        200 if ready, 503 if not ready
    """
    db_health = check_database()
    cache_health = check_cache()

    # Application is ready if database is healthy
    # Cache is optional - degraded but not blocking
    if db_health["status"] == "healthy":
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "ready": True,
                "database": db_health["status"],
                "cache": cache_health["status"],
            }
        )
    else:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "ready": False,
                "database": db_health["status"],
                "cache": cache_health["status"],
            }
        )


@router.get(
    "/health/liveness",
    summary="Liveness probe",
    description="Kubernetes liveness probe - checks if app is alive",
)
async def liveness_probe() -> Dict[str, str]:
    """
    Liveness probe for Kubernetes

    Simple check to verify the application is running.
    Returns 200 OK if the application process is alive.

    Returns:
        Status message
    """
    return {
        "alive": True,
        "status": "healthy"
    }
