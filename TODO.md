# Portfolio Project - Task Tracker

**Last Updated**: 2026-07-27 (Phase 6 - Resume-Aligned Feature Backlog added)

**Phase 1 Status**: ✅ COMPLETE
**Phase 2 Status**: ✅ COMPLETE
**Phase 3 Status**: ✅ COMPLETE

## Current Tech Stack (Installed)

### Frontend
- **Next.js 16.0.0** with App Router (webpack mode for ML compatibility)
- **React 19.2.0** with automatic JSX runtime
- **TypeScript 5.9.3**
- **Tailwind CSS 4.1.16** + **@tailwindcss/postcss 4.1.16** + PostCSS 8.5.6 + Autoprefixer 10.4.21
- **ESLint 9.38.0** + eslint-config-next 16.0.0
- **Jest 29.7.0** + React Testing Library (unit testing framework)
- **Recharts** - Data visualization for analytics
- **TensorFlow.js** + **COCO-SSD** - Object detection
- **MediaPipe** - Face detection
- **@xenova/transformers** - Browser-based ML inference (DistilBERT)

### Backend
- **FastAPI** - Python web framework
- **PostgreSQL 16** - Primary database
- **Redis 7.1** - Caching layer
- **SQLAlchemy** - ORM
- **Alembic** - Database migrations
- **Pytest** - Testing framework
- **PRAW** - Reddit API integration
- **Ultralytics YOLOv8** - Computer vision

⚠️ **Note**: Tailwind CSS v4 has breaking changes. See `docs/TAILWIND_V4_MIGRATION.md` for details.

## Development Workflow

**Branching Strategy**: See `docs/GIT_WORKFLOW.md` for complete details.

### Quick Reference
1. **Create branch** from main: `git checkout -b feature/<feature-name>`
2. **Implement & commit** changes with descriptive messages
3. **Push to GitHub**: `git push -u origin feature/<feature-name>`
4. **Wait for PR creation** - User will create and review PR
5. **Address feedback** - Make changes in same branch and push
6. **After merge** - Pull main and delete local branch

**Branch Types**:
- `feature/<name>` - New features
- `bugfix/<name>` - Bug fixes
- `refactor/<name>` - Code refactoring
- `docs/<name>` - Documentation updates

---

## Phase 1: Project Setup & Web Development Foundation

### ✅ Completed Tasks

- [x] Create PROJECT_PLAN.md with skills outline and execution plan
- [x] Create DECISIONS.md for tracking key decisions
- [x] Answer and finalize key decisions
- [x] Initialize Next.js project with TypeScript
- [x] Configure Tailwind CSS and base styling
- [x] Set up project structure and folder organization
- [x] Test Next.js development server
- [x] Create project README
- [x] Make initial Git commit
- [x] Create navigation components (Header, Footer)
- [x] Build enhanced landing page with hero section
- [x] Implement responsive design across all breakpoints
- [x] Add smooth scrolling behavior
- [x] Configure Jest and React Testing Library
- [x] Write comprehensive unit tests (200 tests, 100% passing)
- [x] Fix accessibility bug (aria-expanded attribute)
- [x] Add routing structure for showcase sections
- [x] Create reusable UI component library
- [x] Implement dark/light mode toggle

### 🔄 In Progress

_No tasks currently in progress_

### 📋 Pending Tasks

_Phase 1 complete! All planned tasks finished._

---

## Phase 2: Data Pipeline + Analytics + ML ✅ COMPLETE

### Social Media Data Pipeline ✅
- [x] Set up FastAPI backend project structure
- [x] Create Reddit API integration
- [x] Create Twitter/X API integration (deferred - Reddit sufficient)
- [x] Build ETL pipeline for social media data
- [x] Set up PostgreSQL database with SQLAlchemy
- [x] Create data models and schemas
- [x] Implement data validation and quality checks
- [x] Build real-time data ingestion system
- [x] Create pipeline monitoring dashboard
- [x] Add error handling and logging

