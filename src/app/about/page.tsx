import type { Metadata } from 'next';
import Link from 'next/link';
import { Section, Card, Badge, PageHero } from '@/components/ui';
import Timeline from '@/components/Timeline';

export const metadata: Metadata = {
  title: 'About | Jose Roberts',
  description:
    'The 15-year arc of a Data & AI Architect — from Bank of America to Amazon Robotics, Evonik, Very Technology, and MojoTech — blending business, GTM, and deep technical work with team leadership.',
};

const strengths = [
  {
    icon: '💼',
    title: 'Business & GTM',
    body: "I start from the outcome, not the tech. Every pipeline, model, and agent I've built traces back to a number a business cares about — dollars recovered, downtime removed, productivity gained — and I can carry that story from the boardroom to the backend.",
  },
  {
    icon: '🛠️',
    title: 'Technical Depth',
    body: 'Fifteen years hands-on across the full data lifecycle: streaming and batch pipelines, ML forecasting, real-time IoT platforms, and — most recently — agentic AI and LLM systems on Databricks and AWS.',
  },
  {
    icon: '🧭',
    title: 'Leadership & Mentorship',
    body: 'As Manager of Data Science & Data Engineering I led teams around product ownership and scalable delivery, trained and grew junior engineers, and partnered directly with clients to turn ambiguous needs into shipped systems.',
  },
];

const impact = [
  { value: 'Billions', label: 'recovered in deposit-account reviews at Bank of America' },
  { value: '83%', label: 'equipment downtime cut with predictive maintenance at Amazon Robotics' },
  { value: '$2M', label: 'saved in one year via an ML energy-forecasting model at Evonik' },
  { value: '99.99%', label: 'uptime on a real-time IoT platform (sub-5s latency) at Very' },
  { value: '90%', label: 'productivity gain in 3 weeks from an AI-first system design' },
  { value: '72%', label: 'growth enabled for a Fortune 500 via Databricks + AI agents at MojoTech' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-16">
      <PageHero
        eyebrow="About"
        title="From bank ledgers to AI agents"
        tagline="Fifteen-plus years architecting data and AI systems — and the business outcomes they drove — across finance, robotics, chemicals, and consulting."
        badges={['15+ Years', 'Data & AI Architect', 'Team Leadership', 'GTM → Production']}
      />

      {/* Narrative */}
      <Section padding="lg">
        <div className="max-w-3xl mx-auto space-y-6 text-lg text-body leading-relaxed">
          <p>
            I&apos;ve spent my career on the seam between the business and the systems that run it.
            It started at <span className="text-accent font-medium">Bank of America</span>, where I
            built the Finance group&apos;s metadata repository and used analytics to review deposit
            accounts — work that recovered billions of dollars. That was the lesson that has shaped
            everything since: data is only interesting when it changes a decision.
          </p>
          <p>
            From there the problems got more physical and more real-time. At{' '}
            <span className="text-accent font-medium">Amazon Robotics</span> I built pipelines for
            the Deployment Engineering team and trained a predictive-maintenance model that cut
            equipment downtime by 83%. At <span className="text-accent font-medium">Evonik
            Industries</span> I owned the full lifecycle of the data platform behind a niche data
            science group, and shipped an ML forecasting model that saved $2M in energy costs in a
            single year.
          </p>
          <p>
            At <span className="text-accent font-medium">Very Technology</span> the job became as
            much about people as pipelines. As Manager of Data Science and Data Engineering I led
            teams with an emphasis on product ownership, mentored junior engineers, and drove the
            integration of LLMs and generative AI into production — including an AI-first system
            design that lifted user productivity 90% in three weeks and a real-time API platform
            holding 99.99% uptime at sub-5-second latency. Most recently, at{' '}
            <span className="text-accent font-medium">MojoTech</span>, I architect agentic AI and
            Lakehouse data platforms for clients — building an agentic workforce that reduced
            operational errors by 30% and bottlenecks by 77%, and enabling 72% growth for a
            Fortune 500 company.
          </p>
          <p>
            The throughline is the blend: I can frame the go-to-market case, design the architecture,
            write the code, and lead the team that keeps it running. That&apos;s the kind of{' '}
            <span className="text-accent font-medium">Data &amp; AI Architect</span> I am.
          </p>
        </div>
      </Section>

      {/* What I bring */}
      <Section padding="lg" background="subtle">
        <h2 className="text-3xl font-bold text-foreground text-center mb-12">What I bring</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {strengths.map((s) => (
            <Card key={s.title} variant="elevated" padding="lg">
              <div className="text-4xl mb-4">{s.icon}</div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{s.title}</h3>
              <p className="text-muted">{s.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Impact by the numbers */}
      <Section padding="lg">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Impact, by the numbers</h2>
          <p className="text-muted max-w-2xl mx-auto">
            A few outcomes from across the arc — each one a decision the data changed.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {impact.map((item) => (
            <Card key={item.label} variant="bordered" padding="lg">
              <div className="text-4xl font-bold text-accent mb-2">{item.value}</div>
              <p className="text-sm text-muted">{item.label}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Career journey */}
      <Section padding="lg" background="subtle">
        <Timeline variant="experience" />
      </Section>

      {/* CTA */}
      <Section padding="lg">
        <Card variant="elevated" padding="lg">
          <div className="text-center">
            <Badge variant="success" size="lg" className="mb-4">
              Open to Data &amp; AI Architect roles
            </Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">Let&apos;s build something</h2>
            <p className="text-muted max-w-2xl mx-auto mb-8">
              Based in Providence, RI and open to Data &amp; AI Architect roles. If you have a
              data or AI problem that needs both strategy and execution, I&apos;d love to hear about it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center bg-purple-600 hover:bg-purple-500 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                Get in touch
              </Link>
              <a
                href="/Jose-Roberts-Resume.pdf"
                download="Jose-Roberts-Resume.pdf"
                className="inline-flex items-center justify-center gap-2 bg-surface border border-subtle hover:border-purple-500 text-foreground font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download résumé
              </a>
            </div>
          </div>
        </Card>
      </Section>
    </div>
  );
}
