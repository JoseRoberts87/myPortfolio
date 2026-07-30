"""
Curated knowledge base for the "Ask my portfolio" RAG assistant.

Each chunk is a small, self-contained fact about Jose Roberts, authored from
his resume and portfolio. The RAG service embeds these once and retrieves the
most relevant chunks per question. Keep chunks focused and factual — the
assistant answers ONLY from this content.
"""
from typing import Dict, List

KNOWLEDGE_CHUNKS: List[Dict[str, str]] = [
    {
        "id": "overview",
        "title": "Overview",
        "text": (
            "Jose Roberts is a Data & AI Architect based in Providence, Rhode Island, "
            "with over 15 years of technology experience spanning go-to-market strategy, "
            "business needs, and technical solutions. He specializes in AI-first systems, "
            "agentic AI, LLM and generative-AI integration, and scalable data pipelines. "
            "He has implemented AI-first systems that improved decision-making processes "
            "by 90% within three weeks. He is open to Data & AI Architect roles. "
            "Contact: webterpr@gmail.com, LinkedIn linkedin.com/in/jose-roberts, "
            "website therpiproject.com."
        ),
    },
    {
        "id": "mojotech",
        "title": "MojoTech — Data and AI Architect (2026)",
        "text": (
            "MojoTech, Data and AI Architect (January 2026 - July 2026, Providence). "
            "Key architect and builder of robust, scalable data pipelines using Databricks "
            "and AWS, working directly with clients on their AI and data needs. He designed "
            "agentic data ingestion on Databricks for internal visibility into LLM consumption; "
            "built a framework to benchmark AI model performance across tasks for data-driven "
            "model selection; integrated and automated data pipelines and APIs with Databricks "
            "for a Fortune 500 company, enabling AI agents across their work streams and driving "
            "72% growth of their analytics platform; and built an agentic workforce that automated "
            "workflows and managed tasks, reducing operational errors by 30% and bottlenecks by 77%."
        ),
    },
    {
        "id": "very-technology",
        "title": "Very Technology — Manager of Data Science and Data Engineering (2021-2025)",
        "text": (
            "Very Technology, Manager of Data Science and Data Engineering (July 2021 - August 2025, "
            "Remote). He led teams of engineers with product ownership and scalable solutions "
            "integrating LLMs and generative AI. He directed the integration of LLMs and generative "
            "AI into existing systems, improving operational efficiency by 80% in two months; "
            "consulted on the design of an AI-first system that increased data-driven decision-making "
            "and user productivity by 90% in three weeks; developed and deployed an AI agent using a "
            "fine-tuned model for real-time guidance, boosting technician efficiency by 22%; "
            "developed a full-stack AI-driven application for creative marketing content, increasing "
            "user engagement 40% and profits 15% in one month; engineered an event-driven backend for "
            "advanced marketing strategies, boosting sales profits 33% in three months; architected a "
            "real-time API platform achieving 99.99% uptime with sub-5-second end-to-end latency for "
            "IoT data; and managed and grew a team of data scientists and data engineers."
        ),
    },
    {
        "id": "evonik",
        "title": "Evonik Industries — Senior Data Engineer (2019-2021)",
        "text": (
            "Evonik Industries, Senior Data Engineer (January 2019 - July 2021, Mobile, AL). "
            "He created and designed the full lifecycle of data pipelines supporting a niche "
            "data-science segment. He designed and implemented backend system architecture for "
            "data scientists and analysts; implemented a machine-learning forecasting model for "
            "energy consumption that reduced costs by $2M in one year; performed data integration "
            "that reduced redundancies by 80% and project overhead by 50%; and trained junior data "
            "engineers, increasing their readiness by 80%."
        ),
    },
    {
        "id": "amazon-robotics",
        "title": "Amazon Robotics — Data Engineer (2018-2019)",
        "text": (
            "Amazon Robotics, Data Engineer (April 2018 - January 2019, North Reading, MA). "
            "He developed and maintained data pipelines for the Deployment Engineering division. "
            "He trained a predictive-maintenance modeling algorithm that reduced downtime by 83%; "
            "implemented real-time data-processing analytics and monitoring dashboards; redesigned "
            "performance metrics to improve project tracking (Python/AWS); and worked on IoT "
            "optimization of the data backend to automate data collection, reducing costs 10% in "
            "one month."
        ),
    },
    {
        "id": "bank-of-america",
        "title": "Bank of America — Senior Data Engineer / Analyst, AVP (2011-2018)",
        "text": (
            "Bank of America, Senior Data Engineer / Analyst, AVP (February 2011 - April 2018, "
            "Riverside, RI). He participated in business reviews to improve data workflows, "
            "accountability, and usability. He designed and implemented the metadata repository for "
            "the bank's Finance group; engineered data-extraction algorithms integrating disparate "
            "systems (Python/Java); developed RESTful APIs improving data retrieval and capture "
            "(Java/Node.js/REST/JSON/SQL); overhauled processes with algorithms and machine learning "
            "creating 68% efficiency; and used business intelligence and analytics on deposit "
            "accounts, recovering billions of dollars."
        ),
    },
    {
        "id": "education",
        "title": "Education",
        "text": (
            "Jose holds a Master of Science in Computer Science from Colorado Technical University "
            "Online (GPA 3.95, 2016-2017), and a Bachelor of Arts in Political Science from the "
            "University of Rhode Island in Kingston, RI."
        ),
    },
    {
        "id": "certifications",
        "title": "Certifications",
        "text": (
            "Certifications: Databricks Certified Data Engineer Professional (May 2026 - May 2028); "
            "AWS Certified Solutions Architect - Associate; and TinyML Certification from "
            "Harvard edX."
        ),
    },
    {
        "id": "skills",
        "title": "Technical Skills",
        "text": (
            "Programming languages: Java, JavaScript, Python 3. "
            "Frameworks: Flask, FastAPI, Django, React, Vite, Next.js, Spring Boot. "
            "Databases: MongoDB, MSSQL, MySQL, PostgreSQL. "
            "Cloud platforms: AWS, Databricks, GCP, and Microsoft Azure (Data Factory). "
            "DevOps and containerization: CI/CD pipelines, Docker, Kubernetes, Terraform. "
            "AI and ML: Generative AI, LLMs, OpenAI, agentic AI, RAG, time-series forecasting, "
            "NLP, and computer vision. Deep AWS, Python, and Spark experience. "
            "Practices: Agile/Scrum, Test-Driven Development, and unit testing. "
            "Tools: Git, GitHub, Claude Code, and Cursor."
        ),
    },
    {
        "id": "case-study-cv",
        "title": "Case Study — Real-Time Object Detection",
        "text": (
            "A multi-model computer-vision system using YOLOv8 and TensorFlow.js that runs object "
            "detection entirely in the browser at roughly 30 FPS with a 6.2 MB model, demonstrating "
            "real-time edge inference without a server round-trip."
        ),
    },
    {
        "id": "case-study-nlp",
        "title": "Case Study — Multi-Model NLP Pipeline",
        "text": (
            "A production NLP pipeline combining sentiment analysis, named-entity recognition, and "
            "keyword extraction with robust error handling, built with spaCy, DistilBERT, and TF-IDF "
            "and processing roughly 1000 documents per minute."
        ),
    },
    {
        "id": "case-study-forecasting",
        "title": "Demo — Predictive-Maintenance Forecasting",
        "text": (
            "An interactive, browser-based time-series forecasting demo for predictive maintenance: "
            "it uses Holt's double exponential smoothing to project sensor degradation, plots a 95% "
            "confidence cone against a failure threshold, and estimates remaining useful life — the "
            "same approach behind Jose's 83% downtime reduction at Amazon Robotics and $2M energy "
            "savings at Evonik."
        ),
    },
    {
        "id": "portfolio-stack",
        "title": "About This Portfolio",
        "text": (
            "This portfolio site is itself a full-stack application: a Next.js 16, React 19, "
            "TypeScript, and Tailwind frontend on Vercel; a FastAPI (Python) backend with PostgreSQL "
            "and Redis on Railway; and AWS infrastructure managed with Terraform. It showcases web "
            "development, data pipelines, analytics, machine learning, computer vision, signal "
            "processing, and cloud/DevOps. This chat assistant is a retrieval-augmented generation "
            "(RAG) demo that runs on a local Ollama model in development and OpenAI in production."
        ),
    },
]