### Data Analytics Dashboard ✅
- [x] Design analytics page layout
- [x] Implement data visualization library (Recharts)
- [x] Create metrics cards for KPIs
- [x] Build interactive filtering system
- [x] Add date range selection (7/14/30/60/90 days)
- [x] Create time-series visualizations
- [x] Implement sentiment trend charts
- [x] Add data export functionality (tables with sorting)
- [x] Build drill-down capabilities (subreddit filtering)
- [x] Add real-time data updates (with caching)

### Machine Learning - Sentiment Analysis ✅
- [x] Research and select sentiment analysis model (DistilBERT SST-2)
- [x] Set up browser-based ML environment (Transformers.js)
- [x] Use pre-trained model (Stanford Sentiment Treebank)
- [x] Implement client-side model inference (no server required)
- [x] Build interactive UI for sentiment predictions
- [x] Display model metrics and performance charts
- [x] Add feature importance visualization (word clouds)
- [x] Create word clouds for sentiment analysis (custom component)
- [x] Add live predictions on real Reddit data
- [x] Create comprehensive ML page with technical details

---

## Phase 3: Computer Vision ✅ COMPLETE

### Real-time Object Detection ✅
- [x] Research YOLO vs TensorFlow.js approach (implemented both!)
- [x] Set up computer vision environment
- [x] Integrate pre-trained object detection models (COCO-SSD, YOLOv8, MediaPipe)
- [x] Build webcam integration component (ObjectDetector, FaceDetector)
- [x] Create real-time video processing pipeline
- [x] Implement bounding box visualization
- [x] Add confidence score display
- [x] Create FPS counter
- [x] Add detection on/off toggle
- [x] Implement model information display
- [x] Add image file upload capability (YOLOv8 via backend)
- [x] Optimize performance for real-time processing (~30 FPS)

---

## Phase 4: Additional Features (Future)

### Critical Priority - Employer Impact ⭐⭐⭐⭐⭐
- [x] **GitHub Integration** ✅ (CRITICAL - proves active development)
  - [x] Live GitHub contribution graph (GitHubContributions component)
  - [x] Pinned repositories with stars/forks (GitHubRepos component)
  - [x] Recent activity feed (GitHubActivity component)
  - [x] Total commits, PRs, issues closed stats (GitHubStats component)
  - [x] Language breakdown visualization (GitHubLanguages component)
  - [x] Link to profile and individual repos (links throughout page)

- [ ] **Project Case Studies Pages** (CRITICAL - demonstrates problem-solving)
  - [ ] Computer Vision case study (problem, solution, results, trade-offs)
  - [ ] Machine Learning case study (model selection, optimization, deployment)
  - [ ] Data Pipeline case study (architecture, challenges, performance)
  - [ ] Include: Problem Statement, Technical Challenges, Architecture Decisions, Results/Impact, Lessons Learned
  - [ ] Add "View Case Study" buttons to each expertise card

- [ ] **About Me / Professional Story Page** (CRITICAL - humanizes portfolio)
  - [ ] Career journey and background
  - [ ] What drives you technically
  - [ ] Career goals and interests
  - [ ] Problem-solving philosophy
  - [ ] Personal hobbies that relate to development

### High Priority - Technical Credibility ⭐⭐⭐⭐
- [x] Create skills matrix/radar chart visualization
- [x] Add resume download functionality (PDF)
- [x] Build contact form with validation
- [x] Add form submission backend
- [x] Create CLAUDE.md documentation for AI assistants

- [ ] **Live System Metrics Dashboard** (proves operational excellence)
  - [ ] Real-time API response times
  - [ ] Database query performance
  - [ ] Cache hit rates
  - [ ] Error rates (last 24h)
  - [ ] Request volume graphs
  - [ ] System uptime percentage

- [ ] **Performance Optimization Showcase**
  - [ ] Lighthouse scores (aim for 95+) with before/after
  - [ ] Core Web Vitals visualization
  - [ ] Bundle size optimization results
  - [ ] Image optimization examples
  - [ ] Code splitting strategy documentation
  - [ ] Performance metrics page

- [ ] **Interactive Architecture Diagram**
  - [ ] Clickable system architecture
  - [ ] Show data flow on hover
  - [ ] Highlight tech stack per component
  - [ ] Link to relevant code/docs

### Medium Priority - Social Proof ⭐⭐⭐
- [x] Create timeline/experience section
- [x] Add profile image to hero section

