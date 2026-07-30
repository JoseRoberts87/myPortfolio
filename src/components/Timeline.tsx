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
    title: 'Data and AI Architect',
    organization: 'MojoTech',
    period: 'January 2026 - July 2026',
    description: 'Key architect and builder of robust, scalable, and efficient data pipelines using Databricks and AWS services, working directly with clients to understand their AI and data needs.',
    highlights: [
      'Designed agentic data ingestion on Databricks to support internal visibility into LLM consumption',
      'Built a framework to benchmark AI model performance across a variety of tasks, enabling data-driven model selection',
      'Integrated and automated data pipelines and APIs with Databricks for a Fortune 500 company, enabling AI agents across their work streams and driving 72% growth of their analytics platform',
      'Developed an agentic workforce that automated workflows and managed tasks, reducing operational errors by 30% and bottlenecks by 77%',
    ],
    type: 'experience',
  },
  {
    id: 'exp-2',
    title: 'Manager of Data Science and Data Engineering',
    organization: 'Very Technology',
    period: 'July 2021 - August 2025',
    description: 'Led teams of engineers emphasizing product ownership and scalable solutions integrating LLMs and generative AI.',
    highlights: [
      'Directed the integration of LLMs and Generative AI into existing systems, improving operational efficiency by 80% in 2 months',
      'Consulted on the design of an AI-first system, increasing data-driven decision-making and user productivity by 90% in 3 weeks',
      'Developed and deployed an AI agent leveraging a fine-tuned model for real-time guidance, boosting technician efficiency by 22%',
      'Developed a full-stack AI-driven application for creative marketing content, increasing user engagement by 40% and profits by 15% in 1 month',
      'Engineered an event-driven backend enabling advanced marketing strategies, boosting sales profits by 33% in 3 months',
      'Architected a real-time API platform achieving 99.99% uptime with sub-5s end-to-end latency for IoT data',
    ],
    type: 'experience',
  },
  {
    id: 'exp-3',
    title: 'Senior Data Engineer',
    organization: 'Evonik Industries',
    period: 'January 2019 - July 2021',
    description: 'Created and designed the full lifecycle of data pipelines to support niche Data Science segment to drive decisions.',
    highlights: [
      'Designed and implemented backend system architecture supporting Data Scientists and Analysts',
      'Implemented machine learning forecasting model for energy consumption, reducing costs by $2M in one year',
      'Performed data integration, reducing redundancies by 80% and decreasing project overhead by 50%',
      'Trained junior Data Engineers, increasing their project readiness and effectiveness by 80%',
    ],
    type: 'experience',
  },
  {
    id: 'exp-4',
    title: 'Data Engineer',
    organization: 'Amazon Robotics',
    period: 'April 2018 - January 2019',
    description: 'Developed and maintained data pipelines used by the Deployment Engineering division of Amazon Robotics.',
    highlights: [
      'Trained predictive modeling algorithm for preventive maintenance, reducing downtime by 83%',
      'Implemented real-time data processing analytics dashboards for Deployment Engineers',
      'Worked on IoT optimization of data backend to automate data collection, reducing costs by 10% in one month',
    ],
    type: 'experience',
  },
  {
    id: 'exp-5',
    title: 'Senior Data Engineer/Analyst - AVP',
    organization: 'Bank of America',
    period: 'February 2011 - April 2018',
    description: 'Participated in business reviews to improve data workflows and increase the accountability and usability of the data.',
    highlights: [
      'Designed and implemented the metadata repository for the Finance group within the Bank',
      'Developed RESTful APIs to improve data retrieval and capture (Java / Node.js / REST / SQL)',
      'Overhauled processes with algorithms and machine learning, creating 68% efficiency gains',
      'Used business intelligence and analytics tools to perform reviews on deposit accounts, recovering billions of dollars',
    ],
    type: 'experience',
  },
];

const educationData: TimelineItem[] = [
  {
    id: 'edu-1',
    title: 'Master of Science in Computer Science',
    organization: 'Colorado Technical University Online',
    period: '2016 - 2017',
    description: 'Advanced studies in computer science, algorithms, and system design.',
    highlights: [
      'GPA: 3.95/4.0',
      'Focus on scalable system architecture and modern development practices',
    ],
    type: 'education',
  },
  {
    id: 'edu-2',
    title: 'Bachelor of Arts in Political Science',
    organization: 'University of Rhode Island',
    period: '2005 - 2009',
    description: 'Undergraduate studies at URI, Kingston RI.',
    type: 'education',
  },
  {
    id: 'cert-1',
    title: 'Databricks Certified Data Engineer Professional',
    organization: 'Databricks',
    period: 'May 2026 - May 2028',
    description: 'Professional certification for building and optimizing production data pipelines on the Databricks Lakehouse Platform.',
    type: 'certification',
  },
  {
    id: 'cert-2',
    title: 'AWS Certified Solutions Architect - Associate',
    organization: 'Amazon Web Services',
    period: 'Certified',
    description: 'Professional certification for designing and implementing distributed systems on AWS.',
    type: 'certification',
  },
  {
    id: 'cert-3',
    title: 'TinyML Certification',
    organization: 'Harvard edX',
    period: 'Certified',
    description: 'Certification in machine learning for embedded systems and edge devices.',
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
          <h2 className="text-4xl font-bold text-foreground text-center mb-12">
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
                      <span className="inline-block px-4 py-2 bg-accent-soft text-accent-strong rounded-full text-sm font-medium mb-4">
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
                          <span className="inline-block px-3 py-1 bg-accent-soft text-accent-strong rounded-full text-xs font-medium">
                            {item.period}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-foreground mb-2">{item.title}</h3>
                      <p className="text-lg text-accent mb-3">{item.organization}</p>
                      <p className="text-body mb-4">{item.description}</p>

                      {item.highlights && item.highlights.length > 0 && (
                        <ul className="space-y-2">
                          {item.highlights.map((highlight, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-muted">
                              <svg
                                className="w-5 h-5 text-accent mt-0.5 flex-shrink-0"
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
          <h2 className="text-4xl font-bold text-foreground text-center mb-12">
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
                    <span className="inline-block px-3 py-1 bg-accent-soft text-accent-strong rounded-full text-xs font-medium">
                      {item.period}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-accent mb-3 font-medium">{item.organization}</p>
                <p className="text-sm text-body mb-3">{item.description}</p>

                {item.highlights && item.highlights.length > 0 && (
                  <ul className="space-y-1">
                    {item.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-muted">
                        <svg
                          className="w-4 h-4 text-accent mt-0.5 flex-shrink-0"
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
