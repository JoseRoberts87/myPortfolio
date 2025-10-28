import { Section, Card, Badge } from '@/components/ui';

export default function DataPipelinesPage() {
  return (
    <div className="min-h-screen pt-16">
      <Section padding="xl" background="subtle">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Data Pipelines
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Building robust ETL pipelines for social media data ingestion, processing, and storage.
          </p>
        </div>
      </Section>

      <Section padding="lg">
        <Card variant="elevated" padding="lg">
          <div className="text-center py-12">
            <Badge variant="warning" size="lg" className="mb-4">
              Coming Soon
            </Badge>
            <h2 className="text-2xl font-semibold mb-4">Social Media Data Pipeline</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              This section will showcase a FastAPI-based data pipeline that integrates with Reddit and Twitter APIs,
              implements ETL processes, stores data in PostgreSQL, and provides real-time monitoring capabilities.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <Badge variant="primary">FastAPI</Badge>
              <Badge variant="primary">Python</Badge>
              <Badge variant="primary">PostgreSQL</Badge>
              <Badge variant="primary">Prisma</Badge>
              <Badge variant="primary">Reddit API</Badge>
              <Badge variant="primary">Twitter API</Badge>
            </div>
          </div>
        </Card>
      </Section>

      <Section padding="lg" background="subtle">
        <h2 className="text-3xl font-bold mb-8">Planned Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">API Integration</h3>
            <p className="text-gray-400">
              Connect to Reddit and Twitter APIs for real-time data collection with rate limiting and error handling.
            </p>
          </Card>
          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">ETL Pipeline</h3>
            <p className="text-gray-400">
              Extract, transform, and load social media data with validation, cleaning, and quality checks.
            </p>
          </Card>
          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Data Storage</h3>
            <p className="text-gray-400">
              PostgreSQL database with optimized schemas and indexes for efficient querying.
            </p>
          </Card>
          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Monitoring</h3>
            <p className="text-gray-400">
              Real-time pipeline monitoring dashboard with logging, alerting, and performance metrics.
            </p>
          </Card>
        </div>
      </Section>
    </div>
  );
}
