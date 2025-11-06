"""
FastAPI Application - Portfolio Data Pipeline
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import SQLAlchemyError
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.logging_config import setup_logging, get_logger
from app.core.exceptions import BaseAPIException
from app.middleware.error_handlers import (
    custom_exception_handler,
    validation_exception_handler,
    http_exception_handler,
    database_exception_handler,
    general_exception_handler,
)
from app.middleware.logging_middleware import RequestLoggingMiddleware
from app.api import api_router

# Initialize logging
setup_logging(
    log_level=settings.LOG_LEVEL,
    log_format=settings.LOG_FORMAT,
    log_file=settings.LOG_FILE if settings.LOG_TO_FILE else None,
)

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - runs on startup and shutdown"""
    # Startup: Verify database connection
    logger.info("Starting up - verifying database connection...")
    try:
        from app.db.database import get_engine
        from sqlalchemy import inspect

        engine = get_engine()

        # Test database connection and list tables
        with engine.connect() as conn:
            inspector = inspect(engine)
            tables = inspector.get_table_names()
            logger.info(f"✓ Database connection successful! Tables: {tables}")
            logger.info("Note: Database schema is managed by Alembic migrations")
    except Exception as e:
        logger.error(f"✗ Error connecting to database: {str(e)}")
        logger.warning("Application will start but database operations may fail")
        # Don't raise - let the app start anyway, database endpoints will fail gracefully

    # Startup: Initialize scheduler
    logger.info("Starting scheduler...")
    try:
        from app.services.scheduler_service import scheduler_service
        from app.api.pipeline import _execute_pipeline
        from app.api.articles import _sync_news_articles

        # Start the scheduler
        scheduler_service.start()
        logger.info("✓ Scheduler started successfully")

        # Schedule default Reddit pipeline job (every 6 hours)
        scheduler_service.add_job(
            func=_execute_pipeline,
            job_id="reddit_pipeline_scheduled",
            trigger_type="interval",
            hours=6
        )
        logger.info("✓ Reddit pipeline job scheduled (every 6 hours)")

        # Schedule News API pipeline job (every 12 hours)
        # Only schedule if NEWS_API_KEY is configured
        if settings.NEWS_API_KEY:
            scheduler_service.add_job(
                func=_sync_news_articles,
                job_id="news_pipeline_scheduled",
                trigger_type="interval",
                kwargs={
                    "category": "technology",  # Default to technology news
                    "page_size": 50
                },
                hours=12
            )
            logger.info("✓ News pipeline job scheduled (every 12 hours - technology)")
        else:
            logger.warning("⚠ NEWS_API_KEY not configured, skipping news pipeline scheduling")

    except Exception as e:
        logger.error(f"✗ Error starting scheduler: {str(e)}")
        logger.warning("Scheduler will not run but API endpoints will still work")

    yield  # Application runs

    # Shutdown: Stop scheduler
    logger.info("Shutting down...")
    try:
        from app.services.scheduler_service import scheduler_service
        if scheduler_service.is_running():
            scheduler_service.shutdown(wait=True)
            logger.info("✓ Scheduler shut down successfully")
    except Exception as e:
        logger.error(f"Error shutting down scheduler: {str(e)}")


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    debug=settings.DEBUG,
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add request logging middleware
app.add_middleware(RequestLoggingMiddleware)

# Register exception handlers
app.add_exception_handler(BaseAPIException, custom_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(SQLAlchemyError, database_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

logger.info(f"Application initialized: {settings.PROJECT_NAME}")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Portfolio Data Pipeline API",
        "status": "online",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring
    Returns 200 OK to indicate the service is running
    """
    return {"status": "healthy", "service": "portfolio-api"}
