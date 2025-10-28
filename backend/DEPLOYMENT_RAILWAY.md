# Railway Deployment Guide

This guide will help you deploy the FastAPI backend to Railway.

## Prerequisites

- GitHub account
- Railway account (sign up at https://railway.app)
- Reddit API credentials

## Step 1: Create Railway Project

1. Go to https://railway.app and sign in with GitHub
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose this repository (`myPortfolio`)
5. Railway will detect the Python app automatically

## Step 2: Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway will provision a PostgreSQL database
4. The database URL will be automatically available as `DATABASE_URL`

## Step 3: Configure Environment Variables

In your Railway project settings, add these environment variables:

```bash
# Database (automatically set by Railway, but verify)
DATABASE_URL=<Railway will provide this>

# Reddit API Credentials
REDDIT_CLIENT_ID=your_client_id_here
REDDIT_CLIENT_SECRET=your_client_secret_here
REDDIT_USER_AGENT=portfolio-app:v1.0.0 (by /u/your_username)

# API Configuration
PROJECT_NAME=Portfolio Data Pipeline
API_V1_PREFIX=/api/v1
DEBUG=False

# CORS Origins (add your Vercel frontend URL)
CORS_ORIGINS=https://portfolio-60sng8hin-joseroberts87s-projects.vercel.app,http://localhost:3000

# Pipeline Configuration
REDDIT_SUBREDDITS=python,javascript,machinelearning,datascience
REDDIT_POST_LIMIT=100
PIPELINE_SCHEDULE_MINUTES=60
```

## Step 4: Configure Root Directory (Important!)

Railway needs to know that the backend is in a subdirectory:

1. Click on your service in the project canvas
2. Go to the "Settings" tab
3. Scroll down to find "Root Directory"
4. Set **Root Directory** to: `backend`
5. Click "Save"

**Note:** This tells Railway to only pull files from the `/backend` directory when creating deployments, which speeds up builds and reduces deployment size.

## Step 5: Deploy

1. Railway will automatically deploy when you push to main (or click "Deploy" in dashboard)
2. Initial deployment may take 3-5 minutes
3. Railway will:
   - Use Railpack to analyze and build your Python app (zero configuration required)
   - Install Python dependencies from `requirements.txt`
   - Start the uvicorn server on the PORT environment variable
   - Perform healthcheck on `/health` endpoint (waits up to 5 minutes)
   - Route traffic to new deployment once healthcheck passes

**Important:** Railway uses Railpack, their modern builder that automatically detects Python/FastAPI and generates optimized container images. Healthchecks verify new deployments are ready before switching traffic, ensuring zero-downtime deployments.

## Step 6: Verify Deployment

Once deployed, Railway will provide a public URL (e.g., `https://your-app.railway.app`)

Test the endpoints:
```bash
# Health check
curl https://your-app.railway.app/health

# API root
curl https://your-app.railway.app/

# Test Reddit connection
curl -X POST https://your-app.railway.app/api/v1/reddit/test-connection
```

## Step 7: Initialize Database Tables

After first deployment, initialize the database:

1. Go to your Railway service
2. Open the "Deployments" tab
3. Find your latest deployment
4. You can run the init script via the Railway CLI or trigger it through the API

Or you can run the pipeline endpoint which will create the tables if they don't exist:
```bash
curl -X POST "https://your-app.railway.app/api/v1/pipeline/run?time_filter=day"
```

## Step 8: Update Frontend CORS

Add your Railway backend URL to your frontend's API configuration:

```typescript
// In your frontend .env or config
NEXT_PUBLIC_API_URL=https://your-app.railway.app
```

## Monitoring & Logs

- View logs in Railway dashboard under "Deployments" → "View Logs"
- Monitor database in the PostgreSQL service
- Set up alerts for deployment failures

## Common Issues

### Build Fails
- Check that `Root Directory` is set to `backend` in service settings
- Verify all dependencies are in `requirements.txt`
- Check build logs for specific errors
- Ensure `railway.toml` is in the correct location (`/backend/railway.toml`)

### Healthcheck Fails
- Verify `/health` endpoint returns HTTP 200
- Check that app listens on the `$PORT` environment variable (Railway injects this)
- Increase timeout if app takes longer to start (default: 300 seconds)
- Healthchecks come from `healthcheck.railway.app` - ensure not blocked

### Database Connection Errors
- Verify `DATABASE_URL` is set correctly (should be auto-set by Railway)
- Ensure PostgreSQL service is running
- Check if database tables are initialized
- Run the pipeline endpoint to initialize tables

### CORS Errors
- Add your frontend URL to `CORS_ORIGINS`
- Use comma-separated list for multiple origins
- Include both production and localhost URLs

## Railway CLI (Optional)

Install Railway CLI for easier management:
```bash
npm install -g @railway/cli
railway login
railway link
railway logs
```

## Costs

- PostgreSQL: ~$5/month after free trial
- Web Service: Based on usage (generous free tier)
- Total estimated: $5-10/month

## Next Steps

- Set up custom domain (optional)
- Configure automatic deployments
- Set up monitoring and alerts
- Consider scheduled pipeline runs with Railway Cron
