interface Metric {
  /** Headline figure. */
  value: string;
  /** What changed (short). */
  label: string;
  /** One sentence of context: the workflow/system, a baseline or timeframe, and where. */
  detail: string;
}

// Selected Impact (issue #192): the strongest four-to-six outcomes, each stated
// with the workflow it changed and a baseline or timeframe where one exists —
// not bare percentages. Every figure traces to a specific role or case study.
// Sources: the résumé (fact-checked into the knowledge base, #172) and the case
// studies. "Recovered billions" was dropped for the concrete 68%-efficiency
// figure from the same role — both are in the résumé, but a headline with no
// baseline reads as hyperbole next to measured results.
const metrics: Metric[] = [
  {
    value: '$2M',
    label: 'Energy costs cut',
    detail:
      'Saved a full year of industrial energy spend with an interpretable ML demand-forecast at Evonik.',
  },
  {
    value: '83%',
    label: 'Less equipment downtime',
    detail:
      'A predictive-maintenance model on live robotics telemetry caught failures before they happened, at Amazon Robotics.',
  },
  {
    value: '99.99%',
    label: 'Platform uptime',
    detail:
      'An event-driven IoT platform served operations-critical data at sub-5s latency — under ~1 minute of downtime a week, at Very Technology.',
  },
  {
    value: '72%',
    label: 'Analytics-platform growth',
    detail:
      "Grew a Fortune 500 client's analytics platform by wiring AI agents into their Databricks pipelines, at MojoTech.",
  },
  {
    value: '90%',
    label: 'User-productivity lift',
    detail:
      'Reached within three weeks from an AI-first system I helped design, at Very Technology.',
  },
  {
    value: '68%',
    label: 'Process efficiency',
    detail:
      "Overhauled the bank's Finance data workflows with algorithms and ML, at Bank of America.",
  },
];

export default function ImpactMetrics() {
  return (
    <>
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-foreground mb-4">Impact by the Numbers</h2>
        <p className="text-xl text-muted max-w-2xl mx-auto">
          Business outcomes from 15+ years across data and AI engineering — each figure ties to a
          specific role or case study.
        </p>
      </div>

      <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <li
            key={metric.label}
            className="flex flex-col items-center text-center bg-surface border border-subtle rounded-xl p-6 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/10 transition-all"
          >
            <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
              {metric.value}
            </span>
            <span className="mt-2 text-base font-semibold text-foreground">{metric.label}</span>
            <span className="mt-2 text-sm text-muted leading-relaxed">{metric.detail}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
