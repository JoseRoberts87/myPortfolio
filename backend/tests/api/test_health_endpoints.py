"""
Tests for the health/monitoring endpoints (`app/api/health.py`).

In the test environment the DB is in-memory SQLite and Redis is unavailable,
so the detailed check reports "degraded" and readiness reports not-ready. The
assertions below are written to be robust to those states rather than assuming
a fully-healthy stack.
"""


class TestDetailedHealth:
    def test_detailed_health_shape(self, client):
        response = client.get("/api/v1/health/detailed")
        # healthy -> 200, degraded -> 207, unhealthy -> 503
        assert response.status_code in (200, 207, 503)
        data = response.json()
        assert "status" in data
        assert "components" in data
        assert "database" in data["components"]
        assert "cache" in data["components"]


class TestComponentHealth:
    def test_database_health(self, client):
        response = client.get("/api/v1/health/database")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] in ("healthy", "unhealthy")
        assert "connected" in data

    def test_cache_health(self, client):
        response = client.get("/api/v1/health/cache")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "connected" in data

    def test_system_metrics(self, client):
        response = client.get("/api/v1/health/metrics")
        assert response.status_code == 200
        data = response.json()
        # Either real metrics or an error key if psutil failed.
        assert "cpu" in data or "error" in data

    def test_uptime(self, client):
        response = client.get("/api/v1/health/uptime")
        assert response.status_code == 200
        assert "uptime_seconds" in response.json()


class TestProbes:
    def test_readiness_probe(self, client):
        response = client.get("/api/v1/health/readiness")
        assert response.status_code in (200, 503)
        assert "ready" in response.json()

    def test_liveness_probe(self, client):
        response = client.get("/api/v1/health/liveness")
        assert response.status_code == 200
        data = response.json()
        assert data["alive"] is True
        assert data["status"] == "healthy"
