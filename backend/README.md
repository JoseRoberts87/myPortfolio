# Portfolio Backend - FastAPI Data Pipeline

Backend API for the portfolio application featuring social media data pipeline, analytics, and machine learning capabilities.

## Tech Stack

- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** - ORM for database operations
- **PRAW** - Python Reddit API Wrapper
- **Docker** - Containerization for PostgreSQL

## Project Structure

```
backend/
├── app/
│   ├── api/              # API endpoints
│   │   ├── reddit.py     # Reddit data endpoints
│   │   ├── pipeline.py   # Pipeline control endpoints
│   │   └── stats.py      # Statistics endpoints
│   ├── core/             # Core configuration
│   │   └── config.py     # Application settings
│   ├── db/               # Database configuration
│   │   └── database.py   # SQLAlchemy setup
│   ├── models/           # Database models
│   │   └── reddit_post.py
│   ├── schemas/          # Pydantic schemas
│   │   └── reddit.py
│   ├── services/         # Business logic
│   │   └── reddit_service.py
│   └── main.py           # Application entry point
├── docker-compose.yml    # Docker configuration
├── requirements.txt      # Python dependencies
├── init_db.py           # Database initialization
└── .env.example         # Environment variables template

```

## Setup Instructions

### Prerequisites

- Python 3.11+
- Docker and Docker Compose
- Reddit API credentials

### 1. Get Reddit API Credentials

1. Go to https://www.reddit.com/prefs/apps
2. Click "Create App" or "Create Another App"
3. Fill in:
   - **Name**: Portfolio Data Pipeline
   - **App type**: Select "script"
   - **Description**: Data pipeline for portfolio project
   - **About URL**: (leave blank)
   - **Redirect URI**: http://localhost:8000
4. Click "Create app"
5. Note down:
   - **Client ID**: Under the app name
   - **Client Secret**: Next to "secret"

### 2. Environment Setup

1. **Create virtual environment**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Create .env file**:
   ```bash
   cp .env.example .env
   ```

4. **Edit .env file** with your credentials:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portfolio_db

   REDDIT_CLIENT_ID=your_client_id_here
   REDDIT_CLIENT_SECRET=your_client_secret_here
   REDDIT_USER_AGENT=portfolio-app:v1.0.0 (by /u/your_reddit_username)
   ```

### 3. Start PostgreSQL Database

```bash
docker-compose up -d
```

This will start PostgreSQL on port 5432. Check status:
```bash
docker-compose ps
```

### 4. Initialize Database

```bash
python init_db.py
```

This creates all necessary database tables.

### 5. Run the API Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## API Endpoints

### Health Check
- `GET /` - Root endpoint
- `GET /health` - Health check

### Reddit Data
- `GET /api/v1/reddit/posts` - Get Reddit posts (with pagination)
- `GET /api/v1/reddit/posts/{post_id}` - Get specific post
- `GET /api/v1/reddit/subreddits` - List all subreddits
- `POST /api/v1/reddit/test-connection` - Test Reddit API

### Pipeline Control
- `POST /api/v1/pipeline/run` - Trigger data pipeline
- `GET /api/v1/pipeline/status` - Get pipeline status

### Statistics
- `GET /api/v1/stats/overview` - Overall statistics
- `GET /api/v1/stats/subreddit/{name}` - Subreddit-specific stats

## Usage Examples

### 1. Test Reddit Connection
```bash
curl -X POST http://localhost:8000/api/v1/reddit/test-connection
```

### 2. Run the Data Pipeline
```bash
curl -X POST "http://localhost:8000/api/v1/pipeline/run?time_filter=day"
```

### 3. Get Statistics
```bash
curl http://localhost:8000/api/v1/stats/overview
```

### 4. Get Reddit Posts
```bash
curl "http://localhost:8000/api/v1/reddit/posts?page=1&page_size=10"
```

## Development

### Run Tests
```bash
pytest
```

### Stop Database
```bash
docker-compose down
```

### Reset Database
```bash
docker-compose down -v  # Removes volumes
docker-compose up -d
python init_db.py
```

## Configuration

Edit `.env` to configure:
- Database connection
- Reddit API credentials
- CORS origins
- Subreddits to track
- Pipeline schedule

## Troubleshooting

### Database Connection Errors
- Ensure Docker is running
- Check PostgreSQL container: `docker-compose logs postgres`
- Verify DATABASE_URL in .env

### Reddit API Errors
- Verify credentials in .env
- Check rate limits (60 requests per minute)
- Ensure user agent is descriptive

### Import Errors
- Activate virtual environment
- Reinstall dependencies: `pip install -r requirements.txt`

## Deployment

### Railway Deployment

See [DEPLOYMENT_RAILWAY.md](./DEPLOYMENT_RAILWAY.md) for detailed Railway deployment instructions.

Quick steps:
1. Create Railway project from GitHub
2. Add PostgreSQL database
3. Configure environment variables
4. Set root directory to `backend`
5. Deploy!

## Next Steps

- [ ] Add sentiment analysis model
- [ ] Implement scheduled pipeline runs
- [ ] Add data validation
- [ ] Create monitoring dashboard
- [x] Deploy to Railway
