import { Section, Card, Badge } from '@/components/ui';

export default function WebDevelopmentPage() {
  const projects = [
    {
      title: 'Portfolio Application',
      description: 'Modern portfolio built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4. Features responsive design, unit testing with Jest, and comprehensive documentation.',
      tags: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Jest'],
      status: 'In Progress',
    },
  ];

  const skills = [
    'Next.js & React',
    'TypeScript',
    'Tailwind CSS',
    'Responsive Design',
    'Unit Testing',
    'Git Workflow',
    'Component Architecture',
  ];

  return (
    <div className="min-h-screen pt-16">
      <Section padding="xl" background="subtle">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Web Development
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Building modern, responsive web applications with cutting-edge technologies and best practices.
          </p>
        </div>
      </Section>

      <Section padding="lg">
        <h2 className="text-3xl font-bold mb-8">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <Card key={index} variant="elevated" hover>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-semibold">{project.title}</h3>
                <Badge variant="info">{project.status}</Badge>
              </div>
              <p className="text-gray-400 mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="primary" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section padding="lg" background="subtle">
        <h2 className="text-3xl font-bold mb-8">Skills & Technologies</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {skills.map((skill) => (
            <Card key={skill} variant="bordered" padding="md">
              <p className="text-center font-medium">{skill}</p>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}
