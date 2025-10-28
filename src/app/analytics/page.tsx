import { Section, Card, Badge } from '@/components/ui';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen pt-16">
      <Section padding="xl" background="subtle">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Data Analytics
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Interactive dashboards and visualizations for social media data insights and trends.
          </p>
        </div>
      </Section>

      <Section padding="lg">
        <Card variant="elevated" padding="lg">
          <div className="text-center py-12">
            <Badge variant="warning" size="lg" className="mb-4">
              Coming Soon
            </Badge>
            <h2 className="text-2xl font-semibold mb-4">Analytics Dashboard</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              This section will feature an interactive analytics dashboard with real-time visualizations,
              KPI metrics, sentiment trends, and drill-down capabilities for social media data analysis.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <Badge variant="primary">React</Badge>
              <Badge variant="primary">Recharts</Badge>
              <Badge variant="primary">D3.js</Badge>
              <Badge variant="primary">TypeScript</Badge>
              <Badge variant="primary">Data Visualization</Badge>
            </div>
          </div>
        </Card>
      </Section>

      <Section padding="lg" background="subtle">
        <h2 className="text-3xl font-bold mb-8">Planned Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">KPI Metrics</h3>
            <p className="text-gray-400">
              Real-time metrics cards displaying engagement rates, sentiment scores, and trending topics.
            </p>
          </Card>
          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Time-Series Charts</h3>
            <p className="text-gray-400">
              Interactive line and area charts showing trends over time with date range selection.
            </p>
          </Card>
          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Sentiment Analysis</h3>
            <p className="text-gray-400">
              Visualizations of sentiment distribution, trends, and entity-level sentiment breakdown.
            </p>
          </Card>
          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Data Export</h3>
            <p className="text-gray-400">
              Export capabilities for CSV and JSON formats with customizable filters and date ranges.
            </p>
          </Card>
        </div>
      </Section>
    </div>
  );
}
