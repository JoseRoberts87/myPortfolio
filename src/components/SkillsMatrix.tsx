'use client';

import { Card } from '@/components/ui';

export interface Skill {
  name: string;
  level: number; // 1-100
  yearsOfExperience?: number;
}

export interface SkillCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  skills: Skill[];
  color: string; // Tailwind color class for theming
}

const skillsData: SkillCategory[] = [
  {
    id: 'web-development',
    title: 'Web Development',
    icon: '🌐',
    description: 'Modern full-stack web applications',
    color: 'purple',
    skills: [
      { name: 'React', level: 95, yearsOfExperience: 5 },
      { name: 'Next.js', level: 90, yearsOfExperience: 3 },
      { name: 'TypeScript', level: 90, yearsOfExperience: 4 },
      { name: 'JavaScript/ES6+', level: 95, yearsOfExperience: 6 },
      { name: 'HTML5/CSS3', level: 95, yearsOfExperience: 7 },
      { name: 'Tailwind CSS', level: 90, yearsOfExperience: 3 },
      { name: 'Node.js', level: 85, yearsOfExperience: 4 },
      { name: 'REST APIs', level: 90, yearsOfExperience: 5 },
    ],
  },
  {
    id: 'backend-development',
    title: 'Backend Development',
    icon: '⚙️',
    description: 'Scalable server-side applications',
    color: 'blue',
    skills: [
      { name: 'Python', level: 95, yearsOfExperience: 7 },
      { name: 'FastAPI', level: 90, yearsOfExperience: 3 },
      { name: 'PostgreSQL', level: 85, yearsOfExperience: 5 },
      { name: 'SQLAlchemy', level: 85, yearsOfExperience: 4 },
      { name: 'Redis', level: 80, yearsOfExperience: 3 },
      { name: 'Alembic', level: 80, yearsOfExperience: 3 },
      { name: 'Pytest', level: 85, yearsOfExperience: 4 },
    ],
  },
  {
    id: 'data-engineering',
    title: 'Data Engineering',
    icon: '📊',
    description: 'ETL pipelines and data processing',
    color: 'green',
    skills: [
      { name: 'Pandas', level: 90, yearsOfExperience: 5 },
      { name: 'NumPy', level: 85, yearsOfExperience: 5 },
      { name: 'ETL Pipelines', level: 85, yearsOfExperience: 4 },
      { name: 'Data Modeling', level: 85, yearsOfExperience: 5 },
      { name: 'SQL', level: 90, yearsOfExperience: 6 },
      { name: 'API Integration', level: 90, yearsOfExperience: 5 },
    ],
  },
  {
    id: 'machine-learning',
    title: 'Machine Learning',
    icon: '🤖',
    description: 'ML models and NLP',
    color: 'orange',
    skills: [
      { name: 'Transformers (HuggingFace)', level: 80, yearsOfExperience: 2 },
      { name: 'Scikit-learn', level: 85, yearsOfExperience: 4 },
      { name: 'NLP/Sentiment Analysis', level: 80, yearsOfExperience: 3 },
      { name: 'Model Deployment', level: 75, yearsOfExperience: 2 },
      { name: 'Data Preprocessing', level: 90, yearsOfExperience: 5 },
    ],
  },
  {
    id: 'cloud-devops',
    title: 'Cloud & DevOps',
    icon: '☁️',
    description: 'Infrastructure and deployment',
    color: 'cyan',
    skills: [
      { name: 'AWS (ECS, RDS, ElastiCache)', level: 85, yearsOfExperience: 4 },
      { name: 'Docker', level: 90, yearsOfExperience: 5 },
      { name: 'Terraform', level: 85, yearsOfExperience: 3 },
      { name: 'GitHub Actions', level: 85, yearsOfExperience: 3 },
      { name: 'CI/CD Pipelines', level: 85, yearsOfExperience: 4 },
      { name: 'Linux/Unix', level: 85, yearsOfExperience: 6 },
      { name: 'Nginx/Load Balancers', level: 75, yearsOfExperience: 3 },
    ],
  },
  {
    id: 'tools-practices',
    title: 'Tools & Practices',
    icon: '🛠️',
    description: 'Development tools and methodologies',
    color: 'pink',
    skills: [
      { name: 'Git/GitHub', level: 95, yearsOfExperience: 7 },
      { name: 'VS Code', level: 95, yearsOfExperience: 6 },
      { name: 'Agile/Scrum', level: 85, yearsOfExperience: 5 },
      { name: 'Test-Driven Development', level: 80, yearsOfExperience: 4 },
      { name: 'Code Review', level: 90, yearsOfExperience: 5 },
      { name: 'Technical Documentation', level: 85, yearsOfExperience: 6 },
    ],
  },
];

