"""Tests for the health-check service (`app/services/health_check.py`)."""
from app.services.health_check import (
    get_uptime,
    get_system_metrics,
    check_cache,
    check_database,
    get_comprehensive_health,
)


class TestUptime:
    def test_uptime_fields(self):
        data = get_uptime()
        assert data["uptime_seconds"] >= 0
        assert "started_at" in data


class TestSystemMetrics:
    def test_metrics_fields(self):
        data = get_system_metrics()
        # psutil should populate these; tolerate an error dict just in case.
        assert "error" in data or {"cpu", "memory", "disk"} <= set(data)


class TestCacheCheck:
    def test_cache_unavailable_reports_not_connected(self):
        data = check_cache()
        # Redis is not available in tests -> disabled or unhealthy, never connected.
        assert data["connected"] is False
        assert data["status"] in ("disabled", "unhealthy")


class TestDatabaseCheck:
    def test_database_check_shape(self):
        data = check_database()
        assert "status" in data
        assert "connected" in data
        assert data["status"] in ("healthy", "unhealthy")


class TestComprehensiveHealth:
    def test_structure(self):
        data = get_comprehensive_health()
        assert data["status"] in ("healthy", "degraded", "unhealthy")
        assert "database" in data["components"]
        assert "cache" in data["components"]
        assert "system" in data
        assert "uptime" in data
