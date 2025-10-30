import ContactForm from '@/components/ContactForm';
import SkillsMatrix from '@/components/SkillsMatrix';
import ResumeDownload from '@/components/ResumeDownload';

export default function Home() {
  const expertiseAreas = [
    {
      id: 'web-dev',
      title: 'Web Development',
      description: 'Modern full-stack applications with Next.js, React, and TypeScript',
      icon: '🌐',
    },
    {
      id: 'data-pipelines',
      title: 'Data Pipelines',
      description: 'ETL and data processing with Python, FastAPI, and PostgreSQL',
      icon: '⚙️',
    },
    {
      id: 'analytics',
      title: 'Data Analytics',
      description: 'Interactive dashboards and data visualizations',
      icon: '📊',
    },
    {
      id: 'machine-learning',
      title: 'Machine Learning',
      description: 'NLP and sentiment analysis with modern ML frameworks',
      icon: '🤖',
    },
    {
      id: 'computer-vision',
      title: 'Computer Vision',
      description: 'Real-time object detection and image processing',
      icon: '👁️',
    },
    {
      id: 'cloud-devops',
      title: 'Cloud & DevOps',
      description: 'AWS infrastructure, Docker, and CI/CD pipelines',
      icon: '☁️',
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center space-y-6 p-8 max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold text-white animate-fade-in">
            Full-Stack Developer
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300">
            Showcasing expertise across multiple domains
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Building modern web applications, data pipelines, ML models, and cloud infrastructure
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#web-dev"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Explore My Work
            </a>
            <a
              href="/Jose-Roberts-Resume.pdf"
              download="Jose-Roberts-Resume.pdf"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-purple-900 font-semibold px-8 py-3 rounded-lg transition-colors"
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
      </section>

      {/* Expertise Areas */}
      <section className="bg-slate-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Areas of Expertise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {expertiseAreas.map((area) => (
              <div
                key={area.id}
                id={area.id}
                className="bg-slate-900 border border-slate-700 p-8 rounded-lg hover:border-purple-500 transition-all scroll-mt-24"
              >
                <div className="text-4xl mb-4">{area.icon}</div>
                <h3 className="text-2xl font-semibold text-white mb-3">{area.title}</h3>
                <p className="text-gray-400">{area.description}</p>
                <div className="mt-6">
                  <span className="text-purple-400 text-sm font-medium">Coming Soon</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Matrix Section */}
      <section id="skills" className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SkillsMatrix />
        </div>
      </section>

      {/* Resume Download Section */}
      <section id="resume" className="py-20 bg-slate-800">
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
