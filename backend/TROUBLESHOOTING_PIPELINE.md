# Troubleshooting: Pipeline Not Collecting Data

## Problem
The pipeline endpoint returns "started" successfully, but no posts are being collected and stored in the database.

## Symptoms
- `POST /api/v1/pipeline/run` returns `{"status": "started", "message": "..."}`
- `GET /api/v1/pipeline/status` shows `total_posts: 0`
- `GET /api/v1/reddit/posts` returns empty array
- Even after waiting 30+ seconds, no data appears

## Root Causes

### 1. Background Task Failing Silently

The pipeline runs in a FastAPI background task which may fail without visible errors in the API response.

**How to check:**
1. Go to Railway dashboard: https://railway.app/project/shimmering-bravery
2. Click on your service → Deployments → Latest Deployment
3. Click "View Logs"
4. Trigger the pipeline: `curl -X POST "https://myportfolio-production-d468.up.railway.app/api/v1/pipeline/run?time_filter=day"`
5. Watch the logs for error messages

**What to look for:**
```
ERROR:app.api.pipeline:Pipeline execution failed: ...
ERROR:app.services.reddit_service:Error fetching posts from r/python: ...
```

### 2. Database Session Issue

The background task creates its own database session using `SessionLocal()` at app/api/pipeline.py:58, but this might not be initialized properly.

**Code location:** `/backend/app/api/pipeline.py:56-58`
```python
from app.db import SessionLocal

db = SessionLocal()
```

**Potential fix:**
The issue might be that `SessionLocal` is actually a function `get_session_local()` that returns the session maker.

**To fix (if this is the issue):**
```python
# Change line 58 from:
db = SessionLocal()

# To:
from app.db import get_session_local
SessionLocal = get_session_local()
db = SessionLocal()
```

### 3. Reddit API Credentials Not Configured

The Reddit service requires valid API credentials to fetch data.

**How to check:**
Test the connection endpoint:
```bash
curl -X POST "https://myportfolio-production-d468.up.railway.app/api/v1/reddit/test-connection"
```

**Expected response if working:**
```json
{"status":"success","message":"Reddit API connection successful"}
```

**If it fails:**
1. Go to Railway → Your service → Variables
2. Verify these are set:
   - `REDDIT_CLIENT_ID`
   - `REDDIT_CLIENT_SECRET`
   - `REDDIT_USER_AGENT`

### 4. Reddit API Rate Limiting

Reddit's API has rate limits. With read-only access (no authentication), you're limited to 60 requests per minute.

**How to check logs:**
Look for errors like:
```
ERROR:prawcore:Received 429 HTTP response
ERROR:app.services.reddit_service:Error fetching posts: received 429 HTTP response
```

**Solution:**
This is expected behavior. The script-based authentication we're using has limits. For production, you'd need:
- OAuth authentication (requires user login)
- Or spread requests over time
- Or reduce the number of subreddits/posts per request

### 5. Database Connection Lost in Background Task

The background task might lose database connection between when the endpoint returns and when it tries to save data.

**How to check logs:**
Look for:
```
ERROR:sqlalchemy.engine:Error on Connection.commit()
ERROR:app.api.pipeline:Pipeline execution failed: database connection closed
```

## Quick Diagnostic Steps

### Step 1: Test Reddit Connection
```bash
curl -X POST "https://myportfolio-production-d468.up.railway.app/api/v1/reddit/test-connection"
```

Expected: `{"status":"success","message":"Reddit API connection successful"}`

### Step 2: Check Railway Logs
1. Railway Dashboard → Service → Deployments → Latest → View Logs
2. Run pipeline: `curl -X POST "https://myportfolio-production-d468.up.railway.app/api/v1/pipeline/run?time_filter=day"`
3. Watch for errors in real-time

### Step 3: Check Database Tables
The database should have the `reddit_posts` table created. In Railway:
1. Click on your PostgreSQL service
2. Click "Data" tab (if available) or use the connection string to connect via psql
3. Check if table exists:
```sql
\dt
SELECT COUNT(*) FROM reddit_posts;
```

### Step 4: Test Locally
Run the backend locally to see detailed error messages:

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# In another terminal:
curl -X POST "http://localhost:8000/api/v1/pipeline/run?time_filter=day"

