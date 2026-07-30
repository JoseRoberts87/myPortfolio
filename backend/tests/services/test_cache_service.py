"""Tests for the Redis cache service (`app/services/cache_service.py`)."""
from unittest.mock import MagicMock

from app.services.cache_service import CacheService


class TestDisabledCache:
    """When Redis is unavailable the service must degrade gracefully."""

    def _disabled(self):
        cs = CacheService()
        cs._enabled = False
        return cs

    def test_get_returns_none(self):
        assert self._disabled().get("k") is None

    def test_set_returns_false(self):
        assert self._disabled().set("k", {"a": 1}) is False

    def test_delete_returns_false(self):
        assert self._disabled().delete("k") is False

    def test_stats_report_disabled(self):
        stats = self._disabled().get_stats()
        assert stats["enabled"] is False
        assert stats["connected"] is False


class TestEnabledCacheWithMockRedis:
    def _mocked(self):
        cs = CacheService()
        cs._enabled = True
        cs._redis_client = MagicMock()
        return cs

    def test_get_deserializes_json(self):
        cs = self._mocked()
        cs._redis_client.get.return_value = '{"value": 42}'
        assert cs.get("k") == {"value": 42}

    def test_get_miss_returns_none(self):
        cs = self._mocked()
        cs._redis_client.get.return_value = None
        assert cs.get("k") is None

    def test_set_serializes_and_returns_true(self):
        cs = self._mocked()
        assert cs.set("k", {"value": 42}, ttl=60) is True
        cs._redis_client.setex.assert_called_once()

    def test_delete_returns_true(self):
        cs = self._mocked()
        assert cs.delete("k") is True
        cs._redis_client.delete.assert_called_once_with("k")


class TestCacheKeyGeneration:
    def test_key_is_deterministic(self):
        cs = CacheService()
        k1 = cs._generate_cache_key("prefix", subreddit="python", page=1)
        k2 = cs._generate_cache_key("prefix", subreddit="python", page=1)
        assert k1 == k2
        assert k1.startswith("cache:prefix:")

    def test_db_argument_is_excluded(self):
        cs = CacheService()
        with_db = cs._generate_cache_key("p", page=1, db="a-session-object")
        without_db = cs._generate_cache_key("p", page=1)
        assert with_db == without_db
