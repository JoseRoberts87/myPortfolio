'use client';

import { Card } from '@/components/ui';

interface TimelineItem {
  id: string;
  title: string;
  organization: string;
  period: string;
  description: string;
  highlights?: string[];
  type: 'experience' | 'education' | 'certification';
}

const experienceData: TimelineItem[] = [
  {
    id: 'exp-1',
    title: 'Senior Full-Stack Engineer',
    organization: 'Tech Company',
    period: '2020 - Present',
    description: 'Leading full-stack development initiatives for enterprise-scale applications.',
    highlights: [
      'Architected and deployed cloud-native applications on AWS using ECS Fargate and Terraform',
      'Built data pipelines processing millions of records with Python, FastAPI, and PostgreSQL',
      'Developed modern web applications using React, Next.js, and TypeScript',
      'Implemented CI/CD pipelines and infrastructure as code for automated deployments',
    ],
    type: 'experience',
  },
  {
    id: 'exp-2',
    title: 'Full-Stack Developer',
    organization: 'Software Solutions Inc.',
    period: '2018 - 2020',
    description: 'Developed and maintained web applications and data processing systems.',
    highlights: [
      'Created RESTful APIs and microservices using Python and Node.js',
      'Built responsive front-end interfaces with React and modern CSS frameworks',
      'Optimized database queries and implemented caching strategies',
      'Collaborated with cross-functional teams in Agile environment',
    ],
    type: 'experience',
  },
];

const educationData: TimelineItem[] = [
  {
    id: 'edu-1',
    title: 'Bachelor of Science in Computer Science',
    organization: 'University Name',
    period: '2014 - 2018',
    description: 'Focused on software engineering, algorithms, and data structures.',
    highlights: [
      'GPA: 3.8/4.0',
      'Dean\'s List: Multiple semesters',
      'Senior Project: Machine Learning based recommendation system',
    ],
    type: 'education',
  },
  {
    id: 'cert-1',
    title: 'AWS Certified Solutions Architect',
    organization: 'Amazon Web Services',
    period: '2021',
    description: 'Professional certification for designing distributed systems on AWS.',
    type: 'certification',
  },
  {
    id: 'cert-2',
    title: 'Professional Scrum Master (PSM I)',
    organization: 'Scrum.org',
    period: '2020',
    description: 'Certification in Agile methodologies and Scrum framework.',
    type: 'certification',
  },
];

interface TimelineProps {
  variant?: 'experience' | 'education' | 'all';
}

export default function Timeline({ variant = 'all' }: TimelineProps) {
  const getItemsToDisplay = () => {
    if (variant === 'experience') return experienceData;
    if (variant === 'education') return educationData;
    return [...experienceData, ...educationData];
  };

  const items = getItemsToDisplay();

  const getIconForType = (type: string) => {
    switch (type) {
      case 'experience':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
          </svg>
        );
      case 'education':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
          </svg>
        );
      case 'certification':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Experience Section */}
      {(variant === 'all' || variant === 'experience') && (
        <div>
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Professional Experience
          </h2>
          <div className="space-y-8">
            {experienceData.map((item, index) => (
              <div key={item.id} className="relative">
                {/* Timeline line (hidden on mobile) */}
                {index !== experienceData.length - 1 && (
                  <div className="hidden md:block absolute left-1/2 top-20 bottom-0 w-0.5 bg-purple-500/30 -translate-x-1/2"></div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  {/* Left side */}
                  <div className={index % 2 === 0 ? 'md:text-right' : 'md:order-2'}>
                    <div className="md:inline-block">
                      <span className="inline-block px-4 py-2 bg-purple-900/50 text-purple-300 rounded-full text-sm font-medium mb-4">
                        {item.period}
                      </span>
                    </div>
                  </div>

                  {/* Timeline dot */}
                  <div className="hidden md:block absolute left-1/2 top-6 -translate-x-1/2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-white shadow-lg">
                      {getIconForType(item.type)}
                    </div>
                  </div>

                  {/* Right side */}
                  <div className={index % 2 === 0 ? '' : 'md:order-1'}>
                    <Card variant="elevated" padding="lg">
                      <div className="flex items-start gap-4 mb-4 md:hidden">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-white flex-shrink-0">
                          {getIconForType(item.type)}
                        </div>
                        <div>
                          <span className="inline-block px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-xs font-medium">
                            {item.period}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-lg text-purple-400 mb-3">{item.organization}</p>
                      <p className="text-gray-300 mb-4">{item.description}</p>

                      {item.highlights && item.highlights.length > 0 && (
                        <ul className="space-y-2">
                          {item.highlights.map((highlight, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                              <svg
                                className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </Card>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education & Certifications Section */}
      {(variant === 'all' || variant === 'education') && (
        <div className="mt-16">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Education & Certifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {educationData.map((item) => (
              <Card key={item.id} variant="elevated" padding="lg">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-white flex-shrink-0">
                    {getIconForType(item.type)}
                  </div>
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-xs font-medium">
                      {item.period}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-purple-400 mb-3 font-medium">{item.organization}</p>
                <p className="text-sm text-gray-300 mb-3">{item.description}</p>

                {item.highlights && item.highlights.length > 0 && (
                  <ul className="space-y-1">
                    {item.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-gray-400">
                        <svg
                          className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