# Watch the server logs for detailed error messages
```

## Recommended Fixes

### Fix 1: Add Better Logging

Update `app/api/pipeline.py` to add more detailed logging:

```python
async def _execute_pipeline(time_filter: str = "day"):
    """Execute the data pipeline"""
    from app.db import get_session_local

    logger.info(f"[PIPELINE] Starting execution with time_filter={time_filter}")

    try:
        SessionLocal = get_session_local()
        db = SessionLocal()
        logger.info("[PIPELINE] Database session created")

        # Initialize Reddit service
        logger.info("[PIPELINE] Initializing Reddit service...")
        reddit_service = RedditService()
        logger.info("[PIPELINE] Reddit service initialized")

        # Fetch posts
        logger.info(f"[PIPELINE] Fetching posts from {settings.REDDIT_SUBREDDITS}...")
        posts = reddit_service.fetch_posts_from_all_subreddits(
            limit_per_subreddit=settings.REDDIT_POST_LIMIT,
            time_filter=time_filter
        )
        logger.info(f"[PIPELINE] Fetched {len(posts)} posts")

        # Store posts
        stored_count = 0
        updated_count = 0

        for i, post_data in enumerate(posts):
            try:
                existing_post = db.query(RedditPost).filter(
                    RedditPost.id == post_data.id
                ).first()

                if existing_post:
                    for key, value in post_data.model_dump().items():
                        setattr(existing_post, key, value)
                    updated_count += 1
                else:
                    new_post = RedditPost(**post_data.model_dump())
                    db.add(new_post)
                    stored_count += 1

                # Commit in batches of 10
                if (i + 1) % 10 == 0:
                    db.commit()
                    logger.info(f"[PIPELINE] Committed batch: {i + 1} posts processed")

            except Exception as e:
                logger.error(f"[PIPELINE] Error processing post {post_data.id}: {str(e)}")
                continue

        # Final commit
        db.commit()
        logger.info(f"[PIPELINE] ✓ Pipeline completed. Stored: {stored_count}, Updated: {updated_count}")

    except Exception as e:
        logger.error(f"[PIPELINE] ✗ Pipeline execution failed: {str(e)}")
        logger.exception(e)  # This will print the full stack trace
        db.rollback()
        raise
    finally:
        db.close()
        logger.info("[PIPELINE] Database session closed")
```

### Fix 2: Make Pipeline Synchronous (For Testing)

Change the pipeline to run synchronously so errors are immediately visible:

```python
@router.post("/run-sync")  # Add a new synchronous endpoint for testing
async def run_pipeline_sync(
    time_filter: str = "day",
    db: Session = Depends(get_db)
):
    """
    Run pipeline synchronously (for debugging)
    """
    try:
        logger.info(f"Starting sync pipeline with time_filter={time_filter}")

        # Initialize Reddit service
        reddit_service = RedditService()

        # Fetch posts
        posts = reddit_service.fetch_posts_from_all_subreddits(
            limit_per_subreddit=settings.REDDIT_POST_LIMIT,
            time_filter=time_filter
        )

        # Store posts
        stored_count = 0
        for post_data in posts:
            existing_post = db.query(RedditPost).filter(
                RedditPost.id == post_data.id
            ).first()

            if not existing_post:
                new_post = RedditPost(**post_data.model_dump())
                db.add(new_post)
                stored_count += 1

        db.commit()

        return {
            "status": "completed",
            "message": f"Pipeline completed. Stored {stored_count} new posts.",
            "total_fetched": len(posts),
            "new_posts": stored_count
        }

    except Exception as e:
        logger.error(f"Pipeline failed: {str(e)}")
        logger.exception(e)
        raise HTTPException(status_code=500, detail=str(e))
```

Then test with:
```bash
curl -X POST "https://myportfolio-production-d468.up.railway.app/api/v1/pipeline/run-sync?time_filter=day"
```

This will return the error immediately instead of hiding it in background tasks.

## Expected Behavior When Working

When the pipeline is working correctly, you should see:

1. **In Railway Logs:**
```
INFO:app.api.pipeline:[PIPELINE] Starting execution with time_filter=day
INFO:app.api.pipeline:[PIPELINE] Database session created
INFO:app.api.pipeline:[PIPELINE] Initializing Reddit service...
INFO:app.api.pipeline:[PIPELINE] Reddit service initialized
INFO:app.api.pipeline:[PIPELINE] Fetching posts from python,javascript,machinelearning,datascience...
INFO:app.services.reddit_service:Fetched 100 posts from r/python
INFO:app.services.reddit_service:Fetched 100 posts from r/javascript
INFO:app.services.reddit_service:Fetched 100 posts from r/machinelearning
INFO:app.services.reddit_service:Fetched 100 posts from r/datascience
INFO:app.api.pipeline:[PIPELINE] Fetched 400 posts
INFO:app.api.pipeline:[PIPELINE] ✓ Pipeline completed. Stored: 400, Updated: 0
```

2. **API Response:**
```bash
curl "https://myportfolio-production-d468.up.railway.app/api/v1/pipeline/status"
{
  "status": "active",
  "total_posts": 400,
  "total_subreddits": 4,
  "latest_post_date": "2025-10-29T10:30:00",
  "configured_subreddits": ["python", "javascript", "machinelearning", "datascience"]
}
```

3. **Posts Endpoint:**
```bash
curl "https://myportfolio-production-d468.up.railway.app/api/v1/reddit/posts?page_size=2"
{
  "posts": [
    {
      "id": "abc123",
      "title": "Check out my project!",
      "subreddit": "python",
      ...
    },
    ...
  ],
  "total": 400,
  "page": 1,
  "page_size": 2
}
```

## Next Steps

1. **Check Railway logs** (most important!)
2. **Verify Reddit API credentials** are set in Railway
3. **Test the synchronous endpoint** to get immediate error feedback
4. **Test locally** to see detailed error messages
5. **Add enhanced logging** to track pipeline execution

Once you see the actual error in the logs, we can fix the specific issue!
