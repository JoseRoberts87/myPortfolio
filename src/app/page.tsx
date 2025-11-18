import ContactForm from '@/components/ContactForm';
import SkillsMatrix from '@/components/SkillsMatrix';
import ResumeDownload from '@/components/ResumeDownload';
import Timeline from '@/components/Timeline';
import VisitStats from '@/components/VisitStats';
import Image from 'next/image';

export default function Home() {
  const expertiseAreas = [
    {
      id: 'web-dev',
      title: 'Web Development',
      description: 'Modern full-stack applications with Next.js, React, and TypeScript',
      icon: '🌐',
      link: '/web-dev',
    },
    {
      id: 'data-pipelines',
      title: 'Data Pipelines',
      description: 'ETL and data processing with Python, FastAPI, and PostgreSQL',
      icon: '⚙️',
      link: '/data-pipelines',
    },
    {
      id: 'analytics',
      title: 'Data Analytics',
      description: 'Interactive dashboards and data visualizations',
      icon: '📊',
      link: '/analytics',
    },
    {
      id: 'machine-learning',
      title: 'Machine Learning',
      description: 'NLP and sentiment analysis with modern ML frameworks',
      icon: '🤖',
      link: '/machine-learning',
    },
    {
      id: 'computer-vision',
      title: 'Computer Vision',
      description: 'Real-time object detection and image processing',
      icon: '👁️',
      link: '/computer-vision',
    },
    {
      id: 'signal-processing',
      title: 'Signal Processing',
      description: 'Digital signal analysis, FFT, and audio processing',
      icon: '📡',
      link: '/signal-processing',
    },
    {
      id: 'cloud-devops',
      title: 'Cloud & DevOps',
      description: 'AWS infrastructure, Docker, and CI/CD pipelines',
      icon: '☁️',
      link: '/cloud-devops',
    },
  ];

  return (
    <>
      {/* Visit Statistics Widget */}
      <VisitStats />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Profile Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full blur-2xl opacity-30"></div>
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-purple-500/50 shadow-2xl">
                  <Image
                    src="/profile-photo.png"
                    alt="Jose Roberts - Full-Stack Developer"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Right side - Content */}
            <div className="text-center lg:text-left space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white animate-fade-in">
                Jose Roberts
              </h1>
              <h2 className="text-3xl md:text-4xl font-semibold text-purple-400">
                Senior Software Engineer
              </h2>
              <p className="text-xl md:text-2xl text-gray-300">
                Showcasing expertise across multiple domains
              </p>
              <p className="text-lg text-gray-400 max-w-2xl">
                Building modern web applications, data pipelines, ML models, and cloud infrastructure
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 lg:justify-start justify-center">
                <a
                  href="#web-dev"
                  className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                >
                  Explore My Work
                </a>
                <a
                  href="/Jose-Roberts-Resume.pdf"
                  download="Jose-Roberts-Resume.pdf"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-purple-900 font-semibold px-8 py-3 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download Resume
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise Areas */}
      <section className="bg-slate-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Areas of Expertise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {expertiseAreas.map((area) => (
              <a
                key={area.id}
                id={area.id}
                href={area.link}
                className="block bg-slate-900 border border-slate-700 p-8 rounded-lg hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all scroll-mt-24 group cursor-pointer"
              >
                <div className="text-4xl mb-4">{area.icon}</div>
                <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-purple-400 transition-colors">{area.title}</h3>
                <p className="text-gray-400 mb-6">{area.description}</p>
                <div className="flex items-center gap-2 text-purple-400 text-sm font-medium group-hover:gap-3 transition-all">
                  <span>View Details</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Deep-Dive Case Studies
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Explore detailed case studies showcasing my problem-solving approach, technical decisions, and lessons learned
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <a
              href="/case-studies/computer-vision-object-detection"
              className="block bg-slate-800 border border-slate-700 p-8 rounded-lg hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all group"
            >
              <div className="text-5xl mb-4">👁️</div>
              <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-purple-400 transition-colors">
                Real-Time Object Detection
              </h3>
              <p className="text-gray-400 mb-4">
                Building a multi-model computer vision system with YOLOv8 and TensorFlow.js
              </p>
              <div className="flex items-center gap-2 text-purple-400 text-sm font-medium group-hover:gap-3 transition-all">
                <span>Read Case Study</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>

            <a
              href="/case-studies/nlp-pipeline-architecture"
              className="block bg-slate-800 border border-slate-700 p-8 rounded-lg hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all group"
            >
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-purple-400 transition-colors">
                Multi-Model NLP Pipeline
              </h3>
              <p className="text-gray-400 mb-4">
                Sentiment analysis, NER, and keyword extraction with production-grade error handling
              </p>
              <div className="flex items-center gap-2 text-purple-400 text-sm font-medium group-hover:gap-3 transition-all">
                <span>Read Case Study</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>

            <a
              href="/case-studies/data-pipeline-orchestration"
              className="block bg-slate-800 border border-slate-700 p-8 rounded-lg hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all group"
            >
              <div className="text-5xl mb-4">⚙️</div>
              <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-purple-400 transition-colors">
                Multi-Source Data Pipeline
              </h3>
              <p className="text-gray-400 mb-4">
                Automated ingestion from multiple APIs with robust error handling and observability
              </p>
              <div className="flex items-center gap-2 text-purple-400 text-sm font-medium group-hover:gap-3 transition-all">
                <span>Read Case Study</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          </div>

          <div className="text-center">
            <a
              href="/case-studies"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors text-lg group"
            >
              <span>View All Case Studies</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Skills Matrix Section */}
      <section id="skills" className="py-20 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SkillsMatrix />
        </div>
      </section>

      {/* GitHub Activity Preview */}
      <section id="github-preview" className="py-20 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Active Development on GitHub
            </h2>
            <p className="text-xl text-gray-400">
              Explore my open source contributions, repositories, and coding activity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Public Repos */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
              <div className="text-4xl mb-3">📚</div>
              <div className="text-3xl font-bold text-purple-400 mb-2">30+</div>
              <div className="text-gray-400">Public Repositories</div>
            </div>

            {/* Contributions */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
              <div className="text-4xl mb-3">💻</div>
              <div className="text-3xl font-bold text-purple-400 mb-2">500+</div>
              <div className="text-gray-400">Contributions This Year</div>
            </div>

            {/* Languages */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
              <div className="text-4xl mb-3">🔧</div>
              <div className="text-3xl font-bold text-purple-400 mb-2">10+</div>
              <div className="text-gray-400">Programming Languages</div>
            </div>
          </div>

          <div className="text-center">
            <a
              href="/github"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors text-lg group"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <span>View GitHub Activity</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="py-20 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Timeline />
        </div>
      </section>

      {/* Resume Download Section */}
      <section id="resume" className="py-20 bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ResumeDownload />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContactForm />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-900 to-slate-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Interested in working together?
          </h2>
          <p className="text-gray-300 mb-8">
            Feel free to reach out to discuss projects, opportunities, or collaborations.
          </p>
          <a
            href="#contact"
            className="inline-block bg-white text-purple-900 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </>
  );
}
