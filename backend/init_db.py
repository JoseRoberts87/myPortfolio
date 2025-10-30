"""
Initialize database tables
Run this script to create all database tables
"""
import sys
import time
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent))

from app.db.database import Base, get_engine
from app.models.reddit_post import RedditPost  # Import all models
from app.models.contact_message import ContactMessage  # Import contact message model
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def wait_for_db(max_retries=5, delay=2):
    """Wait for database to be available"""
    for attempt in range(max_retries):
        try:
            logger.info(f"Attempting to connect to database (attempt {attempt + 1}/{max_retries})...")
            engine = get_engine()
            # Try to connect
            with engine.connect() as conn:
                logger.info("✓ Database connection successful!")
                return engine
        except Exception as e:
            logger.warning(f"Database not ready: {str(e)}")
            if attempt < max_retries - 1:
                logger.info(f"Waiting {delay} seconds before retry...")
                time.sleep(delay)
            else:
                logger.error("✗ Failed to connect to database after all retries")
                raise
    return None


def init_db():
    """Create all database tables"""
    logger.info("Starting database initialization...")

    try:
        # Wait for database to be ready
        engine = wait_for_db()

        # Create tables
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)

        # Verify tables were created
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        logger.info(f"✓ Database tables created successfully! Tables: {tables}")

    except Exception as e:
        logger.error(f"✗ Error during database initialization: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        sys.exit(1)  # Exit with error code


if __name__ == "__main__":
    init_db()
