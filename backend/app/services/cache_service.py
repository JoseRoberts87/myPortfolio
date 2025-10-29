"""
Redis Cache Service
Provides caching functionality for API endpoints
"""
import json
import hashlib
import logging
from typing import Any, Optional, Callable
from functools import wraps
import redis
from app.core.config import settings

logger = logging.getLogger(__name__)


class CacheService:
    """Redis cache service for API responses"""

    def __init__(self):
        """Initialize Redis connection"""
        self._redis_client: Optional[redis.Redis] = None
        self._enabled = settings.CACHE_ENABLED

    @property
    def redis_client(self) -> Optional[redis.Redis]:
        """Get or create Redis client"""
        if not self._enabled:
            return None

        if self._redis_client is None:
            try:
                self._redis_client = redis.Redis(
                    host=settings.REDIS_HOST,
                    port=settings.REDIS_PORT,
                    db=settings.REDIS_DB,
                    password=settings.REDIS_PASSWORD if settings.REDIS_PASSWORD else None,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                )
                # Test connection
                self._redis_client.ping()
                logger.info("Redis connection established successfully")
            except (redis.ConnectionError, redis.TimeoutError) as e:
                logger.warning(f"Redis connection failed: {e}. Caching disabled.")
                self._redis_client = None
                self._enabled = False

        return self._redis_client

    def _generate_cache_key(self, prefix: str, *args, **kwargs) -> str:
        """
        Generate a unique cache key based on function arguments

        Args:
            prefix: Cache key prefix (e.g., endpoint name)
            *args: Positional arguments
            **kwargs: Keyword arguments

        Returns:
            Unique cache key
        """
        # Create a string representation of arguments
        key_parts = [prefix]

        # Add positional arguments
        for arg in args:
            if arg is not None:
                key_parts.append(str(arg))

        # Add keyword arguments (sorted for consistency)
        for k, v in sorted(kwargs.items()):
            if v is not None and k != 'db':  # Exclude database session
                key_parts.append(f"{k}:{v}")

        # Join and hash for consistent length
        key_string = "|".join(key_parts)
        key_hash = hashlib.md5(key_string.encode()).hexdigest()

        return f"cache:{prefix}:{key_hash}"

    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache

        Args:
            key: Cache key

        Returns:
            Cached value or None if not found
        """
        if not self._enabled or not self.redis_client:
            return None

        try:
            value = self.redis_client.get(key)
            if value:
                logger.debug(f"Cache HIT: {key}")
                return json.loads(value)
            logger.debug(f"Cache MISS: {key}")
            return None
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return None

    def set(self, key: str, value: Any, ttl: int = None) -> bool:
        """
        Set value in cache

        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds (default: from settings)

        Returns:
            True if successful, False otherwise
        """
        if not self._enabled or not self.redis_client:
            return False

        try:
            ttl = ttl or settings.CACHE_DEFAULT_TTL
            serialized_value = json.dumps(value, default=str)
            self.redis_client.setex(key, ttl, serialized_value)
            logger.debug(f"Cache SET: {key} (TTL: {ttl}s)")
            return True
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            return False

    def delete(self, key: str) -> bool:
        """
        Delete value from cache

        Args:
            key: Cache key

        Returns:
            True if successful, False otherwise
        """
        if not self._enabled or not self.redis_client:
            return False

        try:
            self.redis_client.delete(key)
            logger.debug(f"Cache DELETE: {key}")
            return True
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
            return False

    def delete_pattern(self, pattern: str) -> int:
        """
        Delete all keys matching pattern

        Args:
            pattern: Pattern to match (e.g., "cache:reddit:*")

        Returns:
            Number of keys deleted
        """
        if not self._enabled or not self.redis_client:
            return 0

        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                deleted = self.redis_client.delete(*keys)
                logger.info(f"Cache DELETE pattern '{pattern}': {deleted} keys deleted")
                return deleted
            return 0
        except Exception as e:
            logger.error(f"Cache delete pattern error: {e}")
            return 0

    def clear_all(self) -> bool:
        """
        Clear all cache entries

        Returns:
            True if successful, False otherwise
        """
        if not self._enabled or not self.redis_client:
            return False

        try:
            self.redis_client.flushdb()
            logger.info("Cache cleared: All keys deleted")
            return True
        except Exception as e:
            logger.error(f"Cache clear error: {e}")
            return False

    def get_stats(self) -> dict:
        """
        Get cache statistics

        Returns:
            Dictionary with cache stats
        """
        if not self._enabled or not self.redis_client:
            return {
                "enabled": False,
                "connected": False
            }

        try:
            info = self.redis_client.info()
            return {
                "enabled": True,
                "connected": True,
                "used_memory": info.get("used_memory_human", "N/A"),
                "total_keys": self.redis_client.dbsize(),
                "hits": info.get("keyspace_hits", 0),
                "misses": info.get("keyspace_misses", 0),
                "hit_rate": (
                    info.get("keyspace_hits", 0) /
                    max(info.get("keyspace_hits", 0) + info.get("keyspace_misses", 0), 1)
                ) * 100
            }
        except Exception as e:
            logger.error(f"Cache stats error: {e}")
            return {
                "enabled": True,
                "connected": False,
                "error": str(e)
            }


# Global cache service instance
cache_service = CacheService()


def cached(prefix: str, ttl: Optional[int] = None):
    """
    Decorator to cache function results

    Args:
        prefix: Cache key prefix
        ttl: Time to live in seconds (optional)

    Usage:
        @cached(prefix="reddit_posts", ttl=300)
        async def get_posts(subreddit: str = None):
            ...
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = cache_service._generate_cache_key(prefix, *args, **kwargs)

            # Try to get from cache
            cached_result = cache_service.get(cache_key)
            if cached_result is not None:
                return cached_result

            # Call function and cache result
            result = await func(*args, **kwargs)

            # Cache the result (convert Pydantic models to dict for serialization)
            if hasattr(result, 'model_dump'):
                cache_data = result.model_dump()
            elif hasattr(result, 'dict'):
                cache_data = result.dict()
            else:
                cache_data = result

            cache_service.set(cache_key, cache_data, ttl)

            return result

        return wrapper
    return decorator
