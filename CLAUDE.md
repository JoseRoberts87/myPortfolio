# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack portfolio application demonstrating expertise across web development, data pipelines, analytics, machine learning, computer vision, and cloud infrastructure. The application consists of:
- **Frontend**: Next.js 16 (App Router) with React 19, TypeScript, and Tailwind CSS
- **Backend**: FastAPI (Python 3.12) with PostgreSQL and Redis
- **Infrastructure**: AWS ECS Fargate with Terraform IaC (9 modules, 66 resources)
- **Deployment**: Railway.app for backend (with Docker), GitHub Actions for AWS CI/CD

## Development Commands

### Frontend (Next.js)
```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm start               # Start production server
npm run lint            # Run ESLint

# Testing
npm test                # Run Jest tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
```

### Backend (FastAPI)
```bash
cd backend

# Setup (first time)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Development
uvicorn app.main:app --reload          # Start dev server (localhost:8000)
uvicorn app.main:app --reload --port 8001  # Custom port

# Testing
pytest                                  # Run tests
pytest --cov=app --cov-report=term-missing  # With coverage
pytest -v tests/api/test_health.py     # Single test file
pytest -k "test_health"                # Specific test pattern

# Database Migrations (Alembic)
alembic upgrade head                   # Apply all migrations
alembic revision --autogenerate -m "description"  # Create new migration
alembic current                        # Show current migration
alembic downgrade -1                   # Rollback one migration
```

### Infrastructure (Terraform)
```bash
cd terraform

# Development environment
terraform init -backend-config=environments/dev/backend.hcl
terraform plan -var-file=environments/dev/terraform.tfvars
terraform apply -var-file=environments/dev/terraform.tfvars

# Production environment
terraform init -backend-config=environments/prod/backend.hcl
terraform plan -var-file=environments/prod/terraform.tfvars

# Utilities
terraform output                       # Show all outputs
terraform output alb_dns_name         # Specific output
terraform validate                    # Validate configuration
```

### Docker & Local Services
```bash
# Start PostgreSQL and Redis
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Railway Deployment (Backend)
```bash
# Railway is configured to use the backend Dockerfile
# Deployment happens automatically on push to main branch

# Manual deployment trigger
railway up --service backend

# View logs
railway logs --service backend

# Check status
railway status
```

## Architecture

### Frontend Structure (`/src`)
- **app/**: Next.js App Router pages
  - Root pages: `layout.tsx`, `page.tsx`, `error.tsx`, `global-error.tsx`
  - Feature routes: `analytics/`, `cloud-devops/`, `computer-vision/`, `data-pipelines/`, `machine-learning/`, `web-dev/`
- **components/**: Reusable React components
  - `ui/`: UI component library
  - `Header.tsx`, `Footer.tsx`: Layout components
- **lib/**: Utility functions and helpers
- **contexts/**: React context providers
- **types/**: TypeScript type definitions

### Backend Structure (`/backend`)
- **app/main.py**: FastAPI application entry point with CORS, middleware, and exception handlers
- **app/api/**: API route handlers
  - `health.py`: Health check endpoints (`/health`, `/health/detailed`)
  - `reddit.py`: Reddit API integration endpoints
  - `pipeline.py`: Data pipeline orchestration
  - `analytics.py`: Analytics data endpoints
  - `stats.py`: Statistics endpoints
  - `cache.py`: Cache management endpoints
  - `contact.py`: Contact form handling
- **app/models/**: SQLAlchemy database models
- **app/schemas/**: Pydantic schemas for request/response validation
- **app/services/**: Business logic layer (Reddit API, caching, analytics)
- **app/core/**: Configuration, logging, and exception handling
- **app/middleware/**: Custom middleware (logging, error handlers)
- **app/db/**: Database connection and session management
- **alembic/**: Database migration scripts
- **tests/**: Pytest test suite (85%+ coverage)

### Infrastructure (`/terraform`)
Modular Terraform configuration with 9 modules:
- **vpc/**: Multi-AZ VPC with public/private subnets
- **ecs/**: ECS Fargate cluster and task definitions
- **rds/**: PostgreSQL 16 database
- **elasticache/**: Redis cache cluster
- **alb/**: Application Load Balancer with SSL/TLS
- **route53/**: DNS management
- **ecr/**: Container image registry
- **cloudwatch/**: Logging and monitoring
- **security-groups/**: Network security rules

## Key Technical Details

### API Endpoints
- Base URL (local): `http://localhost:8000`
- Base URL (production): `https://dev.therpiproject.com`
- API prefix: `/api/v1`
- Health check: `/health` (used by Railway and AWS healthchecks)
- Detailed health: `/api/v1/health/detailed` (includes DB/Redis status)
- API docs: `/docs` (Swagger UI), `/redoc` (ReDoc)

### Database
- **Local**: PostgreSQL via Docker Compose (port 5432)
- **Production**: AWS RDS PostgreSQL 16 (managed by Terraform)
- **Migrations**: Alembic (run automatically in Dockerfile CMD)
- **Connection**: Managed via SQLAlchemy with connection pooling

### Caching
- **Local**: Redis via Docker Compose (port 6379)
- **Production**: AWS ElastiCache Redis 7.1
- **Purpose**: Session management, API response caching

