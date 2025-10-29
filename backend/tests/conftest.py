"""
Test Configuration and Fixtures
Provides shared fixtures for all tests
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from datetime import datetime, timedelta

from app.main import app
from app.db.database import Base, get_db
from app.models.reddit_post import RedditPost


# Use in-memory SQLite database for testing
TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture(scope="function")
def test_engine():
    """Create a fresh test database engine for each test"""
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture(scope="function")
def test_db(test_engine):
    """Create a test database session"""
    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=test_engine
    )
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def client(test_engine):
    """Create a test client with database dependency override"""
    # Create a new session for each request during testing
    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=test_engine
    )

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    # Disable lifespan to prevent production DB initialization
    with TestClient(app, raise_server_exceptions=False) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def sample_reddit_post():
    """Sample Reddit post data for testing"""
    return RedditPost(
        id="test_post_123",
        title="Test Post Title",
        author="test_author",
        subreddit="Python",
        content="This is a test post content for testing purposes.",
        url="https://reddit.com/r/Python/test",
        score=100,
        num_comments=25,
        upvote_ratio=0.95,
        created_utc=datetime.utcnow() - timedelta(days=1),
        is_self=True,
        is_video=False,
        over_18=False,
        sentiment_score=0.75,
        sentiment_label="positive"
    )


@pytest.fixture
def sample_reddit_posts(test_db):
    """Create multiple sample Reddit posts in the database"""
    posts = [
        RedditPost(
            id=f"test_post_{i}",
            title=f"Test Post {i}",
            author=f"test_author_{i % 3}",
            subreddit=["Python", "javascript", "MachineLearning"][i % 3],
            content=f"Test content for post {i}",
            url=f"https://reddit.com/test/{i}",
            score=100 + i * 10,
            num_comments=10 + i * 2,
            upvote_ratio=0.85 + (i % 10) / 100,
            created_utc=datetime.utcnow() - timedelta(days=i),
            is_self=i % 2 == 0,
            is_video=i % 5 == 0,
            over_18=False,
            sentiment_score=0.5 + (i % 5) / 10,
            sentiment_label=["positive", "neutral", "negative"][i % 3]
        )
        for i in range(15)
    ]

    for post in posts:
        test_db.add(post)
    test_db.commit()

    return posts


@pytest.fixture
def sample_posts_different_dates(test_db):
    """Create posts with different dates for time-series testing"""
    today = datetime.utcnow()
    posts = []

    # Create posts for the last 30 days
    for day in range(30):
        for i in range(3):  # 3 posts per day
            post = RedditPost(
                id=f"dated_post_{day}_{i}",
                title=f"Post from day {day}",
                author="test_author",
                subreddit="Python",
                content="Test content",
                url=f"https://reddit.com/test/dated_{day}_{i}",
                score=50 + i * 10,
                num_comments=5 + i,
                upvote_ratio=0.90,
                created_utc=today - timedelta(days=day),
                retrieved_at=today - timedelta(days=day),
                is_self=True,
                is_video=False,
                over_18=False,
                sentiment_score=0.6,
                sentiment_label="positive"
            )
            posts.append(post)
            test_db.add(post)

    test_db.commit()
    return posts
