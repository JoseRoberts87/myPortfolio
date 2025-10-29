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
    # Startup: Initialize database
    logger.info("Starting up - initializing database...")
    try:
        from app.db.database import Base, get_engine
        from app.models.reddit_post import RedditPost  # Import models to register them

        engine = get_engine()
        Base.metadata.create_all(bind=engine)

        # Verify tables were created
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        logger.info(f"✓ Database initialized successfully! Tables: {tables}")
    except Exception as e:
        logger.error(f"✗ Error initializing database: {str(e)}")
        # Don't raise - let the app start anyway, database endpoints will fail gracefully

    yield  # Application runs

    # Shutdown
    logger.info("Shutting down...")


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
