"""
Test Database Configuration and Session Management
"""
import pytest
from sqlalchemy import inspect
from app.db.database import Base, get_engine, get_session_local, get_db


class TestDatabaseConfiguration:
    """Tests for database configuration"""

    def test_get_engine(self):
        """Test that get_engine returns a valid engine"""
        engine = get_engine()

        assert engine is not None
        assert hasattr(engine, 'url')
        assert hasattr(engine, 'dialect')

    def test_get_engine_singleton(self):
        """Test that get_engine returns the same instance"""
        engine1 = get_engine()
        engine2 = get_engine()

        assert engine1 is engine2

    def test_get_session_local(self):
        """Test that get_session_local returns a session factory"""
        SessionLocal = get_session_local()

        assert SessionLocal is not None
        assert callable(SessionLocal)

    def test_get_session_local_singleton(self):
        """Test that get_session_local returns the same factory"""
        SessionLocal1 = get_session_local()
        SessionLocal2 = get_session_local()

        assert SessionLocal1 is SessionLocal2

    def test_base_declarative(self):
        """Test that Base is a valid declarative base"""
        assert hasattr(Base, 'metadata')
        assert hasattr(Base, 'registry')

    def test_get_db_generator(self):
        """Test that get_db is a generator function"""
        import inspect as py_inspect

        assert py_inspect.isgeneratorfunction(get_db)

    def test_database_session_creation(self):
        """Test creating a database session"""
        SessionLocal = get_session_local()
        session = SessionLocal()

        try:
            assert session is not None
            assert hasattr(session, 'query')
            assert hasattr(session, 'add')
            assert hasattr(session, 'commit')
        finally:
            session.close()

    def test_base_metadata_has_tables(self):
        """Test that Base metadata can track tables"""
        # After importing models, metadata should have table info
        from app.models.reddit_post import RedditPost

        tables = Base.metadata.tables
        assert 'reddit_posts' in tables

        # Verify table has expected columns
        reddit_posts_table = tables['reddit_posts']
        column_names = [col.name for col in reddit_posts_table.columns]

        assert 'id' in column_names
        assert 'subreddit' in column_names
        assert 'title' in column_names
        assert 'sentiment_score' in column_names
        assert 'sentiment_label' in column_names
