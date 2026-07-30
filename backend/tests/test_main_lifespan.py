"""
Tests for the FastAPI app bootstrap / lifespan (`app/main.py`).

Entering the TestClient context manager runs the lifespan startup (DB
connectivity check + scheduler startup and job scheduling) and shutdown. We
set NEWS_API_KEY so the news-scheduling branch is exercised too.
"""
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app


def test_lifespan_runs_startup_and_shutdown(monkeypatch):
    # Exercise the news-pipeline scheduling branch (else-branch is the default
    # elsewhere). Uses the real in-memory scheduler; shutdown runs on exit.
    monkeypatch.setattr(settings, "NEWS_API_KEY", "test-news-key")
    monkeypatch.setattr(settings, "NEWS_SEARCH_QUERIES", "hasbro")

    with TestClient(app) as client:
        root = client.get("/")
        assert root.status_code == 200
        assert root.json()["status"] == "online"

        health = client.get("/health")
        assert health.status_code == 200
        assert health.json()["status"] == "healthy"


def test_root_and_health_endpoints():
    # Without entering the lifespan context (no startup side effects).
    client = TestClient(app)
    assert client.get("/").json()["message"] == "Portfolio Data Pipeline API"
    assert client.get("/health").json()["service"] == "portfolio-api"
