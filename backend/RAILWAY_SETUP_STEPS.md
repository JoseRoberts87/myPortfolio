# Railway Setup Steps

Follow these steps to deploy your FastAPI backend to Railway.

## Step 1: Create Railway Account & Project

1. Go to https://railway.app and sign in with your GitHub account
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Find and select `JoseRoberts87/myPortfolio`
5. Railway will ask which service to deploy - it should detect the Python app in the `backend` folder

## Step 2: Configure Root Directory

**IMPORTANT:** Railway needs to know the backend is in a subdirectory:

1. After creating the project, click on your service
2. Go to "Settings" tab
3. Find "Root Directory" setting
4. Set it to: `backend`
5. Click "Save"

## Step 3: Add PostgreSQL Database

1. In your Railway project dashboard, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway will provision a PostgreSQL database
4. The `DATABASE_URL` will be automatically linked to your service

## Step 4: Configure Environment Variables

1. Click on your backend service
2. Go to "Variables" tab
3. Add these environment variables:

```
REDDIT_CLIENT_ID=nYg3Csn9hFfC94yQaqGdRw
REDDIT_CLIENT_SECRET=SYWRXn2U7yAkwUxe57T2q83IWue7bg
REDDIT_USER_AGENT=portfolio-app:v1.0.0 (by /u/your_username)
PROJECT_NAME=Portfolio Data Pipeline
API_V1_PREFIX=/api/v1
DEBUG=False
CORS_ORIGINS=https://portfolio-60sng8hin-joseroberts87s-projects.vercel.app,http://localhost:3000
REDDIT_SUBREDDITS=python,javascript,machinelearning,datascience
REDDIT_POST_LIMIT=100
PIPELINE_SCHEDULE_MINUTES=60
```

**Note:** `DATABASE_URL` should already be set automatically by Railway when you added PostgreSQL.

## Step 5: Deploy

Railway will automatically deploy when you complete the setup:
- Click "Deploy" in the top right to trigger a deployment
- Or deployments happen automatically from GitHub pushes to main

## Step 6: Verify Deployment

Once deployed, Railway will provide a public URL (e.g., `https://your-app.railway.app`)

Test the endpoints:
```bash
# Get your Railway URL first, then test:

# Health check
curl https://your-app.railway.app/health

# API root
curl https://your-app.railway.app/

# Test Reddit connection
curl -X POST https://your-app.railway.app/api/v1/reddit/test-connection

# Run the pipeline
curl -X POST "https://your-app.railway.app/api/v1/pipeline/run?time_filter=day"
```

## Step 7: Update Frontend

After deployment, update your frontend to use the Railway backend URL:

1. Add the Railway URL to your frontend environment variables
2. Update CORS settings if needed
3. Deploy frontend changes to Vercel

## Monitoring

- View logs: Railway Dashboard → Deployments → View Logs
- Check database: Click on PostgreSQL service
- Monitor metrics: Railway provides CPU, memory, and network usage

## Troubleshooting

If deployment fails:
1. Check the build logs in Railway
2. Verify Root Directory is set to `backend`
3. Ensure all environment variables are set
4. Check that PostgreSQL database is running
5. Review the deployment guide: DEPLOYMENT_RAILWAY.md
