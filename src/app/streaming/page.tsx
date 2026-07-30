import type { Metadata } from 'next';
import { Section, PageHero } from '@/components/ui';
import LiveDashboard from '@/components/Streaming/LiveDashboard';

export const metadata: Metadata = {
  title: 'Real-Time Streaming | Jose Roberts',
  description:
    'A live event-streaming dashboard — Server-Sent Events feeding real-time throughput, latency, and per-source metrics, modeling a Kinesis-style pipeline with a sub-5s SLA.',
};

export default function StreamingPage() {
  return (
    <div className="min-h-screen pt-16">
      <PageHero
        eyebrow="Real-Time"
        title="Live Streaming Dashboard"
        tagline="A Server-Sent Events stream driving real-time throughput, latency, and per-source metrics — modeling the kind of event pipeline that holds a 99.99% uptime / sub-5s SLA in production."
        badges={['Server-Sent Events', 'Kinesis-style', '99.99% uptime', 'sub-5s latency']}
      />

      <Section padding="lg">
        <LiveDashboard />
      </Section>

      <Section padding="lg" background="subtle">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">How it works</h2>
          <p className="text-muted">
            The browser opens an <code className="text-accent">EventSource</code> connection to a Next.js
            route handler that streams synthetic pipeline events as{' '}
            <code className="text-accent">text/event-stream</code>. Each event is folded into rolling
            metrics on the client — throughput buckets, a latency series, per-source counts, and error
            rate. If the stream is unavailable, the dashboard transparently falls back to generating
            events locally so the demo always stays live.
          </p>
          <p className="text-sm text-faint">
            This mirrors the production pattern: a managed stream (AWS Kinesis) fanning records into
            consumers, with real-time observability on throughput and latency.
          </p>
        </div>
      </Section>
    </div>
  );
}
