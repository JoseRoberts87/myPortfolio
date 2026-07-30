import Link from 'next/link';
import { Section, Card, Badge, PageHero } from '@/components/ui';

export const metadata = {
  title: 'Case Studies | Jose Roberts Portfolio',
  description: 'Deep-dive case studies showcasing problem-solving approach, technical decisions, and lessons learned across computer vision, machine learning, and data engineering projects.',
};

interface CaseStudy {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  category: string;
  technologies: string[];
  metrics: {
    label: string;
    value: string;
  }[];
  readTime: string;
}

export default function CaseStudiesPage() {
  const caseStudies: CaseStudy[] = [
    {
      slug: 'agentic-ai-workforce',
      title: 'Agentic AI Workforce',
      subtitle: 'Coordinated LLM Agents that Automate Enterprise Operations',
      description: 'How I designed an agentic workforce on Databricks that automates workflows and manages tasks for a Fortune 500 client — cutting operational errors 30% and bottlenecks 77% while growing their analytics platform 72%.',
      icon: '🧠',
      category: 'AI & Agents',
      technologies: ['Databricks', 'AWS', 'LLMs', 'Agentic AI', 'RAG'],
      metrics: [
        { label: 'Fewer Errors', value: '30%' },
        { label: 'Fewer Bottlenecks', value: '77%' },
        { label: 'Analytics Growth', value: '72%' },
      ],
      readTime: '8 min read',
    },
    {
      slug: 'realtime-iot-platform',
      title: 'Real-Time IoT Data Platform',
      subtitle: 'Event-Driven Architecture for Sub-5-Second IoT at 99.99% Uptime',
      description: 'How I architected a real-time, event-driven API platform for IoT data achieving 99.99% uptime and sub-5-second end-to-end latency — building on predictive-maintenance work that cut equipment downtime 83%.',
      icon: '⚡',
      category: 'Real-Time Systems',
      technologies: ['Event-Driven', 'IoT', 'AWS', 'Streaming', 'Real-Time Analytics'],
      metrics: [
        { label: 'Uptime', value: '99.99%' },
        { label: 'Latency', value: '<5s' },
        { label: 'Less Downtime', value: '83%' },
      ],
      readTime: '9 min read',
    },
    {
      slug: 'energy-forecasting-ml',
      title: 'ML Energy Forecasting',
      subtitle: 'Time-Series Forecasting that Cut Energy Costs by $2M',
      description: 'How I built a machine-learning forecasting model for industrial energy consumption that reduced costs by $2M in a year — on consolidated data pipelines that cut redundancies 80% and project overhead 50%.',
      icon: '📈',
      category: 'Predictive Analytics',
      technologies: ['Time-Series', 'Python', 'Forecasting', 'scikit-learn', 'Data Pipelines'],
      metrics: [
        { label: 'Cost Saved', value: '$2M' },
        { label: 'Less Redundancy', value: '80%' },
        { label: 'Lower Overhead', value: '50%' },
      ],
      readTime: '7 min read',
    },
    {
      slug: 'computer-vision-object-detection',
      title: 'Real-Time Object Detection',
      subtitle: 'Building a Multi-Model Computer Vision System',
      description: 'How I built a real-time object detection system using YOLOv8 and TensorFlow.js, balancing accuracy, performance, and user experience across browser and server-side inference.',
      icon: '👁️',
      category: 'Computer Vision',
      technologies: ['YOLOv8', 'TensorFlow.js', 'FastAPI', 'React', 'WebRTC'],
      metrics: [
        { label: 'Inference Speed', value: '~30 FPS' },
        { label: 'Model Size', value: '6.2 MB' },
        { label: 'Accuracy', value: '89% mAP' },
      ],
      readTime: '8 min read',
    },
    {
      slug: 'nlp-pipeline-architecture',
      title: 'Multi-Model NLP Pipeline',
      subtitle: 'Sentiment Analysis, NER, and Keyword Extraction',
      description: 'Designing and implementing a production-ready NLP pipeline that combines spaCy, DistilBERT, and TF-IDF for comprehensive text analysis with efficient caching and error handling.',
      icon: '🤖',
      category: 'Machine Learning',
      technologies: ['spaCy', 'DistilBERT', 'TF-IDF', 'Redis', 'PostgreSQL'],
      metrics: [
        { label: 'Throughput', value: '1000 docs/min' },
        { label: 'Cache Hit Rate', value: '85%' },
        { label: 'F1 Score', value: '0.91' },
      ],
      readTime: '10 min read',
    },
    {
      slug: 'data-pipeline-orchestration',
      title: 'Multi-Source Data Pipeline',
      subtitle: 'Automated Ingestion, Processing, and Monitoring',
      description: 'Building a scalable data pipeline that ingests from Reddit and News APIs, with automated scheduling, robust error handling, and comprehensive observability.',
      icon: '⚙️',
      category: 'Data Engineering',
      technologies: ['FastAPI', 'PostgreSQL', 'Redis', 'APScheduler', 'Docker'],
      metrics: [
        { label: 'Daily Records', value: '50K+' },
        { label: 'Uptime', value: '99.8%' },
        { label: 'API Latency', value: '<200ms' },
      ],
      readTime: '9 min read',
    },
  ];

  return (
    <div className="min-h-screen pt-16">
      <PageHero
        eyebrow="Case Studies"
        title="Deep-Dive Technical Case Studies"
        tagline="Explore how I approach complex technical problems, make architectural decisions, and learn from real-world implementation challenges."
      >
        <div className="flex flex-wrap justify-center gap-4 text-sm text-faint">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Problem-Solving Approach</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span>Technical Decisions</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Lessons Learned</span>
          </div>
        </div>
      </PageHero>

      {/* Case Studies Grid */}
      <Section padding="xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {caseStudies.map((study) => (
            <Link
              key={study.slug}
              href={`/case-studies/${study.slug}`}
              className="block group"
            >
              <Card variant="bordered" padding="lg" hover>
                {/* Icon and Category */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-5xl">{study.icon}</div>
                  <Badge variant="secondary" size="sm">{study.category}</Badge>
                </div>

                {/* Title and Subtitle */}
                <h2 className="text-2xl font-bold text-foreground mb-2 group-hover:text-purple-400 transition-colors">
                  {study.title}
                </h2>
                <h3 className="text-lg text-accent mb-4 font-medium">
                  {study.subtitle}
                </h3>

                {/* Description */}
                <p className="text-muted mb-6 line-clamp-3">
                  {study.description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {study.technologies.map((tech) => (
                    <Badge key={tech} variant="primary" size="sm">
                      {tech}
                    </Badge>
                  ))}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 mb-6 pb-6 border-b border-subtle">
                  {study.metrics.map((metric) => (
                    <div key={metric.label} className="text-center">
                      <div className="text-lg font-bold text-accent">
                        {metric.value}
                      </div>
                      <div className="text-xs text-faint">
                        {metric.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Read More CTA */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-faint">{study.readTime}</span>
                  <div className="flex items-center gap-2 text-accent font-medium group-hover:gap-3 transition-all">
                    <span>Read Case Study</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </Section>

      {/* CTA Section */}
      <Section padding="lg" background="subtle">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Want to See More?
          </h2>
          <p className="text-muted mb-8 max-w-2xl mx-auto">
            Explore the live implementations of these projects and dive into the interactive demos.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/computer-vision"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              View Live Demos
            </Link>
            <Link
              href="/#contact"
              className="inline-block bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
