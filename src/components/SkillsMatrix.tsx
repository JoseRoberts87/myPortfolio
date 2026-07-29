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
    domain: 'AI / LLMs / Agents',
    proficiency: 92,
    technologies: ['OpenAI', 'LLMs', 'RAG', 'AI Agents', 'Agentic Workflows'],
    description: 'LLM integration and agentic workflows — RAG systems, tool-using agents, and AI-driven automation',
  },
  {
    domain: 'Web Development',
    proficiency: 95,
    technologies: ['React 19', 'Next.js 16', 'TypeScript', 'Java / Spring Boot', 'Flask / Django', 'Jest'],
    description: 'Full-stack applications — React/Next.js frontends with Java/Spring Boot and Python (Flask/Django) backends',
  },
  {
    domain: 'Cloud & DevOps',
    proficiency: 90,
    technologies: ['AWS', 'Azure', 'Terraform', 'Docker', 'Kubernetes', 'GitHub Actions'],
    description: 'Multi-cloud infrastructure as code, containerization and orchestration, and automated CI/CD',
  },
  {
    domain: 'Data Pipelines',
    proficiency: 88,
    technologies: ['Databricks', 'FastAPI', 'Kinesis', 'PostgreSQL', 'MongoDB', 'ETL'],
    description: 'Real-time ingestion and Lakehouse pipelines with Databricks, Kinesis, and FastAPI',
  },
  {
    domain: 'Data Analytics',
    proficiency: 82,
    technologies: ['Pandas', 'SQL', 'MSSQL', 'Recharts', 'Data Visualization', 'Dashboards'],
    description: 'Interactive dashboards, data visualization, and business intelligence across SQL and NoSQL stores',
  },
  {
    domain: 'Machine Learning',
    proficiency: 78,
    technologies: ['Transformers.js', 'DistilBERT', 'NLP', 'Sentiment Analysis', 'Browser ML'],
    description: 'Client-side ML with NLP, sentiment analysis, and browser-based inference',
  },
  {
    domain: 'Computer Vision',
    proficiency: 80,
    technologies: ['YOLOv8', 'TensorFlow.js', 'MediaPipe', 'COCO-SSD', 'Real-time Detection'],
    description: 'Real-time object and face detection with multiple ML frameworks',
  },
  {
    domain: 'Signal Processing',
    proficiency: 75,
    technologies: ['NumPy', 'SciPy', 'FFT', 'Wavelets', 'Audio Processing'],
    description: 'Digital signal analysis, frequency domain transforms, and audio processing',
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
      <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-purple-500/30 rounded-lg p-4 shadow-xl">
        <p className="text-foreground font-semibold mb-2">{data.domain}</p>
        <p className="text-accent text-sm mb-2">
          Proficiency: {data.proficiency}%
        </p>
        <p className="text-body text-xs mb-2">{data.description}</p>
        <div className="flex flex-wrap gap-1">
          {data.technologies.map((tech) => (
            <span
              key={tech}
              className="text-xs bg-purple-500/20 text-accent-strong px-2 py-1 rounded"
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

  return (
    <Card variant="elevated" padding="lg">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Skills Matrix</h2>
        <p className="text-muted">
          Comprehensive overview of technical expertise across {skillsData.length} key domains
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
                  : 'border-slate-200 dark:border-gray-700 hover:border-slate-300 dark:hover:border-gray-600'
              }`}
              onClick={() => handleDomainClick(skill.domain)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-foreground">{skill.domain}</h4>
                <span className="text-accent font-semibold">
                  {skill.proficiency}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-track rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-purple-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${skill.proficiency}%` }}
                />
              </div>

              {/* Expanded Details */}
              {selectedDomain === skill.domain && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-gray-700 animate-fadeIn">
                  <p className="text-body text-sm mb-3">
                    {skill.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {skill.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs bg-purple-500/20 text-accent-strong px-3 py-1 rounded-full border border-purple-500/30"
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
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-accent">
              {skillsData.length}
            </div>
            <div className="text-sm text-muted">Technical Domains</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent">
              {Math.round(
                skillsData.reduce((sum, s) => sum + s.proficiency, 0) /
                  skillsData.length
              )}
              %
            </div>
            <div className="text-sm text-muted">Average Proficiency</div>
          </div>
          <div className="text-center col-span-2 md:col-span-1">
            <div className="text-3xl font-bold text-accent">
              {skillsData.reduce((sum, s) => sum + s.technologies.length, 0)}+
            </div>
            <div className="text-sm text-muted">Technologies</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
