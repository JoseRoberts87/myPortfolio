# Portfolio Application

A comprehensive portfolio showcasing expertise across six key domains: Web Development, Data Pipelines, Data Analytics, Machine Learning, Computer Vision, and Cloud Infrastructure.

## Tech Stack

### Frontend (Implemented)
- **Next.js 16.0.0** - React framework with App Router (Turbopack)
- **React 19.2.0** - Latest React with automatic JSX runtime
- **TypeScript 5.9.3** - Type-safe development
- **Tailwind CSS 4.1.16** - Utility-first styling (⚠️ v4 breaking changes)
- **@tailwindcss/postcss 4.1.16** - PostCSS plugin for Tailwind v4
- **ESLint 9.38.0** - Code quality and linting

### Backend (Planned)
- **FastAPI** - Python 3.11+ backend for ML/CV/data processing
- **PostgreSQL** - Database with Prisma ORM
- **Redis** - Caching layer (optional)

### Deployment
- **Phase 1**: Vercel (frontend) + Railway (backend/database)
- **Phase 2**: AWS (EC2, RDS, S3, CloudFront, Route 53)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
portfolio/
├── docs/                    # Project documentation
│   ├── PROJECT_PLAN.md     # Detailed project plan
│   └── DECISIONS.md        # Key architectural decisions
├── src/
│   ├── app/                # Next.js app directory
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page
│   │   └── globals.css     # Global styles
│   ├── components/         # React components
│   ├── lib/                # Utility functions
│   └── styles/             # Additional styles
├── public/                 # Static assets
└── next.config.ts         # Next.js configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Features (Roadmap)

### Phase 1: Web Development Foundation ✅
- [x] Next.js setup with TypeScript
- [x] Tailwind CSS configuration
- [x] Project structure
- [ ] Navigation components
- [ ] Landing page with hero
- [ ] Responsive layout

### Phase 2: Data Pipeline + Analytics + ML
- [ ] Social media data pipeline (Reddit/Twitter API)
- [ ] Real-time data ingestion
- [ ] Interactive analytics dashboard
- [ ] Sentiment analysis ML model
- [ ] Data visualizations

### Phase 3: Computer Vision
- [ ] Real-time object detection
- [ ] Webcam integration
- [ ] YOLO model deployment

### Phase 4: Additional Features
- [ ] Skills matrix visualization
- [ ] GitHub integration
- [ ] Contact form
- [ ] Resume download
- [ ] Timeline/Experience section

### Phase 5: AWS Migration
- [ ] Infrastructure as Code (Terraform)
- [ ] EC2/ECS deployment
- [ ] RDS database migration
- [ ] S3 + CloudFront CDN
- [ ] CI/CD pipeline

## Documentation

Detailed planning documentation is available in the `/docs` folder:
- [PROJECT_PLAN.md](./docs/PROJECT_PLAN.md) - Complete project plan with execution phases
- [DECISIONS.md](./docs/DECISIONS.md) - Architecture and technology decisions
- [GIT_WORKFLOW.md](./docs/GIT_WORKFLOW.md) - Git branching strategy and workflow
- [TECH_STACK.md](./docs/TECH_STACK.md) - Comprehensive version reference
- [PACKAGE_REFERENCES.md](./docs/PACKAGE_REFERENCES.md) - Official documentation links
- [TAILWIND_V4_MIGRATION.md](./docs/TAILWIND_V4_MIGRATION.md) - Tailwind v4 migration guide

## License

MIT

## Author

Built as a comprehensive skills showcase portfolio.
