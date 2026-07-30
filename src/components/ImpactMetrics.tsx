interface Metric {
  /** Headline figure. */
  value: string;
  /** Short label under the figure. */
  label: string;
  /** One-line context (what / where). */
  detail: string;
}

const metrics: Metric[] = [
  {
    value: '72%',
    label: 'Fortune 500 growth',
    detail: 'AI agents across a client’s work streams (MojoTech)',
  },
  {
    value: '90%',
    label: 'Productivity gain',
    detail: 'AI-first system delivered in 3 weeks',
  },
  {
    value: '$2M',
    label: 'Energy costs saved',
    detail: 'ML forecasting model in one year (Evonik)',
  },
  {
    value: '83%',
    label: 'Downtime reduced',
    detail: 'Predictive maintenance (Amazon Robotics)',
  },
  {
    value: '99.99%',
    label: 'Platform uptime',
    detail: 'Real-time IoT platform, sub-5s latency',
  },
  {
    value: 'Billions',
    label: 'Dollars recovered',
    detail: 'Deposit-account analytics (Bank of America)',
  },
];

export default function ImpactMetrics() {
  return (
    <>
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-foreground mb-4">Impact by the Numbers</h2>
        <p className="text-xl text-muted max-w-2xl mx-auto">
          Measurable business outcomes delivered across 15+ years of data and AI engineering.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="flex flex-col items-center text-center bg-surface border border-subtle rounded-xl p-6 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/10 transition-all"
          >
            <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
              {metric.value}
            </span>
            <span className="mt-2 text-sm font-semibold text-foreground">{metric.label}</span>
            <span className="mt-1 text-xs text-muted leading-snug">{metric.detail}</span>
          </div>
        ))}
      </div>
    </>
  );
}