- [ ] **LinkedIn & Social Integration**
  - [ ] LinkedIn recommendations section (2-3 strongest)
  - [ ] LinkedIn profile link with preview
  - [ ] Open source contributions showcase
  - [ ] Conference talks or blog posts (if applicable)
  - [ ] Certifications display (AWS, etc.)

- [ ] **Testimonials Section**
  - [ ] Client/colleague recommendations
  - [ ] Project feedback
  - [ ] GitHub stars/community feedback

### Low Priority - Content & Engagement ⭐⭐
- [ ] Set up blog/articles section (technical writing showcase)
- [ ] Build interactive coding playground
- [ ] Add code examples/snippets section

### Quick Wins - Polish & UX 🚀
- [ ] Add "View Source" buttons linking to GitHub code for each feature
- [ ] Add "Schedule a Call" CTA (Calendly integration)
- [ ] SEO optimization (LinkedIn/social preview cards)
- [ ] Build status badges (CI/CD passing indicators)
- [ ] Professional loading states (skeleton screens)
- [ ] Error boundary improvements (graceful error handling)
- [x] Mobile experience polish (test all features)
- [ ] Add accessibility audit results
- [ ] Cross-browser compatibility testing

---

## Phase 5: AWS Migration & Cloud Infrastructure ✅ MOSTLY COMPLETE

### Infrastructure Setup ✅
- [x] Design AWS architecture diagram (docs/architecture.md with mermaid diagram)
- [x] Set up AWS account and configure IAM
- [x] Create Infrastructure as Code (Terraform with 9 modules, 66+ resources)
- [x] Set up VPC, subnets, and security groups (Multi-AZ: us-east-1a/1b)
- [x] Configure Route 53 for DNS (dev.therpiproject.com)
- [x] Set up SSL certificates (ACM with DNS validation)

### Database Migration ⚠️ PARTIAL
- [x] Create RDS PostgreSQL instance (db.t4g.micro dev, Multi-AZ prod)
- [x] Migrate database schema (Alembic migrations automated)
- [ ] Transfer production data from Railway to RDS (dev uses Railway)
- [x] Test database connectivity (ECS tasks connect to RDS)
- [x] Update connection strings (environment-specific)

