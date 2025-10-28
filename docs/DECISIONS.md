# Key Decisions for Portfolio Application

**Last Updated**: 2025-10-28
**Status**: Pending Review

---

## 1. Tech Stack Preference

**Question**: Which technology stack should we use for the application?

**Recommended Option**:
- Frontend: Next.js 14+ with TypeScript and Tailwind CSS
- Backend: Next.js API routes (for simpler setup) or FastAPI (Python, for ML/data pipeline integration)
- Database: PostgreSQL with Prisma ORM
- ML/CV: Python (scikit-learn, TensorFlow/PyTorch, OpenCV)
- Data Visualization: Recharts or D3.js
- Deployment: Vercel (frontend) + Railway/Render (backend)

**Alternative Options**:
- Full Python stack (Flask/FastAPI + React separate repos)
- MERN stack (MongoDB, Express, React, Node.js)
- Other preferences?

**Decision**: ✅ DECIDED - Option A (Hybrid Approach)

**Final Stack**:
- Frontend: Next.js 14+ with TypeScript and Tailwind CSS
- Backend: Next.js API routes (for simple backend tasks) + FastAPI (Python, for ML/CV/data processing)
- Database: PostgreSQL with Prisma ORM
- ML/CV: Python (scikit-learn, TensorFlow/PyTorch, OpenCV)
- Data Visualization: Recharts or D3.js
- Deployment: Vercel (frontend) + Railway/Render (backend)

**Rationale**: Hybrid approach leverages Next.js for excellent frontend DX and simple APIs, while FastAPI handles compute-intensive ML/CV operations. Best of both worlds.

---

## 2. Project Scope

**Question**: Should we build a comprehensive MVP covering all areas, or go deep on one area first?

**Option A - Broad MVP**:
- Build basic functionality for all 5 expertise areas
- Get the full application structure in place
- Iterate and enhance each section later
- Pros: Shows breadth of skills quickly
- Cons: May be less impressive in depth initially

**Option B - Deep Dive**:
- Focus on one or two areas first, build them thoroughly
- Add other sections incrementally
- Pros: More polished initial product
- Cons: Takes longer to show all skills

**Decision**: ✅ DECIDED - Option B (Deep Dive)

**Approach**: Focus on one or two areas first and build them thoroughly before adding other sections incrementally.

**Rationale**: A more polished, impressive product in key areas will demonstrate depth of expertise better than surface-level implementations across all areas. Quality over quantity initially.

---

## 3. Data Sources for Pipeline & Analytics

**Question**: What type of data should we use for the data pipeline and analytics sections?

**Options**:
- **Financial Data**: Stock prices, crypto, market trends (APIs: Alpha Vantage, Yahoo Finance, CoinGecko)
- **Social Media**: Twitter/X trends, Reddit data (APIs available)
- **Weather/Environmental**: Climate data, air quality (OpenWeather, NOAA)
- **E-commerce**: Product data, sales analytics (mock or real data)
- **IoT/Sensors**: Simulated sensor data, time-series data
- **Sports/Gaming**: Stats, player performance, match data
- **Other**: Your preference?

**Decision**: ✅ DECIDED - Social Media Data

**Primary Data Source**: Social Media (Twitter/X trends, Reddit data)

**APIs to Use**:
- Reddit API (free, good rate limits)
- Twitter/X API (may require paid tier for extensive access)
- Alternative: News APIs, RSS feeds for trending topics

**Secondary Data Source (optional)**: Can add later if needed

**Rationale**: Social media data is rich for sentiment analysis, trend detection, and real-time analytics. Perfect for showcasing data pipelines, NLP, and interactive dashboards. Aligns well with ML (sentiment analysis) and provides engaging, relatable content.

---

## 4. Machine Learning Model Type

**Question**: Which ML problem would best showcase your skills?

**Options**:
- **NLP - Sentiment Analysis**: Analyze text sentiment from reviews, tweets, etc.
- **Time Series Prediction**: Stock price, demand forecasting, trend prediction
- **Recommendation System**: Product/content recommendations
- **Classification**: Image classification, spam detection, category prediction
- **Clustering/Segmentation**: Customer segmentation, pattern discovery
- **Regression**: Price prediction, score estimation
- **Other**: Your preference?

**Decision**: ✅ DECIDED - NLP Sentiment Analysis

**Model Type**: Natural Language Processing - Sentiment Analysis

**Use Case**: Analyze sentiment of social media posts (Reddit, Twitter/X) to classify as positive, negative, or neutral. Can extend to emotion detection (joy, anger, sadness, etc.)

**Dataset**:
- Training: Pre-trained models (BERT, RoBERTa) or train on labeled sentiment datasets
- Inference: Real-time social media posts from our data pipeline

**Additional Features**:
- Sentiment trends over time
- Sentiment by topic/hashtag
- Word clouds for positive/negative terms
- Entity sentiment (sentiment about specific people, brands, products)

**Rationale**: Perfect alignment with social media data source. Creates a cohesive story: collect social data → process through pipeline → analyze sentiment → visualize insights. Demonstrates end-to-end ML workflow from data to deployment.

---

## 5. Computer Vision Application

**Question**: Which CV demo would be most impressive for your portfolio?

