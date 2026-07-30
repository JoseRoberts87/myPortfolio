"""
Tests for the cache management endpoints (`app/api/cache.py`).

Redis is unavailable in the test environment, so the cache reports as
disabled — the endpoints should degrade gracefully rather than error.
"""


class TestCacheStats:
    def test_stats_returns_ok(self, client):
        response = client.get("/api/v1/cache/stats")
        assert response.status_code == 200
        data = response.json()
        assert "enabled" in data
        assert "connected" in data


class TestClearCache:
    def test_clear_when_disabled(self, client):
        response = client.post("/api/v1/cache/clear")
        assert response.status_code == 200
        assert response.json()["status"] in ("success", "disabled")


class TestDeletePattern:
    def test_delete_pattern_returns_count(self, client):
        response = client.delete("/api/v1/cache/pattern/reddit")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["keys_deleted"] == 0