interface SkillBarProps {
  skill: Skill;
  color: string;
}

function SkillBar({ skill, color }: SkillBarProps) {
  const colorMap: Record<string, { bar: string; bg: string; text: string }> = {
    purple: {
      bar: 'bg-purple-500',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
    },
    blue: {
      bar: 'bg-blue-500',
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
    },
    green: {
      bar: 'bg-green-500',
      bg: 'bg-green-500/10',
      text: 'text-green-400',
    },
    orange: {
      bar: 'bg-orange-500',
      bg: 'bg-orange-500/10',
      text: 'text-orange-400',
    },
    cyan: {
      bar: 'bg-cyan-500',
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-400',
    },
    pink: {
      bar: 'bg-pink-500',
      bg: 'bg-pink-500/10',
      text: 'text-pink-400',
    },
  };

  const colors = colorMap[color] || colorMap.purple;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-300">{skill.name}</span>
        <div className="flex items-center gap-2">
          {skill.yearsOfExperience && (
            <span className="text-xs text-gray-500">
              {skill.yearsOfExperience} {skill.yearsOfExperience === 1 ? 'yr' : 'yrs'}
            </span>
          )}
          <span className={`text-sm font-semibold ${colors.text}`}>
            {skill.level}%
          </span>
        </div>
      </div>
      <div className={`w-full h-2 rounded-full ${colors.bg}`}>
        <div
          className={`h-full rounded-full ${colors.bar} transition-all duration-500 ease-out`}
          style={{ width: `${skill.level}%` }}
        />
      </div>
    </div>
  );
}

interface SkillCategoryCardProps {
  category: SkillCategory;
}

function SkillCategoryCard({ category }: SkillCategoryCardProps) {
  const colorMap: Record<string, string> = {
    purple: 'border-purple-500/50 hover:border-purple-500',
    blue: 'border-blue-500/50 hover:border-blue-500',
    green: 'border-green-500/50 hover:border-green-500',
    orange: 'border-orange-500/50 hover:border-orange-500',
    cyan: 'border-cyan-500/50 hover:border-cyan-500',
    pink: 'border-pink-500/50 hover:border-pink-500',
  };

  const borderColor = colorMap[category.color] || colorMap.purple;

  return (
    <Card
      variant="elevated"
      padding="lg"
      className={`border ${borderColor} transition-all duration-300`}
    >
      <div className="mb-6">
        <div className="text-4xl mb-3">{category.icon}</div>
        <h3 className="text-2xl font-bold text-white mb-2">{category.title}</h3>
        <p className="text-gray-400 text-sm">{category.description}</p>
      </div>
      <div className="space-y-1">
        {category.skills.map((skill) => (
          <SkillBar key={skill.name} skill={skill} color={category.color} />
        ))}
      </div>
    </Card>
  );
}

export default function SkillsMatrix() {
  return (
    <section className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Skills & Expertise
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Comprehensive technical skills across the full development lifecycle,
            from frontend to cloud infrastructure
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {skillsData.map((category) => (
            <SkillCategoryCard key={category.id} category={category} />
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-400 mb-2">7+</div>
            <div className="text-gray-400 text-sm">Years Experience</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">40+</div>
            <div className="text-gray-400 text-sm">Technologies</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">6</div>
            <div className="text-gray-400 text-sm">Core Domains</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-400 mb-2">100%</div>
            <div className="text-gray-400 text-sm">Dedication</div>
          </div>
        </div>
      </div>
    </section>
  );
}