**Options**:
- **Real-time Object Detection**: Webcam-based detection using YOLO or TensorFlow.js
- **Image Classification**: Upload images and classify into categories
- **Facial Recognition/Analysis**: Emotion detection, face detection, age/gender prediction
- **Image Segmentation**: Separate objects from background
- **Style Transfer**: Apply artistic styles to images (Neural Style Transfer)
- **OCR/Text Detection**: Extract text from images
- **Pose Estimation**: Detect human poses in real-time
- **Image Enhancement**: Super-resolution, denoising, colorization
- **Other**: Your preference?

**Decision**: ✅ DECIDED - Real-time Object Detection

**Primary CV Demo**: Real-time Object Detection using webcam/video feed

**Implementation Approach**:
- Use YOLO (You Only Look Once) or TensorFlow.js for browser-based detection
- Detect and label common objects with bounding boxes
- Display confidence scores in real-time
- Option to use pre-trained models (COCO dataset) or custom-trained models

**Features**:
- Live webcam feed with object detection overlay
- FPS counter to show performance
- Toggle detection on/off
- Select different detection models
- Upload video files for detection

**Secondary CV Demo (optional)**: Could add image upload classification as a simpler complementary demo

**Rationale**: Real-time object detection is highly impressive and interactive. Demonstrates strong CV skills, real-time processing capabilities, and model deployment. Very engaging for portfolio visitors.

---

## 6. Deployment Strategy

**Question**: Where should we deploy the application?

**Options**:
- **Vercel** (frontend) + **Railway/Render** (backend + database) - Easy, free tier available
- **AWS** (EC2, S3, RDS) - More control, professional setup
- **Google Cloud Platform** - Good for ML models
- **Heroku** - Simple but limited free tier
- **DigitalOcean** - VPS approach
- **All-in-one Docker** on single VPS

**Decision**: ✅ DECIDED - Phased Deployment Strategy

**Phase 1 (Initial)**: Vercel (frontend) + Railway (backend + database)
- Quick setup and deployment
- Free tiers for development
- Easy CI/CD integration

**Phase 2 (Migration)**: AWS Infrastructure
- EC2 for backend services
- RDS for PostgreSQL database
- S3 for static assets and model storage
- CloudFront for CDN
- Route 53 for DNS
- Optional: ECS/EKS for container orchestration
- Optional: SageMaker for ML model hosting

**Platform**: Start with Vercel + Railway, migrate to AWS

**Rationale**: Start fast with modern PaaS solutions to get the application running quickly. Later migration to AWS demonstrates cloud infrastructure skills, DevOps expertise, and understanding of scalable architecture. The migration itself becomes a showcase-worthy skill demonstration.

---

## 7. Additional Features

**Question**: Are there any additional features or sections you'd like to include?

**Possible Additions**:
- Blog/Articles section
- Contact form
- Resume download
- GitHub integration (show repos, contributions)
- LinkedIn integration
- Testimonials section
- Project case studies
- Interactive coding playground
- Other ideas?

**Decision**: ✅ DECIDED - Add All Features (Future Considerations)

**Features to Add (prioritized for future implementation)**:

**High Priority** (Phase 7-8):
- Skills matrix/radar chart - Visual representation of skill levels
- Resume download - PDF download capability
- GitHub integration - Display repos, contributions, activity graph
- Contact form - Allow visitors to reach out

**Medium Priority** (Post-launch):
- Timeline/Experience section - Career progression visualization
- Project case studies - Deep dives into specific projects beyond the main demos
- LinkedIn integration - Link to profile, show experience

**Low Priority** (Nice-to-have):
- Blog/Articles section - Write about technical topics, showcase writing skills
- Testimonials section - References or recommendations
- Interactive coding playground - Live code editor/demos (could be part of web dev showcase)

**Rationale**: All features add value to a comprehensive portfolio. Prioritizing based on implementation complexity and immediate impact. Skills visualization and GitHub integration complement the technical demos. Blog and testimonials can be added later as content is developed.

---

## 8. Timeline & Priority

**Question**: What's your timeline and what should we prioritize?

**Decision**: ✅ DECIDED - Start with Web Development Foundation

**Implementation Priority**:

**Phase 1 - START HERE: Web Development Foundation** (Current Focus)
- Initialize Next.js project with TypeScript and Tailwind CSS
- Build solid, professional UI/UX foundation
- Create responsive layout and navigation
- Build reusable component library
- Set up routing structure for all future showcase areas
- This serves as the main container app for all other skills demonstrations

**Phase 2: Data Pipeline + Analytics + ML** (After web foundation is solid)
- Social media data pipeline (Reddit/Twitter)
- Interactive analytics dashboard
- Sentiment analysis ML model
- Complete end-to-end data story

**Phase 3: Computer Vision**
- Real-time object detection demo
- Webcam integration

**Phase 4: Additional Features**
- Skills matrix, GitHub integration, contact form, resume download

**Phase 5: AWS Migration & Cloud Infrastructure**
- Migrate from Vercel/Railway to AWS
- Document migration process

**Target Completion Date**: TBD (iterative approach, each phase production-ready before moving on)

**Rationale**: Web development foundation is essential - it's the container for everything else. Building a solid, professional web app first ensures all future features have a polished home. This approach also allows us to deploy early and add features incrementally.

---

## Next Steps

All decisions finalized! Ready to begin implementation:
1. ✅ All key decisions documented
2. ⏭️ Begin Phase 1: Project Setup & Architecture (Web Development Foundation)
3. ⏭️ Initialize Next.js project with TypeScript
4. ⏭️ Set up Git repository and initial commit
5. ⏭️ Start building according to the execution plan in PROJECT_PLAN.md
