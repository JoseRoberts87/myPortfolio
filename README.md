# Portfolio Application

A comprehensive full-stack portfolio showcasing expertise across six key domains: Web Development, Data Pipelines, Data Analytics, Machine Learning, Computer Vision, and Cloud & DevOps.

## 🚀 Live Demo

**Production Environment**: https://dev.therpiproject.com

## 🏗️ Architecture

Production-grade AWS infrastructure with multi-AZ deployment, ECS Fargate containers, and comprehensive monitoring. All infrastructure is managed as code using Terraform with automated CI/CD pipelines.

**[View Complete Architecture Documentation →](./docs/architecture.md)**

![AWS Infrastructure](./public/images/aws-architecture.svg)

### Key Infrastructure Highlights
- **Multi-AZ Deployment**: High availability across us-east-1a and us-east-1b
- **Container Orchestration**: ECS Fargate with auto-scaling (1-4 tasks)
- **Database**: RDS PostgreSQL 16 with automated backups
- **Caching**: ElastiCache Redis for session management
- **Load Balancing**: Application Load Balancer with SSL/TLS
- **Monitoring**: CloudWatch with Container Insights
- **Infrastructure as Code**: 100% Terraform coverage
- **CI/CD**: Automated deployments via GitHub Actions

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.0.0** - React framework with App Router (Turbopack)
- **React 19.2.0** - Latest React with automatic JSX runtime
- **TypeScript 5.9.3** - Type-safe development
- **Tailwind CSS 4.1.16** - Utility-first styling
- **Recharts** - Data visualization library

### Backend
- **FastAPI** - Python 3.11+ high-performance API framework
- **PostgreSQL 16** - Relational database with SQLAlchemy ORM
- **Redis 7.1** - In-memory caching and session storage
- **Uvicorn** - ASGI server
- **Alembic** - Database migrations
- **Pytest** - Testing framework with 85%+ coverage

### Machine Learning & Data
- **Transformers** - Hugging Face models for sentiment analysis
- **Pandas** - Data manipulation and analysis
- **NumPy** - Numerical computing
- **Scikit-learn** - Machine learning utilities

### Cloud Infrastructure (AWS)
- **ECS Fargate** - Serverless container orchestration
- **RDS PostgreSQL** - Managed relational database
- **ElastiCache Redis** - Managed in-memory cache
- **Application Load Balancer** - Layer 7 load balancing
- **Route 53** - DNS management
- **CloudWatch** - Logging and monitoring
- **ECR** - Container registry
- **VPC** - Network isolation

### DevOps & CI/CD
- **Terraform** - Infrastructure as Code (9 modules, 66 resources)
- **GitHub Actions** - Automated testing and deployment
- **Docker** - Containerization
- **AWS CLI** - Cloud resource management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- AWS CLI (for production deployment)
- Terraform 1.5+ (for infrastructure management)

### Local Development

#### 1. Clone the repository
```bash
git clone https://github.com/JoseRoberts87/myPortfolio.git
cd portfolio
```

