# Testing Documentation

## Overview

This directory contains automated tests for the Portfolio Data Pipeline backend application.

## Test Structure

```
tests/
├── api/                           # API endpoint tests
│   └── test_simple_endpoints.py     # Health checks and API validation
├── core/                          # Configuration tests
│   └── test_config.py               # Application settings tests
├── db/                            # Database tests
│   └── test_database.py             # Database configuration tests
├── models/                        # Database model tests
│   └── test_reddit_post.py          # RedditPost model tests
├── schemas/                       # Pydantic schema tests
│   └── test_reddit_schemas.py       # Reddit schema validation tests
├── services/                      # Service layer tests
│   └── test_sentiment_service.py    # Sentiment analysis tests
└── conftest.py                    # Shared pytest fixtures
```

## Running Tests

### Run all tests
```bash
pytest
```

### Run specific test file
```bash
pytest tests/api/test_health.py
```

### Run with verbose output
```bash
pytest -v
```

### Run without coverage report
```bash
pytest --no-cov
```

### Run specific test class or method
```bash
pytest tests/api/test_health.py::test_root_endpoint
```

## Test Fixtures

The `conftest.py` provides shared fixtures:

- `test_engine`: SQLite in-memory database engine for testing
- `test_db`: Database session for tests
- `client`: FastAPI test client with overridden dependencies
- `sample_reddit_post`: Single sample RedditPost instance
- `sample_reddit_posts`: Multiple sample posts for testing
- `sample_posts_different_dates`: Posts with varied dates for time-series testing

## Writing Tests

### Model Tests
Model tests verify database model behavior without requiring database connections:

```python
def test_create_reddit_post():
    post = RedditPost(id="test", title="Test", subreddit="Python")
    assert post.id == "test"
```

### API Tests
API tests use the TestClient fixture:

```python
def test_endpoint(client):
    response = client.get("/api/v1/endpoint")
    assert response.status_code == 200
```

## Coverage

Current coverage target: 40%
Current coverage achieved: 65% (65.00%)

View HTML coverage report:
```bash
pytest
open htmlcov/index.html
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Descriptive Names**: Use clear, descriptive test names
3. **Arrange-Act-Assert**: Structure tests with setup, execution, and assertion
4. **Fixtures**: Use fixtures for common setup code
5. **Edge Cases**: Test both happy paths and error conditions

## Test Coverage Status

**Working Tests (62 total):**
- ✅ Health check endpoints (4 tests)
- ✅ Configuration/Settings (13 tests)
- ✅ Database configuration (8 tests)
- ✅ RedditPost model (4 tests)
- ✅ Pydantic schemas (11 tests)
- ✅ Sentiment analysis service (12 tests)
- ✅ Reddit service with mocked API (10 tests)

**Module Coverage:**
- ✅ app/services/reddit_service.py: **100%**
- ✅ app/schemas/reddit.py: **100%**
- ✅ app/models/reddit_post.py: **100%**
- ✅ app/core/config.py: **100%**
- ✅ app/main.py: 94%
- ✅ app/services/sentiment_service.py: 89%
- ✅ app/db/database.py: 78%

**Areas with Lower Coverage:**
- app/api/analytics.py: 27%
- app/api/pipeline.py: 23%
- app/api/stats.py: 31%
- app/api/reddit.py: 53%

**Future Improvements:**
- [ ] Full API endpoint integration tests (requires complex database mocking)
- [ ] Performance/load testing
- [ ] CI/CD integration

**Note:** Current tests provide comprehensive coverage of core business logic (services, models, schemas) and application configuration. API endpoints have lower coverage due to database integration complexity.
