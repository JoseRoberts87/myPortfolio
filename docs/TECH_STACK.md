# Technology Stack Reference

**Last Updated**: 2025-10-28

This document maintains the exact versions of all packages and technologies used in this portfolio application.

---

## Frontend Stack (Installed & Configured)

### Core Framework
- **Next.js**: 16.0.0
  - App Router with Turbopack
  - React Server Components
  - Automatic code splitting
  - Hot Module Replacement (HMR)

- **React**: 19.2.0
  - Automatic JSX runtime
  - React Server Components support
  - Latest concurrent features

- **React DOM**: 19.2.0
  - Matches React version for rendering

### Language & Type Safety
- **TypeScript**: 5.9.3
  - Strict mode enabled
  - Path aliases configured (`@/*` → `./src/*`)
  - ES2017 target for top-level await support

### Styling
- **Tailwind CSS**: 4.1.16
  - JIT (Just-In-Time) compiler
  - Custom theme configuration
  - Dark mode support via CSS variables
  - ⚠️ v4 Breaking Changes: See `TAILWIND_V4_MIGRATION.md`

- **@tailwindcss/postcss**: 4.1.16
  - **Required for Tailwind CSS v4**
  - Separate PostCSS plugin package (new in v4)

- **PostCSS**: 8.5.6
  - CSS transformation tool
  - Required for Tailwind CSS processing

- **Autoprefixer**: 10.4.21
  - Automatic vendor prefixes

### Code Quality
- **ESLint**: 9.38.0
  - Next.js recommended rules
  - React hooks rules
  - TypeScript integration

- **eslint-config-next**: 16.0.0
  - Next.js specific linting rules
  - Matches Next.js version

### Type Definitions
- **@types/node**: 24.9.1
- **@types/react**: 19.2.2
- **@types/react-dom**: 19.2.2

---

## Backend Stack (Planned)

### Python Backend
- **Python**: 3.11+ (to be installed)
- **FastAPI**: Latest (to be installed)
  - For ML/CV inference endpoints
  - High-performance async API

### Database
- **PostgreSQL**: 15+ (to be provisioned)
- **Prisma**: Latest (to be installed)
  - Type-safe ORM
  - Migrations support
  - Schema management

---

## Data Processing & ML Stack (Planned)

### Data Processing
- **pandas**: Latest
- **numpy**: Latest
- **asyncio**: Built-in (Python 3.11+)

### Machine Learning
- **scikit-learn**: Latest
- **transformers**: Latest (for BERT/RoBERTa)
- **torch** or **tensorflow**: Latest (to be decided)

### Computer Vision
- **opencv-python**: Latest
- **YOLO** (YOLOv8 or similar): Latest
- **TensorFlow.js**: Latest (for browser-based CV)

### Data Visualization
- **Recharts**: Latest (to be installed)
- **D3.js**: v7+ (alternative, to be decided)

---

## API Integrations (Planned)

### Social Media APIs
- **Reddit API** (PRAW): Latest
- **Twitter/X API**: v2 (if accessible)

### Alternative Data Sources
- News APIs
- RSS feeds
- Public datasets

---

## Development Tools

### Package Management
- **npm**: 10+ (via Node.js)
- **pip**: Latest (for Python packages)

### Version Control
- **Git**: 2.40+
- Repository: GitHub

### Build Tools
- **Turbopack**: Included with Next.js 16
- **Webpack**: Fallback option

---

## Deployment Stack

### Phase 1: PaaS Deployment
- **Vercel**: Latest
  - Frontend hosting
  - Automatic deployments
  - Edge Functions support

- **Railway**: Latest
  - Backend API hosting
  - PostgreSQL database
  - Environment management

### Phase 2: AWS Migration (Future)
- **AWS EC2**: Latest Amazon Linux 2 or Ubuntu
- **AWS RDS**: PostgreSQL 15+
- **AWS S3**: Latest
- **AWS CloudFront**: Latest
- **AWS Route 53**: Latest

### Infrastructure as Code
- **Terraform**: 1.5+ or **CloudFormation**
- **Docker**: 24+
- **Docker Compose**: 2.20+

### CI/CD
- **GitHub Actions**: Latest
- **AWS CodePipeline**: (for Phase 2)

---

## Browser Support

### Target Browsers
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile browsers: iOS Safari, Chrome Mobile

### JavaScript Target
- **ES2017** (for top-level await)
- Polyfills handled by Next.js

---

## Development Environment

### Required Software
- **Node.js**: 18.17+ or 20+
- **npm**: 9+ or 10+
- **Git**: 2.40+
- **VS Code**: Latest (recommended)

### Recommended VS Code Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)
- GitLens

---

## Notes

- This document is automatically updated when packages are installed or upgraded
- Version numbers reflect the actual installed versions in `package.json`
- "Latest" indicates packages that will be installed at a future phase
- For exact dependency versions, see `package-lock.json`

---

## Version Update Log

**2025-10-28**: Initial setup
- Installed Next.js 16.0.0, React 19.2.0, TypeScript 5.9.3
- Configured Tailwind CSS 4.1.16
- Set up ESLint 9.38.0
