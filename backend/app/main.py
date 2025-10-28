"""
FastAPI Application - Portfolio Data Pipeline
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api import api_router
import logging

logger = logging.getLogger(__name__)


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

# Include API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


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