### Backend Deployment ✅
- [x] Create ECS Fargate cluster (serverless container orchestration)
- [x] Deploy FastAPI backend (via GitHub Actions CI/CD)
- [x] Configure load balancer (ALB with /api/* path routing)
- [x] Set up auto-scaling (1-4 tasks, 70% CPU target)
- [x] Configure health checks (/health endpoint, circuit breaker)

### Frontend & CDN ⚠️ PARTIAL
- [ ] Set up S3 bucket for static assets (future enhancement)
- [ ] Configure CloudFront distribution (using ALB instead)
- [x] Deploy Next.js to ECS Fargate (256 CPU, 512 MB memory)
- [x] Configure caching strategies (ALB target groups, Redis cache)

### DevOps & Monitoring ✅
- [x] Set up CI/CD pipeline (3 GitHub Actions workflows: terraform/backend/frontend)
- [x] Configure CloudWatch monitoring (logs, metrics, Container Insights)
- [x] Set up log aggregation (30-day retention in CloudWatch Logs)
- [x] Create alerting rules (High CPU >80%, High Memory >80%)
- [x] Implement backup strategies (RDS 7-day, Redis 5-day snapshots)
- [x] Document migration process (DEPLOYMENT.md, architecture.md)

**Current Status**:
- **Dev Environment**: Deployed on Railway (backend) + AWS (infrastructure ready)
- **Prod Environment**: Ready for AWS ECS Fargate deployment
- **Cost**: ~$115-130/month (dev), ~$120-160/month (prod)
- **Architecture**: 9 Terraform modules managing VPC, ECS, RDS, ElastiCache, ALB, Route53, ECR, CloudWatch, Security Groups

---

## Phase 6: Resume-Aligned Feature Backlog (2026-07-27)

Generated from the 2026 resume ("Data & AI Architect", 15+ years) to close gaps between the resume and the live site. Tiers reflect impact on the new positioning. A few items (About page, Certifications, LinkedIn) overlap with Phase 4 stubs — repeated here with resume-specific framing so this backlog is self-contained.

### Tier 1 - Match the "Data & AI Architect" Positioning ⭐⭐⭐⭐⭐
- [ ] **AI Agents / LLM Showcase Page + Live Demo** (biggest gap — resume leads with agentic AI/LLMs; site has none)
  - [ ] New `/ai-agents` (or `/llm`) route + homepage expertise card
  - [ ] Live in-browser demo: RAG chat over portfolio content, a tool-using agent, or GenAI content generation (OpenAI/StabilityAI tie-in)
- [x] **About / Career-Story Page** (also a Phase 4 stub)
  - [x] 15+ year arc: Bank of America → Amazon Robotics → Evonik → Very Technology → MojoTech
  - [x] GTM + business + technical blend; leadership (managed DS/DE teams, trained juniors)
- [ ] **Homepage Impact / Results Metrics Band**
  - [ ] Surface quantified wins: 72% Fortune-500 growth, 90% productivity in 3 weeks, $2M energy savings, 83% downtime reduction, 99.99% uptime / sub-5s IoT latency, "recovered billions"

### Tier 2 - Reflect the Full Stack & Achievements ⭐⭐⭐⭐
- [ ] **Expand Skills Matrix** (`src/components/SkillsMatrix.tsx`)
  - [ ] Add an "AI / LLMs / Agents" domain
  - [ ] Fill missing tech: Java/Spring Boot, Azure (Databricks, Data Factory), Databricks, Kubernetes, Kinesis, MongoDB/MSSQL, Flask/Django
- [ ] **New Case Studies** (`src/app/case-studies/case-studies-data.ts`)
  - [ ] Agentic AI workforce (MojoTech — 30% fewer errors, 77% fewer bottlenecks)
  - [ ] Real-time IoT / event-driven API platform (Very / Amazon Robotics — 99.99% uptime, 83% downtime cut)
  - [ ] ML forecasting for energy ($2M saved — Evonik)
- [ ] **Forecasting / Predictive-Maintenance ML Demo** (ML page is NLP/sentiment only today)
- [ ] **Databricks/Lakehouse + Azure (multi-cloud) content** (Azure currently absent — 0 files)

### Tier 3 - Polish & Recruiter-Facing ⭐⭐⭐
- [ ] **Certifications Section w/ Badges** — Databricks Certified Data Engineer Professional (2026–2028), AWS Solutions Architect – Associate, TinyML (Harvard edX) (also a Phase 4 stub)
- [x] **Contact/Footer: LinkedIn + Location + Availability** — linkedin.com/in/jose-roberts, Providence RI, "Open to Data & AI Architect roles" (also a Phase 4 stub)
- [ ] **Real-time Streaming / Live Dashboard Demo** — WebSocket/SSE live-updating dashboard; makes "99.99% uptime / sub-5s / Kinesis" tangible

---

## Testing & Quality Assurance

- [x] Write unit tests for components (238 tests passing, Jest + React Testing Library)
- [x] Write integration tests for APIs (62 backend tests passing, 54% coverage)
- [x] Add E2E tests (Playwright/Cypress)
- [x] Set up test coverage reporting (Jest for frontend, pytest-cov for backend)
- [ ] Perform accessibility audit
- [ ] Test cross-browser compatibility
- [x] Mobile device testing
- [ ] Performance optimization (Lighthouse)

**Test Stats**:
- **Frontend**: 238 tests passing (16 test suites)
- **Backend**: 62 tests passing (54% code coverage, target: 40%)
- **CI/CD**: Tests run automatically on all GitHub Actions workflows

---

## Documentation

- [x] Write API documentation (Swagger/ReDoc auto-generated)
- [ ] Create component documentation
- [x] Add inline code comments (in progress)
- [x] Create deployment guide (DEPLOYMENT.md)
- [ ] Write contributing guidelines
- [x] Add architecture diagrams (docs/architecture.md)
- [x] Create CLAUDE.md for AI development assistants
- [ ] Create user guide

---

## Notes

- This is a living document - update as tasks are completed or new tasks are identified
- Mark tasks as complete with `[x]` when done
- Add new tasks as they arise
- Keep task descriptions clear and actionable
- Update "Last Updated" date when making changes
