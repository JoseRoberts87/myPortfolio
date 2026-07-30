"""Tests for the analytics endpoints (`app/api/analytics.py`)."""


class TestAnalyticsOverview:
    def test_empty_database_returns_empty_series(self, client):
        response = client.get("/api/v1/analytics/overview")
        assert response.status_code == 200
        data = response.json()
        assert data["post_volume"] == []
        assert data["sentiment_trends"] == []
        assert data["top_subreddits"] == []

    # Note: the "with data" aggregation path can't be exercised against SQLite —
    # the endpoint uses `cast(col, Date)` for daily bucketing, which relies on
    # PostgreSQL semantics (on SQLite the cast yields a non-date value). The
    # empty-DB test above covers the endpoint wiring and response shape.

    def test_days_parameter_is_accepted(self, client):
        response = client.get("/api/v1/analytics/overview?days=7")
        assert response.status_code == 200
