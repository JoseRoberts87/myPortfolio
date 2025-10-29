# Caching Configuration Guide

## Overview

The API caching layer uses Redis to cache frequently accessed endpoints, reducing database load and improving response times.

## Key Features

### Graceful Degradation
**Important:** If Redis is unavailable, the application will automatically disable caching and continue to work normally. You'll see a warning in the logs, but no errors.

### Automatic Cache Invalidation
Cache is automatically cleared when the data pipeline runs, ensuring fresh data after updates.

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Redis Cache Configuration
REDIS_HOST=localhost          # Redis server host
REDIS_PORT=6379              # Redis server port
REDIS_DB=0                   # Redis database number
REDIS_PASSWORD=              # Redis password (leave empty if none)
CACHE_ENABLED=True           # Enable/disable caching
CACHE_DEFAULT_TTL=300        # Default TTL in seconds (5 min)
CACHE_ANALYTICS_TTL=600      # Analytics cache TTL (10 min)
CACHE_STATS_TTL=300          # Stats cache TTL (5 min)
CACHE_REDDIT_TTL=180         # Reddit data cache TTL (3 min)
```

### Local Development

1. **Install Redis:**
   ```bash
   brew install redis
   ```

2. **Start Redis:**
   ```bash
   brew services start redis
   ```

3. **Verify Redis is running:**
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

4. **Check cache stats:**
   ```bash
   curl http://localhost:8000/api/v1/cache/stats
   ```

### Production Deployment (Railway)

1. **Add Redis Service:**
   - In Railway dashboard, click "+ New"
   - Select "Database" → "Add Redis"
   - Railway will provide connection details

2. **Update Environment Variables:**
   ```bash
   REDIS_HOST=<redis-service-name>.railway.internal
   REDIS_PORT=6379
   REDIS_PASSWORD=<provided-by-railway>
   CACHE_ENABLED=True
   ```

3. **Alternative: Disable Caching:**
   If you don't want to add Redis in production:
   ```bash
   CACHE_ENABLED=False
   ```

## Cache Management

### Monitor Cache Performance

```bash
# Get cache statistics
GET /api/v1/cache/stats

Response:
{
  "enabled": true,
  "connected": true,
  "used_memory": "2.5M",
  "total_keys": 45,
  "hits": 1250,
  "misses": 120,
  "hit_rate": 91.2
}
```

### Clear Cache Manually

```bash
# Clear all cache
POST /api/v1/cache/clear

# Clear specific pattern (e.g., all reddit cache)
DELETE /api/v1/cache/pattern/reddit
```

## Cached Endpoints

| Endpoint | TTL | Description |
|----------|-----|-------------|
| `GET /api/v1/reddit/posts` | 3 min | Paginated post listings |
| `GET /api/v1/reddit/posts/{id}` | 3 min | Individual post details |
| `GET /api/v1/reddit/subreddits` | 3 min | Subreddit list |
| `GET /api/v1/stats/overview` | 5 min | Statistics overview |
| `GET /api/v1/stats/subreddit/{name}` | 5 min | Subreddit-specific stats |
| `GET /api/v1/analytics/overview` | 10 min | Analytics dashboard data |

## Testing

### Testing with Cache Enabled

Tests should work normally as the cache service degrades gracefully if Redis is not available during testing.

### Disable Cache for Tests (Optional)

Add to your test configuration:

```python
# conftest.py
import os
os.environ['CACHE_ENABLED'] = 'False'
```

## Troubleshooting

### Issue: Cache not working

**Check:**
1. Redis is running: `redis-cli ping`
2. Environment variables are set correctly
3. Check logs for connection errors

**Solution:**
```bash
# Restart Redis
brew services restart redis

# Check cache stats endpoint
curl http://localhost:8000/api/v1/cache/stats
```

### Issue: Stale data being served

**Check:**
- Cache TTL settings in `.env`
- Pipeline runs are invalidating cache

**Solution:**
```bash
# Clear cache manually
curl -X POST http://localhost:8000/api/v1/cache/clear
```

### Issue: Redis connection errors in production

**Check:**
- REDIS_HOST points to correct service
- REDIS_PASSWORD is set correctly
- Redis service is running

**Solution:**
- Verify Railway Redis service is active
- Check Railway logs for connection details
- Temporarily set `CACHE_ENABLED=False` to debug

## Performance Impact

### Expected Improvements

- **Read-heavy endpoints:** 5-10x faster response times
- **Analytics queries:** 50-70% reduction in database load
- **High traffic:** Better handling of concurrent requests

### Monitoring

Monitor these metrics:
- Cache hit rate (aim for >80%)
- Response time improvements
- Database query reduction
- Redis memory usage

## Best Practices

1. **Set appropriate TTLs** based on data freshness requirements
2. **Monitor cache hit rates** to optimize TTL values
3. **Clear cache** after manual data updates
4. **Use Redis persistence** in production (Railway does this automatically)
5. **Monitor Redis memory usage** to prevent exhaustion
