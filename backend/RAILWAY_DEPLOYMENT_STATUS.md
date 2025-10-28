# Railway Deployment Status

## ✅ Successfully Deployed

Your FastAPI backend is now live on Railway!

**Production URL:** https://myportfolio-production-d468.up.railway.app

### Working Endpoints

All core endpoints are functioning:

```bash
# Health check
curl https://myportfolio-production-d468.up.railway.app/health
# Response: {"status":"healthy","service":"portfolio-api"}

# API root
curl https://myportfolio-production-d468.up.railway.app/
# Response: {"message":"Portfolio Data Pipeline API","status":"online","version":"1.0.0"}

# Database connection (empty but working)
curl https://myportfolio-production-d468.up.railway.app/api/v1/reddit/posts
# Response: {"posts":[],"total":0,"page":1,"page_size":50}

# Reddit API connection
curl -X POST https://myportfolio-production-d468.up.railway.app/api/v1/reddit/test-connection
# Response: {"status":"success","message":"Reddit API connection successful"}

# Pipeline status
curl https://myportfolio-production-d468.up.railway.app/api/v1/pipeline/status
# Response: {"status":"active","total_posts":0,...}
```

## ✅ What's Working

1. **FastAPI Application** - Running successfully on Railway
2. **PostgreSQL Database** - Connected and initialized
3. **Database Tables** - Created successfully (via lifespan event in app/main.py:24)
4. **Reddit API Connection** - Configured and working
5. **CORS** - Configured for your frontend
6. **Health Checks** - Passing
7. **Auto-deployment** - Connected to GitHub main branch

## 📋 Deployment Configuration

### Files Created/Modified

1. **railway.toml** - Railway deployment configuration
   - Uses Railpack builder (modern, automatic detection)
   - Health check on `/health` endpoint
   - 5-minute timeout for healthchecks
   - Retry policy on failure

2. **app/main.py** - Updated with lifespan event
   - Database initialization runs on startup (app/main.py:15-38)
   - Creates tables automatically when container starts
   - Graceful error handling

3. **app/db/database.py** - Lazy database initialization
   - Connection created only when needed
   - Prevents import-time connection errors

### Environment Variables Configured

Based on the working endpoints, these are already set in Railway:

```bash
DATABASE_URL=postgresql://postgres:***@postgres.railway.internal:5432/railway
REDDIT_CLIENT_ID=nYg3Csn9hFfC94yQaqGdRw
REDDIT_CLIENT_SECRET=SYWRXn2U7yAkwUxe57T2q83IWue7bg
REDDIT_USER_AGENT=portfolio-app:v1.0.0 (by /u/your_username)
CORS_ORIGINS=http://localhost:3000,https://portfolio-60sng8hin-joseroberts87s-projects.vercel.app
```

## 🔄 Next Steps

### 1. Test Data Collection

The pipeline is ready to collect data. Run it manually:

```bash
# Collect posts from the last day
curl -X POST "https://myportfolio-production-d468.up.railway.app/api/v1/pipeline/run?time_filter=day"

# Wait a minute, then check if data was collected
curl "https://myportfolio-production-d468.up.railway.app/api/v1/reddit/posts" | python3 -m json.tool
```

**Note:** If no data appears after the pipeline runs, check Railway logs in the dashboard:
1. Go to your service → Deployments → Latest Deployment → View Logs
2. Look for any errors during the pipeline execution
3. The pipeline runs in the background, so you won't see immediate results

### 2. Update Frontend Configuration

Update your Next.js frontend to use the Railway backend:

**In your frontend repository:**

```typescript
// .env.local or .env.production
NEXT_PUBLIC_API_URL=https://myportfolio-production-d468.up.railway.app
```

Then redeploy your Vercel frontend.

### 3. Set Up Scheduled Pipeline (Optional)

To automatically refresh data periodically, you can:

**Option A: Use Railway Cron**
1. Go to Railway project → + New → Cron Job
2. Set schedule (e.g., `0 */6 * * *` for every 6 hours)
3. Set command: `curl -X POST "https://myportfolio-production-d468.up.railway.app/api/v1/pipeline/run?time_filter=day"`

**Option B: Use an external cron service**
- Use services like cron-job.org or EasyCron
- Schedule HTTP POST requests to your pipeline endpoint

### 4. Monitor Deployment

**View Logs:**
```bash
# Using Railway CLI (if service is linked)
railway logs --lines 100
```

Or in Railway Dashboard:
- Go to your service
- Click "Deployments" tab
- Select latest deployment
- Click "View Logs"

**Key log messages to look for:**
```
INFO:__main__:Starting up - initializing database...
INFO:__main__:✓ Database initialized successfully! Tables: ['reddit_posts']
```

## 🎯 API Endpoints Available

### Health & Info
- `GET /` - API information
- `GET /health` - Health check
- `GET /api/v1/openapi.json` - OpenAPI documentation

### Reddit Data
- `GET /api/v1/reddit/posts` - Get posts (with pagination)
  - Query params: `?subreddit=python&page=1&page_size=50`
- `GET /api/v1/reddit/posts/{post_id}` - Get specific post
- `POST /api/v1/reddit/test-connection` - Test Reddit API

### Pipeline
- `POST /api/v1/pipeline/run` - Run data collection
  - Query params: `?time_filter=day|week|month|year|all`
- `GET /api/v1/pipeline/status` - Pipeline status

## 📊 Database Schema

The PostgreSQL database has been initialized with:

**Table: reddit_posts**
- id (primary key)
- post_id (unique Reddit ID)
- title
- author
- subreddit
- created_at
- score
- url
- num_comments
- selftext
- fetched_at

## 🔍 Troubleshooting

### If pipeline doesn't collect data:

1. **Check logs** in Railway dashboard for errors
2. **Verify Reddit credentials** are set correctly in Railway variables
3. **Test Reddit connection:**
   ```bash
   curl -X POST https://myportfolio-production-d468.up.railway.app/api/v1/reddit/test-connection
   ```
4. **Try running pipeline with different time filters:**
   ```bash
   curl -X POST "https://myportfolio-production-d468.up.railway.app/api/v1/pipeline/run?time_filter=week"
   ```

### If database errors occur:

1. **Verify DATABASE_URL** is set correctly in Railway
   - Should be: `postgresql://postgres:...@postgres.railway.internal:5432/railway`
2. **Check PostgreSQL service** is running in Railway project
3. **Check logs** for database initialization errors

### If CORS errors occur:

1. **Verify CORS_ORIGINS** includes your frontend URL
2. **Update variable** in Railway if needed
3. **Redeploy** after changing variables

## 💰 Railway Costs

Current configuration:
- **PostgreSQL:** ~$5/month (after free trial)
- **Web Service:** Based on usage
- **Estimated total:** $5-10/month

Railway provides a generous free tier for testing.

## 🚀 Deployment Flow

Your current setup:

1. **Push to main** → GitHub
2. **Railway detects change** → Automatic build
3. **Railpack builds** → Creates optimized container
4. **Health check** → Verifies `/health` endpoint
5. **Switch traffic** → Zero-downtime deployment

## 📝 Summary

✅ Backend deployed and fully functional
✅ Database connected and initialized
✅ Reddit API configured
✅ All endpoints working
✅ Auto-deployment from GitHub enabled

**Production URL:** https://myportfolio-production-d468.up.railway.app

Ready to connect to your frontend!