### Docker Configuration
- **Frontend**: Multi-stage build (deps → builder → runner) with Next.js standalone output
- **Backend**: Multi-stage build (builder → runtime) with non-root user
- **Backend CMD**: Runs Alembic migrations then starts Gunicorn with Uvicorn workers
- **Health checks**: Both images include HEALTHCHECK directives

### Railway-Specific Notes
- Backend deployed to Railway using `backend/Dockerfile`
- `railway.toml` configures: dockerfile path, healthcheck path (`/health`), restart policy
- Environment variables set via Railway dashboard
- Migrations run automatically on container startup via Dockerfile CMD

### Environment Variables
Frontend (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Backend (`.env`):
```
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio
REDIS_HOST=localhost
REDIS_PORT=6379
ENVIRONMENT=development
LOG_LEVEL=INFO
```

### Testing
- **Frontend**: Jest with React Testing Library (22 tests, 100% passing)
- **Backend**: Pytest with pytest-asyncio (85%+ coverage)
- **Test files**: `src/__tests__/**/*.test.tsx` (frontend), `backend/tests/**/*.py` (backend)
- **CI/CD**: Tests run automatically in GitHub Actions before deployment

### CI/CD Pipelines
**GitHub Actions workflows** (`.github/workflows/`):
1. **backend-deploy.yml**: Run pytest → Build Docker image → Push to ECR → Deploy to ECS Fargate
2. **frontend-deploy.yml**: Run Jest → Build Docker image → Push to ECR → Deploy to ECS Fargate
3. **terraform-deploy.yml**: Validate → Plan → Apply infrastructure changes (manual trigger)

Workflows trigger on push to `main` branch or manual workflow dispatch with environment selection (dev/prod).

### Deployment Strategy
- **Development**: Railway.app for backend (auto-deploy from GitHub)
- **Production**: AWS ECS Fargate with blue-green deployments
- **Zero-downtime**: ECS service updates with health checks
- **Rollback**: Redeploy previous ECR image tag

## Important Development Notes

### When Working with Backend
1. Always activate virtual environment: `source backend/venv/bin/activate`
2. Database migrations are auto-applied via Dockerfile, but test locally before pushing
3. Health check endpoint (`/health`) must return 200 OK for Railway/AWS to consider service healthy
4. Redis connection errors are logged but don't crash the app
5. All API routes are prefixed with `/api/v1` except root (`/`) and `/health`

### When Working with Frontend
1. Use `@/` import alias for `src/` directory (configured in tsconfig.json)
2. App Router convention: each route needs `page.tsx` to be publicly accessible
3. Server components by default; use `'use client'` directive for client components
4. Environment variables must be prefixed with `NEXT_PUBLIC_` to be exposed to browser

### When Working with Infrastructure
1. Terraform state stored in S3 with DynamoDB locking
2. Always run `terraform plan` before `apply`
3. Separate environments use separate state files (dev/prod)
4. Changes to security groups or IAM roles require careful review
5. NAT Gateways are the largest cost factor (~$65/month in dev)

### When Working with Database
1. Never modify database schema directly; always use Alembic migrations
2. Test migrations locally with `alembic upgrade head` before deploying
3. Migrations run automatically on Railway deployment (via Dockerfile CMD)
4. For rollback: `alembic downgrade -1` then create new migration

### When Adding New Dependencies
- **Frontend**: `npm install <package>` (updates package.json and package-lock.json)
- **Backend**: Add to `backend/requirements.txt` with version pin (e.g., `fastapi==0.115.5`)
- Always commit lockfiles (package-lock.json) to ensure reproducible builds

## Common Tasks

### Add a New API Endpoint
1. Create route handler in `backend/app/api/` (or add to existing file)
2. Define Pydantic schemas in `backend/app/schemas/`
3. Add business logic to `backend/app/services/` if complex
4. Include router in `backend/app/api/__init__.py`
5. Write tests in `backend/tests/api/`
6. Run `pytest` to verify

### Add a New Frontend Page
1. Create directory in `src/app/` (e.g., `src/app/new-feature/`)
2. Add `page.tsx` (and optionally `layout.tsx`, `loading.tsx`, `error.tsx`)
3. Add navigation link in `src/components/Header.tsx`
4. Create reusable components in `src/components/`
5. Add tests in `src/__tests__/`
6. Run `npm test` to verify

### Create a Database Migration
1. Modify models in `backend/app/models/`
2. Generate migration: `cd backend && alembic revision --autogenerate -m "description"`
3. Review generated migration in `backend/alembic/versions/`
4. Test locally: `alembic upgrade head`
5. Test rollback: `alembic downgrade -1`
6. Commit migration file

### Deploy to Production
1. Ensure all tests pass locally: `npm test` and `pytest`
2. Commit and push to feature branch
3. Create pull request to `main`
4. After PR review and merge, GitHub Actions automatically deploys to dev
5. For prod deployment: Manually trigger workflow with environment selection

## External Resources

- **API Documentation**: Access `/docs` on running backend for interactive Swagger UI
- **Architecture Diagram**: See `docs/architecture.md` for AWS infrastructure details
- **Deployment Guide**: See `DEPLOYMENT.md` for detailed AWS deployment instructions
- **Production URL**: https://dev.therpiproject.com
- **Database**: PostgreSQL 16 (AWS RDS in production, Docker in local)
- **Caching**: Redis 7.1 (AWS ElastiCache in production, Docker in local)
