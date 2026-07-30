"""
Tests for the health-check service (`app/services/health_check.py`).

These mock the database session and cache client so the checks are
DETERMINISTIC and never touch a real Postgres/Redis — previously they merely
tolerated either outcome, which made them depend on whatever the local
environment happened to provide (issue #137).
"""
from unittest.mock import MagicMock

import app.services.health_check as hc


class TestUptime:
    def test_uptime_fields(self):
        data = hc.get_uptime()
        assert data["uptime_seconds"] >= 0
        assert "started_at" in data


class TestSystemMetrics:
    def test_metrics_fields(self):
        data = hc.get_system_metrics()
        assert "error" in data or {"cpu", "memory", "disk"} <= set(data)


class TestDatabaseCheck:
    def test_healthy_when_queries_succeed(self, monkeypatch):
        mock_db = MagicMock()
        mock_db.execute.return_value.fetchone.return_value = [7]  # table count
        monkeypatch.setattr(hc, "get_db", lambda: iter([mock_db]))

        data = hc.check_database()
        assert data["status"] == "healthy"
        assert data["connected"] is True
        assert data["tables"] == 7
        mock_db.close.assert_called_once()

    def test_unhealthy_when_query_raises(self, monkeypatch):
        mock_db = MagicMock()
        mock_db.execute.side_effect = Exception("password authentication failed")
        monkeypatch.setattr(hc, "get_db", lambda: iter([mock_db]))

        data = hc.check_database()
        assert data["status"] == "unhealthy"
        assert data["connected"] is False
        assert "error" in data


class TestCacheCheck:
    def test_disabled_when_no_redis_client(self, monkeypatch):
        fake = MagicMock()
        fake.redis_client = None
        monkeypatch.setattr(hc, "CacheService", lambda: fake)

        data = hc.check_cache()
        assert data["status"] == "disabled"
        assert data["connected"] is False

    def test_healthy_when_ping_succeeds(self, monkeypatch):
        redis = MagicMock()
        redis.ping.return_value = True
        redis.info.return_value = {"used_memory": 1024 * 1024, "connected_clients": 2}
        redis.dbsize.return_value = 5
        fake = MagicMock()
        fake.redis_client = redis
        monkeypatch.setattr(hc, "CacheService", lambda: fake)

        data = hc.check_cache()
        assert data["status"] == "healthy"
        assert data["connected"] is True
        assert data["total_keys"] == 5


class TestComprehensiveHealth:
    def test_healthy_when_all_components_healthy(self, monkeypatch):
        monkeypatch.setattr(hc, "check_database", lambda: {"status": "healthy"})
        monkeypatch.setattr(hc, "check_cache", lambda: {"status": "healthy"})
        data = hc.get_comprehensive_health()
        assert data["status"] == "healthy"
        assert "database" in data["components"]
        assert "cache" in data["components"]

    def test_degraded_when_one_component_unhealthy(self, monkeypatch):
        monkeypatch.setattr(hc, "check_database", lambda: {"status": "unhealthy"})
        monkeypatch.setattr(hc, "check_cache", lambda: {"status": "healthy"})
        assert hc.get_comprehensive_health()["status"] == "degraded"

    def test_unhealthy_when_both_components_unhealthy(self, monkeypatch):
        monkeypatch.setattr(hc, "check_database", lambda: {"status": "unhealthy"})
        monkeypatch.setattr(hc, "check_cache", lambda: {"status": "unhealthy"})
        assert hc.get_comprehensive_health()["status"] == "unhealthy"
