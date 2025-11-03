'use client';

import { useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card } from '@/components/ui';

interface SkillCategory {
  domain: string;
  proficiency: number; // 0-100
  technologies: string[];
  description: string;
}

const skillsData: SkillCategory[] = [
  {
    domain: 'Web Development',
    proficiency: 95,
    technologies: ['React 19', 'Next.js 16', 'TypeScript', 'Tailwind CSS', 'Jest'],
    description: 'Full-stack web applications with modern frameworks and comprehensive testing',
  },
  {
    domain: 'Cloud & DevOps',
    proficiency: 90,
    technologies: ['AWS', 'Terraform', 'Docker', 'ECS Fargate', 'GitHub Actions'],
    description: 'Infrastructure as Code, containerization, and automated CI/CD pipelines',
  },
  {
    domain: 'Data Pipelines',
    proficiency: 85,
    technologies: ['FastAPI', 'PostgreSQL', 'Redis', 'ETL', 'Alembic'],
    description: 'Real-time data ingestion, processing, and storage solutions',
  },
  {
    domain: 'Data Analytics',
    proficiency: 80,
    technologies: ['Pandas', 'SQL', 'Recharts', 'Data Visualization', 'Dashboards'],
    description: 'Interactive dashboards, data visualization, and business intelligence',
  },
  {
    domain: 'Machine Learning',
    proficiency: 75,
    technologies: ['Transformers.js', 'DistilBERT', 'NLP', 'Sentiment Analysis', 'Browser ML'],
    description: 'Client-side ML with NLP, sentiment analysis, and browser-based inference',
  },
  {
    domain: 'Computer Vision',
    proficiency: 80,
    technologies: ['YOLOv8', 'TensorFlow.js', 'MediaPipe', 'COCO-SSD', 'Real-time Detection'],
    description: 'Real-time object and face detection with multiple ML frameworks',
  },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: SkillCategory;
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-900 border border-purple-500/30 rounded-lg p-4 shadow-xl">
        <p className="text-white font-semibold mb-2">{data.domain}</p>
        <p className="text-purple-400 text-sm mb-2">
          Proficiency: {data.proficiency}%
        </p>
        <p className="text-gray-300 text-xs mb-2">{data.description}</p>
        <div className="flex flex-wrap gap-1">
          {data.technologies.map((tech) => (
            <span
              key={tech}
              className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function SkillsMatrix() {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  const handleDomainClick = (domain: string) => {
    setSelectedDomain(selectedDomain === domain ? null : domain);
  };

  const selectedSkill = selectedDomain
    ? skillsData.find((s) => s.domain === selectedDomain)
    : null;

  return (
    <Card variant="elevated" padding="lg">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Skills Matrix</h2>
        <p className="text-gray-400">
          Comprehensive overview of technical expertise across 6 key domains
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Radar Chart */}
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={skillsData}>
              <PolarGrid stroke="#4c1d95" />
              <PolarAngleAxis
                dataKey="domain"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                className="text-xs"
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: '#6b7280', fontSize: 10 }}
              />
              <Radar
                name="Proficiency"
                dataKey="proficiency"
                stroke="#a855f7"
                fill="#a855f7"
                fillOpacity={0.6}
                animationDuration={1000}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Domain Details */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">Domain Breakdown</h3>
          {skillsData.map((skill) => (
            <div
              key={skill.domain}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                selectedDomain === skill.domain
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => handleDomainClick(skill.domain)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white">{skill.domain}</h4>
                <span className="text-purple-400 font-semibold">
                  {skill.proficiency}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-purple-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${skill.proficiency}%` }}
                />
              </div>

              {/* Expanded Details */}
              {selectedDomain === skill.domain && (
                <div className="mt-3 pt-3 border-t border-gray-700 animate-fadeIn">
                  <p className="text-gray-300 text-sm mb-3">
                    {skill.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {skill.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-8 pt-6 border-t border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">
              {skillsData.length}
            </div>
            <div className="text-sm text-gray-400">Technical Domains</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">
              {Math.round(
                skillsData.reduce((sum, s) => sum + s.proficiency, 0) /
                  skillsData.length
              )}
              %
            </div>
            <div className="text-sm text-gray-400">Average Proficiency</div>
          </div>
          <div className="text-center col-span-2 md:col-span-1">
            <div className="text-3xl font-bold text-purple-400">
              {skillsData.reduce((sum, s) => sum + s.technologies.length, 0)}+
            </div>
            <div className="text-sm text-gray-400">Technologies</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
