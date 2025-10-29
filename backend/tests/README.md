# Testing Documentation

## Overview

This directory contains automated tests for the Portfolio Data Pipeline backend application.

## Test Structure

```
tests/
├── api/                        # API endpoint tests
│   └── test_simple_endpoints.py  # Health checks and API validation
├── models/                     # Database model tests
│   └── test_reddit_post.py       # RedditPost model tests
├── services/                   # Service layer tests (future)
└── conftest.py                 # Shared pytest fixtures
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
Current coverage achieved: 53%

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

**Working Tests:**
- ✅ Health check endpoints (4 tests)
- ✅ API structure validation (2 tests)
- ✅ RedditPost model tests (4 tests)

**Future Improvements:**
- [ ] Database integration tests (requires test database isolation)
- [ ] Reddit API endpoint tests with mocked database
- [ ] Analytics endpoint tests with mocked database
- [ ] Service layer unit tests
- [ ] Mock external API calls (Reddit API)
- [ ] Performance/load testing
- [ ] CI/CD integration

**Note:** Full API integration tests are planned for future implementation. Current tests focus on:
- Application structure and health
- Model behavior and validation
- API route existence and parameter validation
