'use client';

import { Card } from '@/components/ui';

interface TimelineItemData {
  id: string;
  type: 'work' | 'education' | 'certification' | 'project';
  title: string;
  organization: string;
  location?: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  description: string;
  achievements?: string[];
  technologies?: string[];
  metrics?: {
    label: string;
    value: string;
  }[];
  link?: string;
}

const timelineData: TimelineItemData[] = [
  {
    id: 'current-role',
    type: 'work',
    title: 'Full-Stack Developer',
    organization: 'Portfolio Project',
    location: 'Remote',
    startDate: '2024-01',
    endDate: 'Present',
    current: true,
    description: 'Building a comprehensive portfolio demonstrating expertise across web development, data engineering, machine learning, and cloud infrastructure.',
    achievements: [
      'Architected and deployed production-grade AWS infrastructure using Terraform (66 resources across 9 modules)',
      'Built full-stack application with Next.js 16, React 19, TypeScript, and FastAPI backend',
      'Implemented ML-powered sentiment analysis pipeline processing Reddit data',
      'Established CI/CD pipelines with GitHub Actions for automated testing and deployment',
      'Achieved 85%+ test coverage with comprehensive test suite',
    ],
    technologies: [
      'Next.js',
      'React',
      'TypeScript',
      'Python',
      'FastAPI',
      'PostgreSQL',
      'Redis',
      'AWS',
      'Docker',
      'Terraform',
    ],
    metrics: [
      { label: 'Infrastructure Resources', value: '66' },
      { label: 'Test Coverage', value: '85%+' },
      { label: 'Availability', value: '99.9%' },
    ],
  },
  {
    id: 'previous-experience-1',
    type: 'work',
    title: 'Software Engineer',
    organization: 'Tech Company',
    location: 'San Francisco, CA',
    startDate: '2021-06',
    endDate: '2023-12',
    description: 'Developed and maintained web applications and data pipelines for enterprise clients.',
    achievements: [
      'Led migration of monolithic application to microservices architecture',
      'Reduced API response times by 60% through optimization and caching strategies',
      'Mentored 3 junior developers in best practices and code review',
      'Implemented automated testing framework increasing code coverage from 40% to 80%',
    ],
    technologies: ['React', 'Node.js', 'Python', 'PostgreSQL', 'Docker', 'AWS'],
    metrics: [
      { label: 'Performance Improvement', value: '60%' },
      { label: 'Code Coverage Increase', value: '40% → 80%' },
    ],
  },
  {
    id: 'education-bs',
    type: 'education',
    title: 'Bachelor of Science in Computer Science',
    organization: 'University Name',
    location: 'Location',
    startDate: '2017-09',
    endDate: '2021-05',
    description: 'Focused on software engineering, data structures, algorithms, and machine learning.',
    achievements: [
      'GPA: 3.8/4.0',
      'Dean\'s List: 6 semesters',
      'Senior Project: Built ML-powered recommendation system',
    ],
    technologies: ['Python', 'Java', 'C++', 'SQL', 'Machine Learning', 'Data Structures'],
  },
  {
    id: 'cert-aws',
    type: 'certification',
    title: 'AWS Certified Solutions Architect',
    organization: 'Amazon Web Services',
    startDate: '2023-06',
    endDate: '2026-06',
    description: 'Demonstrated expertise in designing distributed systems on AWS.',
  },
  {
    id: 'cert-terraform',
    type: 'certification',
    title: 'HashiCorp Certified: Terraform Associate',
    organization: 'HashiCorp',
    startDate: '2023-03',
    endDate: '2026-03',
    description: 'Validated skills in infrastructure as code using Terraform.',
  },
];

interface TimelineItemProps {
  item: TimelineItemData;
  index: number;
}

function TimelineItem({ item, index }: TimelineItemProps) {
  const typeIcons = {
    work: '💼',
    education: '🎓',
    certification: '📜',
    project: '🚀',
  };

  const typeColors = {
    work: 'border-purple-500',
    education: 'border-blue-500',
    certification: 'border-green-500',
    project: 'border-orange-500',
  };

  const typeBgColors = {
    work: 'bg-purple-500/10',
    education: 'bg-blue-500/10',
    certification: 'bg-green-500/10',
    project: 'bg-orange-500/10',
  };

  const formatDate = (date: string) => {
    if (date === 'Present') return 'Present';
    const [year, month] = date.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div className="relative pl-8 pb-12 last:pb-0">
      {/* Timeline line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-700" />

      {/* Timeline dot */}
      <div
        className={`absolute left-[-7px] top-1 w-4 h-4 rounded-full border-2 ${typeColors[item.type]} ${typeBgColors[item.type]}`}
      />

      <Card variant="elevated" padding="lg" className="hover:border-purple-500/50 transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <span className="text-3xl">{typeIcons[item.type]}</span>
            <div>
              <h3 className="text-xl font-bold text-white">{item.title}</h3>
              <p className="text-purple-400 font-medium">{item.organization}</p>
              {item.location && <p className="text-gray-500 text-sm">{item.location}</p>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">
              {formatDate(item.startDate)} - {formatDate(item.endDate)}
            </p>
            {item.current && (
              <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold text-green-400 bg-green-500/10 rounded">
                Current
              </span>
            )}
          </div>
        </div>

        <p className="text-gray-300 mb-4">{item.description}</p>

        {item.achievements && item.achievements.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-white mb-2">Key Achievements</h4>
            <ul className="space-y-1">
              {item.achievements.map((achievement, idx) => (
                <li key={idx} className="text-sm text-gray-400 flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {item.metrics && item.metrics.length > 0 && (
          <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            {item.metrics.map((metric, idx) => (
              <div key={idx} className="bg-slate-900/50 p-3 rounded">
                <p className="text-xs text-gray-500 mb-1">{metric.label}</p>
                <p className="text-lg font-bold text-purple-400">{metric.value}</p>
              </div>
            ))}
          </div>
        )}

        {item.technologies && item.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.technologies.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 text-xs font-medium text-gray-300 bg-slate-700/50 rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default function Timeline() {
  const workExperience = timelineData.filter((item) => item.type === 'work');
  const education = timelineData.filter((item) => item.type === 'education');
  const certifications = timelineData.filter((item) => item.type === 'certification');

  return (
    <section className="py-20 bg-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Experience & Education
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            My professional journey, academic background, and continuous learning
          </p>
        </div>

        {/* Work Experience */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
            <span>💼</span>
            Work Experience
          </h3>
          <div className="space-y-0">
            {workExperience.map((item, index) => (
              <TimelineItem key={item.id} item={item} index={index} />
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
            <span>🎓</span>
            Education
          </h3>
          <div className="space-y-0">
            {education.map((item, index) => (
              <TimelineItem key={item.id} item={item} index={index} />
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
            <span>📜</span>
            Certifications
          </h3>
          <div className="space-y-0">
            {certifications.map((item, index) => (
              <TimelineItem key={item.id} item={item} index={index} />
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-400 mb-2">7+</div>
            <div className="text-gray-400 text-sm">Years Experience</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">15+</div>
            <div className="text-gray-400 text-sm">Projects Completed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">3</div>
            <div className="text-gray-400 text-sm">Certifications</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-400 mb-2">100%</div>
            <div className="text-gray-400 text-sm">Commitment</div>
          </div>
        </div>
      </div>
    </section>
  );
}
