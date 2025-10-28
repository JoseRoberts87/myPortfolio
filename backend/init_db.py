"""
Initialize database tables
Run this script to create all database tables
"""
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent))

from app.db.database import Base, engine
from app.models.reddit_post import RedditPost  # Import all models
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_db():
    """Create all database tables"""
    logger.info("Creating database tables...")

    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✓ Database tables created successfully!")
    except Exception as e:
        logger.error(f"✗ Error creating tables: {str(e)}")
        raise


if __name__ == "__main__":
    init_db()
