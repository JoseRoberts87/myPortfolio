# Railway Database Connection Fix

## Problem
The API is deployed and healthy, but database queries fail with:
```
could not translate host name "postgres.railway.internal" to address: Name or service not known
```

**API URL:** https://myportfolio-production-d468.up.railway.app

## Root Cause
The `DATABASE_URL` environment variable in Railway is not properly configured to connect to the PostgreSQL service.

## Solution Steps

### 1. Check PostgreSQL Service
In your Railway project dashboard:

1. Go to https://railway.app/project/shimmering-bravery
2. Verify that you have a **PostgreSQL** service in the project
   - If not, click "+ New" → "Database" → "PostgreSQL" to add one
3. Make sure the PostgreSQL service is running (should show green/healthy status)

### 2. Link Database to Web Service
Railway needs to know which database to connect to:

1. Click on your **web service** (the one running the FastAPI app)
2. Go to the **"Variables"** tab
3. Look for **"Service Variables"** or **"Reference Variables"**
4. You should see an option to **reference** variables from the PostgreSQL service

### 3. Set DATABASE_URL Correctly

Railway provides the database connection URL in different formats. You need to use the **private URL**:

**Option A: Automatic Reference (Recommended)**
1. In your web service's Variables tab
2. Click "+ New Variable"
3. Select "Reference" → Choose your PostgreSQL service
4. Select the variable: `DATABASE_URL` or `DATABASE_PRIVATE_URL`
5. This will automatically inject the correct connection string

**Option B: Manual Configuration**
1. Go to your PostgreSQL service
2. Click on the **Variables** tab
3. Copy the value of `DATABASE_PRIVATE_URL` (this is the internal network URL)
4. Go back to your web service's Variables tab
5. Set `DATABASE_URL` to the copied value
6. **Format should look like:** `postgresql://postgres:password@postgres.railway.internal:5432/railway`

### 4. Verify Connection String Format

The DATABASE_URL should:
- Start with `postgresql://` (NOT `postgres://`)
- Use `postgres.railway.internal` for the hostname (Railway's internal DNS)
- Include the port `:5432`
- Have valid credentials

**Correct format:**
```
postgresql://postgres:<PASSWORD>@postgres.railway.internal:5432/<DATABASE_NAME>
```

### 5. Check Service Linking

Make sure your web service and PostgreSQL service are in the same project:
1. Both services should be visible in the same project canvas
2. Railway's internal networking only works within the same project

### 6. Redeploy

After fixing the DATABASE_URL:
1. Railway should automatically redeploy
2. Or manually trigger: **Settings** → **Redeploy**
3. Wait for deployment to complete (check health status)

### 7. Verify Fix

Test the database connection:

```bash
# Check health endpoint (should still work)
curl https://myportfolio-production-d468.up.railway.app/health

# Test database endpoint (should return empty array instead of error)
curl https://myportfolio-production-d468.up.railway.app/api/v1/reddit/posts
```

**Expected result:**
```json
{"data":[],"total":0,"page":1,"page_size":50,"total_pages":0}
```

## Common Issues

### Issue: "postgres.railway.internal" not resolving
- **Cause:** Web service and PostgreSQL are in different projects
- **Fix:** Ensure both services are in the same Railway project

### Issue: Authentication failed
- **Cause:** Incorrect database credentials in DATABASE_URL
- **Fix:** Use the DATABASE_PRIVATE_URL from the PostgreSQL service (don't manually type credentials)

### Issue: Connection timeout
- **Cause:** PostgreSQL service is not running
- **Fix:** Check PostgreSQL service status, restart if needed

## Checking Logs

Use Railway CLI to check logs after redeployment:

```bash
# Link to service first
railway service myportfolio  # or whatever your service name is

# View logs
railway logs --lines 100
```

Look for:
```
INFO:__main__:Starting up - initializing database...
INFO:__main__:✓ Database initialized successfully! Tables: ['reddit_posts']
```

## Alternative: Use Public URL (Not Recommended)

If internal networking isn't working, you can use the public database URL:

1. Go to PostgreSQL service → Variables
2. Find `DATABASE_PUBLIC_URL` or `DATABASE_URL` (public version)
3. Use this in your web service's `DATABASE_URL` variable

**Note:** This routes through the public internet and is less secure. Only use if internal networking fails.

## Next Steps After Fix

Once the database connection is working:

1. **Test the API:**
   ```bash
   curl https://myportfolio-production-d468.up.railway.app/api/v1/reddit/posts
   ```

2. **Run the pipeline** to populate data:
   ```bash
   curl -X POST "https://myportfolio-production-d468.up.railway.app/api/v1/pipeline/run?time_filter=day"
   ```

3. **Update frontend** to use the Railway backend URL
