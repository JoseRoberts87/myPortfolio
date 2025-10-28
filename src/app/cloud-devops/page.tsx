import { Section, Card, Badge } from '@/components/ui';

export default function CloudDevOpsPage() {
  return (
    <div className="min-h-screen pt-16">
      <Section padding="xl" background="subtle">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Cloud & DevOps
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            AWS infrastructure, CI/CD pipelines, and cloud migration strategies for scalable applications.
          </p>
        </div>
      </Section>

      <Section padding="lg">
        <Card variant="elevated" padding="lg">
          <div className="text-center py-12">
            <Badge variant="warning" size="lg" className="mb-4">
              Coming Soon
            </Badge>
            <h2 className="text-2xl font-semibold mb-4">AWS Cloud Migration</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              This section will document the complete migration of this portfolio application from
              Vercel/Railway to AWS, showcasing Infrastructure as Code, automated deployments,
              monitoring, and scalable cloud architecture.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <Badge variant="primary">AWS</Badge>
              <Badge variant="primary">Terraform</Badge>
              <Badge variant="primary">EC2</Badge>
              <Badge variant="primary">RDS</Badge>
              <Badge variant="primary">CloudFront</Badge>
              <Badge variant="primary">CI/CD</Badge>
            </div>
          </div>
        </Card>
      </Section>

      <Section padding="lg" background="subtle">
        <h2 className="text-3xl font-bold mb-8">Planned Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Infrastructure as Code</h3>
            <p className="text-gray-400">
              Terraform/CloudFormation templates for reproducible AWS infrastructure deployment.
            </p>
          </Card>
          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Database Migration</h3>
            <p className="text-gray-400">
              Migrate PostgreSQL to RDS with automated backups, read replicas, and connection pooling.
            </p>
          </Card>
          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">CI/CD Pipeline</h3>
            <p className="text-gray-400">
              Automated testing, building, and deployment with GitHub Actions or AWS CodePipeline.
            </p>
          </Card>
          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Monitoring & Logs</h3>
            <p className="text-gray-400">
              CloudWatch monitoring, log aggregation, alerting, and performance metrics dashboard.
            </p>
          </Card>
        </div>
      </Section>
    </div>
  );
}