#### 2. Frontend Setup
```bash
npm install
npm run dev
```
Frontend runs at [http://localhost:3000](http://localhost:3000)

#### 3. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Backend API runs at [http://localhost:8000](http://localhost:8000)

API documentation available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

#### 4. Database Setup (Docker)
```bash
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379

#### 5. Run Database Migrations
```bash
cd backend
alembic upgrade head
```

## 📁 Project Structure

```
portfolio/
├── docs/                           # Documentation
│   ├── PROJECT_PLAN.md            # Detailed project plan
│   ├── DECISIONS.md               # Architectural decisions
│   ├── GIT_WORKFLOW.md            # Git branching strategy
│   ├── TECH_STACK.md              # Technology reference
│   ├── architecture.md            # AWS infrastructure architecture
│   └── DEPLOYMENT.md              # Deployment guide
├── src/                           # Frontend source
│   ├── app/                       # Next.js app directory
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page
│   │   ├── cloud-devops/         # Cloud & DevOps showcase
│   │   ├── analytics/            # Analytics dashboard
│   │   ├── machine-learning/     # ML showcase
│   │   └── data-pipelines/       # Data pipelines page
│   ├── components/                # Reusable React components
│   │   ├── ui/                   # UI component library
│   │   ├── Header.tsx            # Navigation header
│   │   └── Footer.tsx            # Footer component
│   └── lib/                      # Utility functions
├── backend/                       # FastAPI backend
│   ├── app/
│   │   ├── main.py               # FastAPI application
│   │   ├── models/               # Database models
│   │   ├── routers/              # API route handlers
│   │   ├── services/             # Business logic
│   │   └── core/                 # Configuration
│   ├── tests/                    # Backend tests
│   ├── alembic/                  # Database migrations
│   └── requirements.txt          # Python dependencies
├── terraform/                     # Infrastructure as Code
│   ├── main.tf                   # Root Terraform config
│   ├── modules/                  # Terraform modules
│   │   ├── vpc/                  # VPC configuration
│   │   ├── ecs/                  # ECS Fargate setup
│   │   ├── rds/                  # PostgreSQL database
│   │   ├── elasticache/          # Redis cache
│   │   ├── alb/                  # Load balancer
│   │   └── cloudwatch/           # Monitoring
│   └── environments/             # Environment configs
│       ├── dev.tfvars
│       └── prod.tfvars
├── .github/
│   └── workflows/                # CI/CD pipelines
│       ├── terraform-deploy.yml  # Infrastructure deployment
│       ├── backend-deploy.yml    # Backend container deployment
│       └── frontend-deploy.yml   # Frontend deployment
├── public/
│   └── images/
│       └── aws-architecture.svg  # Architecture diagram
├── docker-compose.yml            # Local development services
└── Dockerfile                    # Multi-stage Docker build
```

## 📜 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Backend
- `uvicorn app.main:app --reload` - Start dev server
- `pytest` - Run tests
- `pytest --cov` - Run tests with coverage
- `alembic upgrade head` - Run migrations
- `alembic revision --autogenerate -m "message"` - Create migration

### Infrastructure
- `terraform init` - Initialize Terraform
- `terraform plan` - Preview infrastructure changes
- `terraform apply` - Apply infrastructure changes
- `terraform destroy` - Destroy infrastructure

## ✅ Features

### Phase 1: Web Development Foundation ✅
- [x] Next.js setup with TypeScript
- [x] Tailwind CSS configuration
- [x] Project structure
- [x] Navigation components (Header, Footer)
- [x] Landing page with hero section
- [x] Responsive design across all breakpoints
- [x] Reusable UI component library
- [x] Dark/light mode toggle
- [x] Routing structure for all 6 expertise areas
- [x] Unit tests (22 tests, 100% passing)
- [x] Production deployment

### Phase 2: Backend & Data Pipeline ✅
- [x] FastAPI backend with Python 3.11+
- [x] PostgreSQL database with SQLAlchemy ORM
- [x] Redis caching layer
- [x] Social media data pipeline (Reddit API integration)
- [x] Real-time data ingestion
- [x] Database migrations with Alembic
- [x] API documentation (Swagger/ReDoc)
- [x] Comprehensive test suite (85%+ coverage)
- [x] Error handling and logging

### Phase 3: Analytics & Machine Learning ✅
- [x] Interactive analytics dashboard
- [x] Sentiment analysis ML model (DistilBERT)
- [x] Data visualizations with Recharts
- [x] Real-time metrics and insights
- [x] Performance tracking
- [x] Batch processing pipeline

### Phase 4: Computer Vision 🚧
- [ ] Real-time object detection
- [ ] Webcam integration
- [ ] YOLO model deployment
- [ ] Image upload and processing

### Phase 5: AWS Cloud Infrastructure ✅
- [x] Infrastructure as Code with Terraform
- [x] Multi-AZ VPC with public/private subnets
- [x] ECS Fargate container orchestration
- [x] RDS PostgreSQL managed database
- [x] ElastiCache Redis
- [x] Application Load Balancer with SSL/TLS
- [x] Route 53 DNS management
- [x] CloudWatch monitoring and logging
- [x] ECR container registry
- [x] Auto-scaling policies
- [x] Security groups and IAM roles
- [x] GitHub Actions CI/CD pipelines
- [x] Zero-downtime deployments
- [x] Automated backups and disaster recovery

### Phase 6: Additional Features 🚧
- [ ] Skills matrix visualization
- [ ] GitHub integration
- [ ] Contact form
- [ ] Resume download
- [ ] Timeline/Experience section
- [ ] Blog/Articles section

## 📖 Documentation

Comprehensive documentation is available in the `/docs` folder:
- **[architecture.md](./docs/architecture.md)** - Complete AWS infrastructure architecture with Mermaid diagrams
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Step-by-step deployment guide
- **[PROJECT_PLAN.md](./docs/PROJECT_PLAN.md)** - Detailed project plan with execution phases
- **[DECISIONS.md](./docs/DECISIONS.md)** - Architecture and technology decisions
- **[GIT_WORKFLOW.md](./docs/GIT_WORKFLOW.md)** - Git branching strategy
- **[TECH_STACK.md](./docs/TECH_STACK.md)** - Comprehensive version reference
- **[PACKAGE_REFERENCES.md](./docs/PACKAGE_REFERENCES.md)** - Official documentation links

### Terraform Modules
The infrastructure code is organized into 9 modular components:
1. **VPC** - Network foundation with Multi-AZ subnets
2. **ECS** - Container orchestration with Fargate
3. **RDS** - PostgreSQL database
4. **ElastiCache** - Redis caching
5. **ALB** - Application load balancing
6. **Route53** - DNS and domain management
7. **ECR** - Container image registry
8. **CloudWatch** - Monitoring and logging
9. **Security Groups** - Network access control

## 🔧 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio
REDIS_HOST=localhost
REDIS_PORT=6379
ENVIRONMENT=development
```

## 🧪 Testing

### Frontend Tests
```bash
npm test
```

### Backend Tests
```bash
cd backend
pytest --cov=app tests/
```

Current backend test coverage: **85%+**

## 🚀 Deployment

### Automated Deployment (GitHub Actions)
Pushes to `main` branch automatically trigger:
1. **Terraform workflow** - Infrastructure updates (manual trigger)
2. **Backend workflow** - Container build, test, push to ECR, deploy to ECS
3. **Frontend workflow** - Build, test, deploy to ECS

### Manual Deployment
See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed deployment instructions.

## 📊 Infrastructure Costs

**Development Environment**: ~$115-130/month
- NAT Gateways: ~$65/month
- RDS (db.t4g.micro): ~$12/month
- ElastiCache (cache.t4g.micro): ~$12/month
- ALB: ~$16/month
- ECS Fargate: ~$10-20/month

**Production Environment**: ~$200-250/month (with Multi-AZ and higher capacity)

## 🔐 Security Features

- ✅ Private subnets for all application resources
- ✅ Security groups with least-privilege access
- ✅ SSL/TLS encryption via ACM
- ✅ No hardcoded credentials
- ✅ IAM roles with minimal permissions
- ✅ ECR image scanning enabled
- ✅ Database encryption at rest
- ✅ Automated security patches

## 🎯 Performance

- **Auto-scaling**: 1-4 tasks based on CPU utilization (target: 70%)
- **Multi-AZ**: High availability across 2 availability zones
- **Caching**: Redis for session management and API responses
- **CDN**: Static assets served via CloudFront (planned)
- **Database**: Read replicas for scaling (production)

## 📝 License

MIT

## 👨‍💻 Author

**Jose Roberts**

Built as a comprehensive full-stack portfolio demonstrating expertise in:
- Modern web development (React, Next.js, TypeScript)
- Backend API development (Python, FastAPI)
- Data engineering and analytics
- Machine learning and NLP
- Cloud infrastructure (AWS)
- DevOps and automation (Terraform, CI/CD)

## 🔗 Links

- **Live Demo**: https://dev.therpiproject.com
- **GitHub**: https://github.com/JoseRoberts87/myPortfolio
- **Architecture Docs**: [docs/architecture.md](./docs/architecture.md)
- **Deployment Guide**: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
