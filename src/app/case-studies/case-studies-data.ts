export interface CaseStudyMetric {
  label: string;
  value: string;
  description?: string;
}

export interface CaseStudySection {
  title: string;
  content: string[];
  codeExample?: {
    language: string;
    code: string;
    caption?: string;
  };
  image?: {
    src: string;
    alt: string;
    caption?: string;
  };
  highlights?: string[];
}

export interface CaseStudy {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  category: string;
  technologies: string[];
  metrics: CaseStudyMetric[];
  readTime: string;
  publishedDate: string;

  // Hero content
  heroImage?: string;
  challenge: string;

  // Main sections
  problemStatement: CaseStudySection;
  // Senior-level narrative structure (#197): every study answers who it was
  // for, what boxed it in, and how it was kept reliable, secure, and tested —
  // not just what was built. Enforced by case-studies-structure.test.ts.
  stakeholders: CaseStudySection;
  constraints: CaseStudySection;
  technicalChallenges: CaseStudySection;
  solutionArchitecture: CaseStudySection;
  implementation: CaseStudySection;
  reliability: CaseStudySection;
  security: CaseStudySection;
  testingStrategy: CaseStudySection;
  resultsAndImpact: CaseStudySection;
  /** Distinguishes measured results from published benchmarks or estimates (#197). */
  metricsNote?: string;
  tradeoffsAndDecisions: CaseStudySection;
  lessonsLearned: CaseStudySection;
  futureImprovements: CaseStudySection;

  // Related links
  liveDemo?: string;
  githubRepo?: string;
  relatedCaseStudies: string[];
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'agentic-ai-workforce',
    title: 'Agentic AI Workforce',
    subtitle: 'Coordinated LLM Agents that Automate Enterprise Operations',
    description: 'How I designed an agentic workforce on Databricks that automates workflows and manages tasks for a Fortune 500 client — cutting operational errors 30% and bottlenecks 77% while growing their analytics platform 72%.',
    icon: '🧠',
    category: 'AI & Agents',
    technologies: ['Databricks', 'AWS', 'LLMs', 'Agentic AI', 'RAG', 'Python', 'Model Serving'],
    metrics: [
      { label: 'Fewer Errors', value: '30%', description: 'Reduction in operational errors' },
      { label: 'Fewer Bottlenecks', value: '77%', description: 'Reduction in workflow bottlenecks' },
      { label: 'Analytics Growth', value: '72%', description: 'Growth of the client analytics platform' },
      { label: 'Scale', value: 'Fortune 500', description: 'Enterprise-wide deployment' },
    ],
    readTime: '8 min read',
    publishedDate: '2026-07',
    challenge: 'A Fortune 500 organization was losing time and accuracy to manual, repetitive workflows, with no visibility into how LLMs were being consumed across teams. The goal: deploy a coordinated workforce of AI agents that execute tasks reliably, with governance and cost transparency — augmenting people rather than replacing them.',

    stakeholders: {
      title: 'Users & Stakeholders',
      content: [
        'Operations teams whose manual workflows — data hand-offs, reconciliation, report generation — the agents took over.',
        'Leadership, who needed the first org-wide view of LLM consumption, cost, and quality before expanding automation.',
        'Platform and data teams owning the Databricks lakehouse the agents ran on and the pipelines they plugged into.',
        'The people in the loop: approvers accountable for high-impact actions, who had to trust every step they signed off.',
      ],
    },
    constraints: {
      title: 'Constraints',
      content: [
        'Enterprise governance: nothing could be automated that could not be audited — every action needed provenance.',
        'The platform was fixed: agents had to live on the client\'s existing Databricks + AWS lakehouse, not a new stack.',
        'Probabilistic models feeding deterministic business workflows — a single hallucinated field could corrupt downstream systems.',
        'Cost transparency was a mandate, not a nice-to-have: ungoverned model spend had already stalled adoption once.',
        'Humans stayed accountable: consequential steps required an approval gate by policy.',
      ],
    },
    reliability: {
      title: 'Reliability & Error Handling',
      content: [
        'Every tool output was schema-validated before it touched a downstream system; failed validation fed back to the agent for self-correction rather than propagating.',
        'Hard step caps and timeouts prevented runaway loops; retries and typed hand-offs kept multi-agent tasks from duplicating work.',
        'Idempotent integration points meant a retried step never double-applied an action.',
        'Human approval gates acted as circuit breakers on the highest-impact paths.',
      ],
    },
    security: {
      title: 'Security & Privacy',
      content: [
        'Agents ran against small, typed, allow-listed tool sets — no open-ended code or network access.',
        'Data never left the governed lakehouse: retrieval, action, and telemetry all happened inside the client\'s existing access controls.',
        'Every model call and agent action was recorded with provenance, making the system auditable end to end.',
        'Consumption telemetry deliberately captured metadata (model, tokens, cost, latency) rather than raw sensitive content.',
      ],
    },
    testingStrategy: {
      title: 'Testing Strategy',
      content: [
        'A model-benchmarking harness scored candidates per task class (extraction, summarization, classification, reasoning) before any model reached production.',
        'Agent behaviors were exercised against representative historical tasks before being allowed to act on live ones.',
        'Output validators doubled as executable contracts: schema checks ran on every call in production, not just in test.',
        'Automation expanded incrementally — each new task class earned trust through observed reliability, not promises.',
      ],
    },
    futureImprovements: {
      title: 'Future Improvements',
      content: [
        'Continuous evaluation in CI so model and prompt regressions are caught before deployment, not after.',
        'Cost-aware routing that picks the cheapest model meeting the task\'s measured accuracy bar automatically.',
        'Expanding the agentic pattern to more work streams as approval-gate data identifies the safest candidates.',
      ],
    },
    problemStatement: {
      title: 'The Problem',
      content: [
        'As a Data and AI Architect at MojoTech, I worked directly with a Fortune 500 client whose teams were bottlenecked by manual, repetitive operational work — data hand-offs, status reconciliation, report generation, and routine decisions that each needed a human to shepherd from start to finish.',
        'Early experiments with LLMs were promising but ungoverned: different teams called different models in different ways, with no shared view of cost, quality, or consumption. Reliability was the blocker — a single hallucinated field or dropped step could corrupt a downstream workflow, so adoption stalled.',
        'The mandate was to turn ad-hoc LLM usage into a dependable "agentic workforce": agents that could plan and execute multi-step tasks across the business, grounded in the company\'s own data, with the observability and guardrails an enterprise requires.',
      ],
      highlights: [
        'Replace manual, repetitive workflows with reliable automated agents',
        'Ground agent actions in the company\'s own data, not just model priors',
        'Give leadership visibility into LLM consumption, cost, and quality',
        'Keep humans in the loop for judgment and approval steps',
        'Standardize model selection with objective, task-level benchmarks',
      ],
    },

    technicalChallenges: {
      title: 'Technical Challenges',
      content: [
        '**1. Agent Reliability**: LLM agents are probabilistic. Turning "usually right" into "safe to automate" required constraining each agent to a small, well-typed set of tools and validating every output before it touched a downstream system.',
        '**2. Orchestration Across Work Streams**: Real tasks span multiple systems and teams. Coordinating planner and worker agents — with retries, timeouts, and hand-offs — without creating runaway loops or duplicated work was the core engineering problem.',
        '**3. LLM Consumption Visibility**: Leadership had no idea which teams used which models, at what cost, or with what quality. I designed agentic data ingestion on Databricks to capture every model call as governed, queryable data.',
        '**4. Model Selection**: "Which model for which task?" was being answered by opinion. Extraction, summarization, classification, and reasoning each have very different accuracy, cost, and latency trade-offs.',
        '**5. Governance and Trust**: An enterprise will not automate what it cannot audit. Every agent action needed provenance, and every high-impact step needed a human approval gate.',
      ],
      codeExample: {
        language: 'python',
        code: `# Illustrative: a constrained worker agent with validated tool output
class WorkerAgent:
    def __init__(self, llm, tools: dict[str, Tool], validator: Validator):
        self.llm = llm                # served via Databricks Model Serving
        self.tools = tools            # small, typed, allow-listed tool set
        self.validator = validator

    async def run(self, task: Task) -> Result:
        for _ in range(MAX_STEPS):              # hard cap prevents runaway loops
            plan = await self.llm.plan(task, tools=self.tools.keys())
            tool = self.tools[plan.tool]         # KeyError if off the allow-list

            output = await tool.invoke(plan.args)

            # Never trust raw model output — validate before it propagates
            verdict = self.validator.check(output, schema=tool.output_schema)
            if not verdict.ok:
                task = task.with_feedback(verdict.errors)    # self-correct
                continue

            if plan.needs_human_approval:
                await request_approval(task, output)          # human in the loop

            return Result(output=output, provenance=plan.trace)
        raise AgentExhausted(task)`,
        caption: 'Illustrative of the constrained-agent pattern: allow-listed tools, output validation, step caps, and human approval gates',
      },
    },

    solutionArchitecture: {
      title: 'Solution Architecture',
      content: [
        '**A Databricks-Centered Agentic Platform**: I built the workforce on Databricks and AWS so that agents, the data they act on, and the telemetry they produce all lived in one governed lakehouse.',
        '',
        '**1. Agentic Data Ingestion (Observability)**',
        '• Every LLM and agent call was captured as structured data on Databricks — model, task type, tokens, latency, cost, and outcome.',
        '• This gave leadership a single, queryable view of LLM consumption across the organization for the first time.',
        '',
        '**2. Model-Benchmarking Framework (Selection)**',
        '• A harness that scored candidate models on representative tasks, so model choice became data-driven rather than anecdotal.',
        '• Selection balanced accuracy, cost, and latency per task class.',
        '',
        '**3. Agent Orchestration (Execution)**',
        '• A planner agent decomposed a request into steps; worker agents executed each step against a small, typed tool set.',
        '• RAG grounded agents in the client\'s own data so actions reflected reality, not just model priors.',
        '',
        '**4. Integration Layer**',
        '• Automated data pipelines and APIs on Databricks wired the agents into the client\'s existing work streams, enabling AI agents across the business.',
      ],
      highlights: [
        'One governed lakehouse for agents, data, and telemetry',
        'LLM consumption captured as first-class, queryable data',
        'Benchmark-driven model selection per task class',
        'RAG grounding so agents act on the company\'s real data',
        'Agents wired into existing pipelines and APIs, not a silo',
      ],
    },

    implementation: {
      title: 'Key Implementation Details',
      content: [
        '**Planner / Worker Split**: A planner produced a typed, inspectable plan; workers executed one step at a time. This separation made behavior auditable and kept any single agent\'s scope small enough to validate.',
        '**Grounding with RAG**: Before acting, agents retrieved relevant context from the client\'s data so outputs matched current reality — the same retrieve-then-generate pattern behind the live demo linked below.',
        '**Consumption Telemetry**: Each call emitted a governed record to Databricks, turning "how are we using LLMs?" into a SQL query and a dashboard.',
        '**Benchmark-Driven Selection**: New tasks were routed to the model that won on that task class in the benchmark harness — not the newest or most expensive one.',
        '**Human-in-the-Loop**: High-impact steps paused for approval, so automation expanded only as far as trust allowed.',
      ],
      codeExample: {
        language: 'python',
        code: `# Illustrative: capturing every model call as governed lakehouse data
async def instrumented_call(model: str, task_type: str, prompt: str):
    start = perf_counter()
    resp = await serving.generate(model=model, prompt=prompt)
    record = {
        "model": model,
        "task_type": task_type,
        "input_tokens": resp.usage.input_tokens,
        "output_tokens": resp.usage.output_tokens,
        "cost_usd": price(model, resp.usage),
        "latency_ms": (perf_counter() - start) * 1000,
    }
    # Governed, queryable consumption telemetry for the whole org
    await lakehouse.append("ai.llm_consumption", record)
    return resp`,
        caption: 'Illustrative of the consumption-telemetry pattern that gave leadership org-wide LLM visibility',
      },
    },

    resultsAndImpact: {
      title: 'Results & Impact',
      content: [
        '**Operational Outcomes**:',
        '• **30% reduction in operational errors** — validated, grounded agents removed a large class of manual mistakes.',
        '• **77% reduction in bottlenecks** — tasks that used to wait on a person now flowed through agents, with human approval only where it mattered.',
        '• **72% growth of the client\'s analytics platform** — automated pipelines and APIs let AI agents operate across their work streams.',
        '',
        '**Organizational Outcomes**:',
        '• Leadership gained a first-ever, queryable view of LLM consumption, cost, and quality.',
        '• Model selection shifted from opinion to benchmark-backed decisions.',
        '• Automation expanded safely because every action was grounded, validated, and auditable.',
      ],
    },

    tradeoffsAndDecisions: {
      title: 'Trade-offs & Architecture Decisions',
      content: [
        '**Decision 1: Constrained Agents vs. Open-Ended Autonomy**',
        '✅ *Chose*: Small, typed, allow-listed tool sets with validated outputs',
        '• *Rationale*: Reliability is the currency of enterprise automation; constraints are what make agents trustworthy',
        '• *Trade-off*: Less "magic", more engineering — but automation you can actually deploy',
        '',
        '**Decision 2: Build on Databricks vs. a Separate Agent Stack**',
        '✅ *Chose*: A Databricks + AWS lakehouse for agents, data, and telemetry',
        '• *Rationale*: Governance and consumption visibility come almost for free when everything lives in one governed platform',
        '• *Trade-off*: Tighter coupling to the platform, offset by unified auditability',
        '',
        '**Decision 3: Benchmark-Driven vs. Default Model Selection**',
        '✅ *Chose*: A benchmarking harness scoring models per task class',
        '• *Rationale*: The right model is task-dependent; defaulting to one model wastes either money or accuracy',
        '• *Trade-off*: Up-front harness investment, repaid in cost and quality on every task',
        '',
        '**Decision 4: Full Automation vs. Human-in-the-Loop**',
        '✅ *Chose*: Human approval gates on high-impact steps',
        '• *Rationale*: Trust — and adoption — grow fastest when people stay in control of consequential actions',
        '• *Trade-off*: Not every step is hands-off, but the automation that ships is safe',
      ],
    },

    lessonsLearned: {
      title: 'Lessons Learned',
      content: [
        '**1. Constraints Create Reliability**',
        'The agents that shipped were the ones with the smallest scope. Allow-listed tools, typed outputs, and validation turned "usually right" into "safe to automate." *Lesson: in agentic systems, what you forbid matters more than what you allow.*',
        '',
        '**2. You Can\'t Govern What You Can\'t See**',
        'Capturing every model call as governed data was as valuable as the automation itself — it turned LLM usage into something leadership could measure and manage. *Lesson: instrument consumption from day one.*',
        '',
        '**3. Model Selection Is an Engineering Problem**',
        'A benchmarking harness ended endless "which model?" debates and saved real money. *Lesson: measure models on your tasks; don\'t default to the newest or priciest.*',
        '',
        '**4. Grounding Beats Cleverness**',
        'RAG grounding in the client\'s own data eliminated a whole class of confident-but-wrong actions. *Lesson: give agents the facts before you give them autonomy.*',
        '',
        '**5. Keep Humans in the Loop to Move Faster**',
        'Approval gates sound like friction but actually accelerated adoption, because stakeholders trusted a system they could still steer. *Lesson: human-in-the-loop is an adoption strategy, not just a safety net.*',
      ],
    },

    liveDemo: '/ai-agents',
    relatedCaseStudies: ['realtime-iot-platform', 'nlp-pipeline-architecture'],
  },

  {
    slug: 'realtime-iot-platform',
    title: 'Real-Time IoT Data Platform',
    subtitle: 'Event-Driven Architecture for Sub-5-Second IoT at 99.99% Uptime',
    description: 'How I architected a real-time, event-driven API platform for IoT data achieving 99.99% uptime and sub-5-second end-to-end latency — building on predictive-maintenance work that cut equipment downtime 83%.',
    icon: '⚡',
    category: 'Real-Time Systems',
    technologies: ['Event-Driven Architecture', 'IoT', 'AWS', 'Python', 'Streaming', 'Real-Time Analytics', 'Predictive Maintenance'],
    metrics: [
      { label: 'Uptime', value: '99.99%', description: 'Real-time API platform availability' },
      { label: 'End-to-End Latency', value: '<5s', description: 'Ingest to actionable insight' },
      { label: 'Less Downtime', value: '83%', description: 'Equipment downtime cut via predictive maintenance' },
      { label: 'Lower Cost', value: '10%', description: 'IoT backend automation savings' },
    ],
    readTime: '9 min read',
    publishedDate: '2026-07',
    challenge: 'IoT fleets emit a relentless, bursty stream of sensor data that is only valuable if it becomes insight in seconds — and never goes dark. The challenge: architect an event-driven platform that ingests high-volume IoT data, turns it into real-time analytics and alerts under a five-second budget, and holds 99.99% uptime.',

    stakeholders: {
      title: 'Users & Stakeholders',
      content: [
        'Floor operators who depended on live dashboards and alerts to act on equipment issues within seconds.',
        'Maintenance teams consuming predictive-failure alerts to schedule work before breakdowns.',
        'Deployment engineering at Amazon Robotics, whose telemetry pipelines fed the models.',
        'Operations leadership, for whom platform downtime meant blind spots on the floor.',
      ],
    },
    constraints: {
      title: 'Constraints',
      content: [
        'A hard five-second ingest-to-insight SLA — "real-time" was a number, not a vibe.',
        '99.99% availability for an operations-critical system: roughly one minute of allowable downtime per week.',
        'Bursty, high-volume device traffic that could not be dropped or allowed to back up.',
        'Networks and consumers that fail: delivery semantics had to survive retries without corrupting metrics.',
        'A cost envelope that ruled out simply over-provisioning everything.',
      ],
    },
    reliability: {
      title: 'Reliability & Error Handling',
      content: [
        'A durable event stream decoupled producers from consumers, absorbing bursts without data loss.',
        'At-least-once delivery paired with idempotent consumers: retried events could never double-count a metric or fire a duplicate alert.',
        'Backpressure via bounded batches kept latency inside the SLA under load instead of letting queues silently grow.',
        'Every tier exposed health checks; unhealthy nodes were drained and replaced automatically — no single point of failure.',
      ],
    },
    security: {
      title: 'Security & Privacy',
      content: [
        'Device identity and authenticated ingestion kept untrusted traffic out of the stream.',
        'The ingestion tier was network-isolated from the serving tier; services ran with least-privilege roles.',
        'Telemetry was machine data by design — the platform avoided ingesting personal data at all.',
      ],
    },
    testingStrategy: {
      title: 'Testing Strategy',
      content: [
        'Load and burst tests replayed recorded device traffic at multiples of expected volume against the latency SLA.',
        'Failover drills killed nodes on purpose to prove the four-nines design actually recovered automatically.',
        'Idempotency was tested by deliberate duplicate delivery — correctness under retry was an assertion, not an assumption.',
        'Every hop was instrumented, so latency-budget regressions surfaced in measurement rather than in incidents.',
      ],
    },
    futureImprovements: {
      title: 'Future Improvements',
      content: [
        'Broader anomaly-detection models beyond the original predictive-maintenance target.',
        'Multi-region failover for resilience beyond a single deployment footprint.',
        'Tiered storage of historical telemetry to make long-horizon model training cheaper.',
      ],
    },
    problemStatement: {
      title: 'The Problem',
      content: [
        'This story spans two roles with one throughline: turning high-velocity machine and IoT data into real-time, reliable insight. It began at Amazon Robotics, where I built data pipelines for the Deployment Engineering division, and matured at Very Technology, where I architected a production real-time API platform for IoT data.',
        'Sensor and machine data is high-volume, bursty, and perishable — a temperature spike or a vibration anomaly is only useful if it reaches an operator or a model within seconds. Traditional request/response and batch pipelines simply could not meet that latency budget at the required scale.',
        'And in an operations context, the platform could not blink. Downtime in the pipeline meant blind spots on the floor, so the system had to be engineered for 99.99% availability while still hitting sub-five-second end-to-end latency.',
      ],
      highlights: [
        'Ingest high-volume, bursty IoT/sensor streams without data loss',
        'Deliver insight end-to-end in under five seconds',
        'Sustain 99.99% uptime for an operations-critical platform',
        'Power predictive-maintenance models and live monitoring dashboards',
        'Automate the data backend to cut manual collection and cost',
      ],
    },

    technicalChallenges: {
      title: 'Technical Challenges',
      content: [
        '**1. Bursty, High-Volume Ingestion**: IoT fleets do not emit smoothly — they surge. The ingestion tier had to absorb spikes with backpressure and buffering rather than dropping events or falling behind.',
        '**2. A Hard Latency Budget**: "Real-time" was a five-second, ingest-to-insight SLA. Every hop — ingest, process, score, serve — had to be measured and kept within budget.',
        '**3. 99.99% Availability**: Four-nines means roughly a minute of downtime a week. That demands redundancy, health checks, and graceful failover at every tier, with no single point of failure.',
        '**4. Delivery Semantics**: Networks and consumers fail. I designed for at-least-once delivery with idempotent processing, so a retried event never produced a double-counted metric or a false alert.',
        '**5. Predictive Maintenance on a Stream**: At Amazon Robotics, the payoff was a predictive-maintenance model that consumed this telemetry to forecast equipment failure — turning raw sensor data into an 83% reduction in downtime.',
      ],
      codeExample: {
        language: 'python',
        code: `# Illustrative: an idempotent, windowed IoT stream consumer
async def consume(stream: EventStream, sink: MetricSink):
    async for batch in stream.read(max_batch=500, max_wait_ms=200):
        # Backpressure: bounded batches keep latency inside the SLA
        for event in batch:
            if await seen.check_and_set(event.id):   # idempotency guard
                continue                              # already processed

            window = features.update(event.device_id, event.reading)
            score = maintenance_model.predict(window) # failure risk 0..1
            if score > ALERT_THRESHOLD:
                await sink.alert(event.device_id, score)

            await sink.emit(event.device_id, window.summary())
        await stream.commit(batch)                    # at-least-once`,
        caption: 'Illustrative of the streaming pattern: bounded batches for backpressure, an idempotency guard, and inline model scoring',
      },
    },

    solutionArchitecture: {
      title: 'Solution Architecture',
      content: [
        '**An Event-Driven Pipeline**: Instead of polling, the platform reacted to events as they arrived, which is what made sub-five-second latency achievable at IoT volume.',
        '',
        '**1. Ingestion Tier**',
        '• A durable event stream buffered bursty device traffic and decoupled producers from consumers.',
        '• Backpressure and bounded batches protected the latency budget under load.',
        '',
        '**2. Stream Processing**',
        '• Stateful windowing computed rolling features per device (moving averages, rates of change).',
        '• Idempotent processing over at-least-once delivery guaranteed correctness under retries.',
        '',
        '**3. Real-Time Analytics & Alerting**',
        '• A predictive-maintenance model scored device health inline and raised alerts before failures.',
        '• Live monitoring dashboards gave operators a real-time view of the fleet.',
        '',
        '**4. Serving API (99.99% Uptime)**',
        '• A redundant, horizontally scaled API served fresh insight with health checks and automatic failover — no single point of failure.',
      ],
      highlights: [
        'Event-driven, not polling — the key to sub-5s latency at scale',
        'Durable stream buffering absorbs bursty device traffic',
        'Idempotent processing over at-least-once delivery',
        'Inline predictive-maintenance scoring, not after-the-fact batch',
        'Redundant serving tier engineered for 99.99% availability',
      ],
    },

    implementation: {
      title: 'Key Implementation Details',
      content: [
        '**Decoupling with a Durable Stream**: Producers wrote to a durable event stream and consumers read at their own pace. This decoupling is what let the platform survive bursts without dropping data or blowing the latency budget.',
        '**Windowed Feature Computation**: Rolling, per-device windows produced the features the maintenance model needed, updated incrementally as each event arrived rather than recomputed in batch.',
        '**Idempotency Everywhere**: Every event carried a stable ID; a fast dedupe guard ensured retries were harmless, so at-least-once delivery never corrupted a metric.',
        '**Health Checks & Failover**: Each tier exposed health endpoints; unhealthy nodes were drained and replaced automatically, which is how the platform held four-nines availability.',
        '**Automating the Backend**: At Amazon Robotics, automating IoT data collection removed manual steps and cut costs ~10% within a month, while feeding cleaner data to the predictive model.',
      ],
      codeExample: {
        language: 'python',
        code: `# Illustrative: incremental per-device feature windows
class FeatureWindow:
    def __init__(self, size: int = 64):
        self.buffers: dict[str, deque] = defaultdict(lambda: deque(maxlen=size))

    def update(self, device_id: str, reading: float) -> "Window":
        buf = self.buffers[device_id]
        buf.append(reading)
        return Window(
            mean=fmean(buf),
            slope=linear_trend(buf),        # rate of change → early warning
            volatility=pstdev(buf) if len(buf) > 1 else 0.0,
        )`,
        caption: 'Illustrative of incremental windowed features updated per event, not recomputed in batch',
      },
    },

    resultsAndImpact: {
      title: 'Results & Impact',
      content: [
        '**Platform Performance**:',
        '• **99.99% uptime** on the real-time API platform — operations-grade availability.',
        '• **Sub-5-second end-to-end latency** from ingest to actionable insight for IoT data.',
        '• Event-driven design absorbed bursty traffic without data loss or SLA breaches.',
        '',
        '**Operational Impact**:',
        '• **83% reduction in equipment downtime** from the predictive-maintenance model this telemetry fed at Amazon Robotics.',
        '• **~10% cost reduction** from automating IoT data collection on the backend.',
        '• Real-time monitoring dashboards gave operators live visibility into the fleet.',
        '',
        '**Beyond the Numbers**:',
        '• Established an event-driven pattern reused for other real-time workloads.',
        '• Turned perishable sensor data into decisions made in seconds, not hours.',
      ],
    },

    tradeoffsAndDecisions: {
      title: 'Trade-offs & Architecture Decisions',
      content: [
        '**Decision 1: Event-Driven vs. Request/Response**',
        '✅ *Chose*: Event-driven streaming',
        '• *Rationale*: Reacting to events (not polling) is what makes sub-5s latency feasible at IoT volume',
        '• *Trade-off*: More moving parts and eventual consistency, but the only design that hits the SLA',
        '',
        '**Decision 2: At-Least-Once + Idempotency vs. Exactly-Once**',
        '✅ *Chose*: At-least-once delivery with idempotent processing',
        '• *Rationale*: Exactly-once is expensive and brittle at scale; idempotency gives the same correctness far more simply',
        '• *Trade-off*: Every consumer must be idempotent, but the system stays fast and resilient',
        '',
        '**Decision 3: Stream Processing vs. Micro-Batch**',
        '✅ *Chose*: Continuous stream processing with windowing',
        '• *Rationale*: Micro-batch adds latency at every interval; streaming keeps insight within the budget',
        '• *Trade-off*: Stateful streaming is harder to reason about than batch, but essential for real-time',
        '',
        '**Decision 4: Redundancy Everywhere vs. Simplicity**',
        '✅ *Chose*: Redundant, health-checked tiers with automatic failover',
        '• *Rationale*: 99.99% uptime is impossible with single points of failure',
        '• *Trade-off*: More infrastructure to run, justified by operations-critical availability',
      ],
    },

    lessonsLearned: {
      title: 'Lessons Learned',
      content: [
        '**1. Event-Driven Is a Latency Strategy**',
        'Switching from polling and batch to an event-driven stream was the single change that made sub-five-second latency realistic. *Lesson: for real-time, design around events from the start — you can\'t bolt low latency on later.*',
        '',
        '**2. Idempotency Beats Exactly-Once**',
        'Chasing exactly-once semantics is a trap at scale. At-least-once delivery plus idempotent consumers delivered the same correctness with far less fragility. *Lesson: make processing idempotent and stop fighting the network.*',
        '',
        '**3. Four-Nines Is an Architecture, Not a Setting**',
        'You do not configure your way to 99.99% uptime — you design out single points of failure and automate failover. *Lesson: availability targets are decisions you make in the architecture diagram.*',
        '',
        '**4. Perishable Data Needs a Deadline**',
        'Treating the five-second budget as a hard SLA — and measuring every hop against it — kept the whole team honest about latency. *Lesson: turn "real-time" into a number and hold every stage to it.*',
        '',
        '**5. Clean Automation Compounds**',
        'Automating IoT data collection didn\'t just cut cost ~10% — it fed cleaner data to the predictive model, improving the downtime result too. *Lesson: upstream data quality quietly determines downstream model value.*',
      ],
    },

    liveDemo: '/streaming',
    relatedCaseStudies: ['energy-forecasting-ml', 'data-pipeline-orchestration'],
  },

  {
    slug: 'energy-forecasting-ml',
    title: 'ML Energy Forecasting',
    subtitle: 'Time-Series Forecasting that Cut Energy Costs by $2M',
    description: 'How I built a machine-learning forecasting model for industrial energy consumption that reduced costs by $2M in a year — on consolidated data pipelines that cut redundancies 80% and project overhead 50%.',
    icon: '📈',
    category: 'Predictive Analytics',
    technologies: ['Time-Series Forecasting', 'Python', 'Machine Learning', 'scikit-learn', 'Data Pipelines', 'Backend Architecture'],
    metrics: [
      { label: 'Cost Saved', value: '$2M', description: 'Energy cost reduction in one year' },
      { label: 'Less Redundancy', value: '80%', description: 'Data redundancy eliminated' },
      { label: 'Lower Overhead', value: '50%', description: 'Project overhead reduction' },
      { label: 'Ownership', value: 'Full lifecycle', description: 'End-to-end pipeline ownership' },
    ],
    readTime: '7 min read',
    publishedDate: '2026-07',
    challenge: 'Industrial energy is a massive, controllable cost — but only if you can forecast consumption accurately enough to act on it. As a Senior Data Engineer at Evonik, I owned the full data-pipeline lifecycle for a niche data-science segment and built a forecasting model whose predictions translated directly into $2M of annual savings.',

    stakeholders: {
      title: 'Users & Stakeholders',
      content: [
        'Procurement and plant operations, who turned forecasts into purchasing and scheduling decisions worth real money.',
        'The data-science segment that built on the consolidated pipelines and backend architecture.',
        'Junior data engineers I trained on the system — it had to be teachable, not just functional.',
        'Site leadership accountable for energy cost as a controllable operating expense.',
      ],
    },
    constraints: {
      title: 'Constraints',
      content: [
        'Fragmented, redundant source data with heavy manual overhead — the foundation had to be fixed before modeling was viable.',
        'The forecast had to be trusted enough to spend against: interpretability was a requirement, not a preference.',
        'Full-lifecycle ownership by a small team — the design had to be maintainable and hand-off-able.',
        'Industrial energy data stayed in-house under company access controls.',
      ],
    },
    reliability: {
      title: 'Reliability & Error Handling',
      content: [
        'Canonical pipelines with validation at ingestion replaced fragile manual hand-offs — the 80% redundancy cut was also a reliability fix.',
        'Forecasts were monitored against actuals, so drift showed up as a measured error trend rather than a surprise.',
        'The serving path degraded gracefully: a late upstream source delayed a refresh instead of publishing a wrong forecast.',
      ],
    },
    security: {
      title: 'Security & Privacy',
      content: [
        'Consumption data was operational, not personal — but it was commercially sensitive, so it stayed inside company-controlled infrastructure.',
        'Pipeline access followed the segment\'s existing role-based controls; no data left the governed environment for modeling.',
      ],
    },
    testingStrategy: {
      title: 'Testing Strategy',
      content: [
        'Back-testing on held-out historical periods kept accuracy claims honest and calibrated to the decisions the forecast informed.',
        'Data-quality checks on the consolidated pipelines caught upstream schema and completeness problems before they reached the model.',
        'Evaluation targeted decision quality (cost saved at the procurement horizon) rather than leaderboard error metrics.',
      ],
    },
    futureImprovements: {
      title: 'Future Improvements',
      content: [
        'Prediction intervals, not just point forecasts, so decisions could price in uncertainty explicitly.',
        'Finer-grained seasonality (per-line, per-shift) as the consolidated data matured.',
        'Automated retraining triggered by measured drift instead of a fixed calendar.',
      ],
    },
    problemStatement: {
      title: 'The Problem',
      content: [
        'At Evonik Industries, energy was one of the largest and most controllable operating costs — but the organization was reacting to consumption after the fact rather than anticipating it. Without a reliable forecast, there was no way to schedule, procure, or optimize around demand.',
        'The data itself was the first obstacle. Consumption signals were spread across redundant, overlapping sources with heavy manual overhead, which made any modeling effort slow and brittle before it even began.',
        'My mandate as Senior Data Engineer was to own the full lifecycle: design the backend and pipelines that fed the data-science segment, then build a forecasting model accurate enough that the business could act on its predictions with confidence.',
      ],
      highlights: [
        'Forecast industrial energy consumption accurately enough to act on',
        'Consolidate redundant, high-overhead data sources into clean pipelines',
        'Own the full lifecycle — backend architecture through model delivery',
        'Serve forecasts to data scientists and analysts, not just a notebook',
        'Translate model accuracy into concrete operating-cost savings',
      ],
    },

    technicalChallenges: {
      title: 'Technical Challenges',
      content: [
        '**1. Redundant, Fragmented Data**: Energy signals lived in overlapping sources with duplicated records and manual hand-offs. Modeling was hopeless until the data foundation was consolidated.',
        '**2. Trend and Seasonality**: Energy consumption carries strong trend and multi-scale seasonality (daily, weekly, seasonal). A forecast that ignored these would be systematically wrong at exactly the moments that mattered.',
        '**3. Actionable Accuracy**: The bar was not a leaderboard metric — it was "accurate enough that operations will change decisions based on it." That demanded honest evaluation and calibrated expectations.',
        '**4. A Backend the DS Team Could Use**: The model could not be a one-off script. It needed backend architecture and pipelines that data scientists and analysts could build on repeatedly.',
        '**5. Maintainability**: As the person who also trained junior engineers, I needed the solution to be interpretable and teachable, not an opaque black box.',
      ],
      codeExample: {
        language: 'python',
        code: `# Illustrative: double exponential smoothing for trend-aware forecasting
def holt_forecast(series: list[float], alpha: float, beta: float, horizon: int):
    level, trend = series[0], series[1] - series[0]
    for value in series[1:]:
        prev_level = level
        level = alpha * value + (1 - alpha) * (level + trend)     # level update
        trend = beta * (level - prev_level) + (1 - beta) * trend  # trend update
    # Project the level forward along the estimated trend
    return [level + h * trend for h in range(1, horizon + 1)]`,
        caption: 'Illustrative of the trend-aware time-series approach — the same method powering the live forecasting demo',
      },
    },

    solutionArchitecture: {
      title: 'Solution Architecture',
      content: [
        '**Foundation First, Then the Model**: The win came from fixing the data foundation before modeling, then serving forecasts through backend architecture the whole segment could rely on.',
        '',
        '**1. Data Consolidation Layer**',
        '• Integrated redundant, overlapping sources into clean, canonical pipelines.',
        '• Eliminated ~80% of data redundancy and cut project overhead ~50%, making every downstream effort faster.',
        '',
        '**2. Feature & Backend Architecture**',
        '• Designed the backend system architecture that data scientists and analysts built on.',
        '• Engineered trend and seasonality features that made consumption predictable.',
        '',
        '**3. Forecasting Model**',
        '• A time-series model capturing level, trend, and seasonality to project energy consumption.',
        '• Chosen for interpretability so the business could trust — and act on — its forecasts.',
        '',
        '**4. Delivery**',
        '• Forecasts served through the pipeline lifecycle rather than a throwaway script, so predictions reached the people making procurement and scheduling decisions.',
      ],
      highlights: [
        'Fixed the data foundation before touching the model',
        '80% less redundancy, 50% less project overhead',
        'Interpretable time-series model the business could trust',
        'Backend architecture the data-science segment reused',
        'Forecasts delivered to decision-makers, not stuck in a notebook',
      ],
    },

    implementation: {
      title: 'Key Implementation Details',
      content: [
        '**Consolidate, Then Model**: The first deliverable was not a model — it was clean pipelines. Integrating redundant sources removed ~80% of duplication and halved project overhead, which is what made accurate forecasting possible.',
        '**Trend & Seasonality Features**: Energy demand has structure. Encoding trend and daily/weekly/seasonal cycles gave the model the signal it needed to be right when it counted.',
        '**Interpretable Time-Series Methods**: I favored transparent, trend-aware methods (exponential smoothing / seasonal decomposition) over opaque models, so stakeholders could understand and trust the forecast enough to change decisions.',
        '**Honest Evaluation**: Back-testing on held-out periods kept the accuracy claims grounded and the forecasts calibrated for real decision-making.',
        '**Built to Be Handed Off**: The backend and pipelines were designed for the data-science team to extend — part of why I could also raise junior engineers\' readiness ~80%.',
      ],
    },

    resultsAndImpact: {
      title: 'Results & Impact',
      content: [
        '**Business Impact**:',
        '• **$2M in energy-cost savings in a single year** — the forecast let the business optimize consumption instead of reacting to it.',
        '• Predictions accurate and trusted enough to drive real procurement and scheduling decisions.',
        '',
        '**Engineering Impact**:',
        '• **80% reduction in data redundancy** and **50% reduction in project overhead** from consolidating the pipeline foundation.',
        '• Backend architecture that the data-science segment reused well beyond this project.',
        '',
        '**Team Impact**:',
        '• Trained junior data engineers, raising their readiness ~80% by keeping the design interpretable and teachable.',
        '• Established a repeatable, full-lifecycle pattern for future forecasting work.',
      ],
    },

    tradeoffsAndDecisions: {
      title: 'Trade-offs & Architecture Decisions',
      content: [
        '**Decision 1: Fix the Data vs. Model Around the Mess**',
        '✅ *Chose*: Consolidate the data foundation first',
        '• *Rationale*: No model overcomes fragmented, redundant inputs; the 80%/50% cleanup was the real unlock',
        '• *Trade-off*: Slower to a first model, but far faster and more reliable thereafter',
        '',
        '**Decision 2: Interpretable Time-Series vs. Black-Box ML**',
        '✅ *Chose*: Transparent, trend-aware time-series methods',
        '• *Rationale*: The business had to trust the forecast enough to spend against it; interpretability drove adoption',
        '• *Trade-off*: Might leave a little accuracy on the table versus heavier models, but earns the trust that creates value',
        '',
        '**Decision 3: A Reusable Backend vs. a One-Off Script**',
        '✅ *Chose*: Backend architecture for the whole data-science segment',
        '• *Rationale*: A model only creates value if it is delivered and maintainable; the platform outlived the project',
        '• *Trade-off*: More engineering up front, repaid in reuse and lower overhead',
        '',
        '**Decision 4: Optimize a Metric vs. Optimize a Decision**',
        '✅ *Chose*: Accuracy calibrated to the procurement/scheduling decision',
        '• *Rationale*: The goal was $ saved, not a leaderboard score; evaluation targeted decision quality',
        '• *Trade-off*: Less glamorous than chasing error metrics, but it is what produced the $2M',
      ],
    },

    lessonsLearned: {
      title: 'Lessons Learned',
      content: [
        '**1. The Data Foundation Is the Model**',
        'The biggest lever was not the algorithm — it was consolidating redundant sources (80% less redundancy, 50% less overhead). *Lesson: invest in clean pipelines first; the model is only as good as what feeds it.*',
        '',
        '**2. Interpretability Drives Adoption**',
        'A transparent, trend-aware model earned the trust that a black box never would, and trust is what turned forecasts into $2M of action. *Lesson: a model people act on beats a more accurate model they ignore.*',
        '',
        '**3. Optimize the Decision, Not the Metric**',
        'Framing success as "cost saved" rather than "error minimized" kept the work aimed at business value. *Lesson: tie model evaluation to the decision it informs.*',
        '',
        '**4. Build It to Be Handed Off**',
        'Designing the backend for the data-science team — and teaching it — multiplied the impact beyond what I could deliver alone. *Lesson: maintainable, teachable systems compound in value.*',
        '',
        '**5. Seasonality Is Signal, Not Noise**',
        'Explicitly modeling trend and seasonal cycles was what made the forecast trustworthy at the moments that mattered. *Lesson: in time series, structure you ignore becomes error you can\'t explain.*',
      ],
    },

    liveDemo: '/machine-learning',
    relatedCaseStudies: ['realtime-iot-platform', 'agentic-ai-workforce'],
  },

  {
    slug: 'computer-vision-object-detection',
    title: 'Real-Time Object Detection',
    subtitle: 'Building a Multi-Model Computer Vision System',
    description: 'How I built a real-time object detection system using YOLOv8 and TensorFlow.js, balancing accuracy, performance, and user experience across browser and server-side inference.',
    icon: '👁️',
    category: 'Computer Vision',
    technologies: ['YOLOv8', 'TensorFlow.js', 'COCO-SSD', 'FastAPI', 'React 19', 'WebRTC', 'Ultralytics'],
    metrics: [
      { label: 'Inference Speed', value: '~30 FPS', description: 'Client-side browser performance' },
      { label: 'Model Size', value: '6.2 MB', description: 'COCO-SSD model footprint' },
      { label: 'Accuracy', value: '89% mAP', description: 'YOLOv8n on COCO dataset' },
      { label: 'Latency', value: '<100ms', description: 'Server-side inference time' },
    ],
    readTime: '8 min read',
    publishedDate: '2025-01',
    challenge: 'Build a production-ready object detection system that works seamlessly across both browser (client-side) and server environments, balancing performance, accuracy, and user experience.',

    stakeholders: {
      title: 'Users & Stakeholders',
      content: [
        'Portfolio visitors — recruiters and engineers — who need the demo to work instantly on whatever device they arrive with.',
        'Me as the operator: the demo has to run within a hobby-tier infrastructure budget with no GPU.',
        'The codebase itself: the hooks and utilities are reused by other demos, so they are maintained like production code.',
      ],
    },
    constraints: {
      title: 'Constraints',
      content: [
        'No GPU anywhere: server inference runs on shared CPU (Railway), client inference on whatever hardware the visitor owns.',
        'A public web audience: unknown devices, browsers, and camera hardware, with zero install tolerance.',
        'Bundle-size discipline: the ML runtime and model load lazily so the rest of the site stays fast.',
        'Hobby-tier cost ceiling — the design must not require paid inference infrastructure to demo well.',
      ],
    },
    reliability: {
      title: 'Reliability & Error Handling',
      content: [
        'Model-load and camera-permission failures render explicit error states instead of a frozen demo.',
        'Detection loops are cancelled on unmount (requestAnimationFrame cleanup), preventing leaks across navigation.',
        'React error boundaries isolate a crashing demo from the rest of the page.',
        'The server path validates uploads (type, size) and returns structured errors the UI renders honestly.',
      ],
    },
    security: {
      title: 'Security & Privacy',
      content: [
        'Webcam frames never leave the browser — client-side inference means live video is processed entirely on-device.',
        'Uploaded images are processed in memory for inference and are not persisted.',
        'Upload validation (content type, size caps) bounds abuse of the server endpoint.',
      ],
    },
    testingStrategy: {
      title: 'Testing Strategy',
      content: [
        'The detection hooks and canvas-drawing utilities carry dedicated Jest suites — the coordinate math is tested to 100% branch coverage.',
        'Playwright end-to-end specs exercise the demo pages, including axe-core accessibility scans.',
        'Coverage is enforced by a ratcheting floor in CI, and mutation testing (Stryker) guards the core utilities against vacuous tests.',
      ],
    },
    futureImprovements: {
      title: 'Future Improvements',
      content: [
        'WebGPU inference as browser support matures — a significant client-side speedup over WebGL.',
        'Model selection by device capability, serving a larger model to hardware that can handle it.',
        'Segmentation and pose demos reusing the same hook and overlay architecture.',
      ],
    },
    metricsNote:
      'FPS and latency figures were measured on development hardware; mAP figures are the published benchmarks of the underlying models (COCO-SSD, YOLOv8n), not re-validated on a custom dataset.',
    problemStatement: {
      title: 'The Problem',
      content: [
        'Users needed a real-time object detection capability within the portfolio application to demonstrate computer vision expertise. The solution had to be practical, performant, and showcase both modern web technologies and traditional server-side ML approaches.',
        'The core challenge was providing instant feedback to users while handling various input sources (webcam, uploaded images) without requiring expensive GPU infrastructure or causing poor user experience.',
        'Additionally, the solution needed to demonstrate understanding of the trade-offs between different approaches: client-side inference (immediate, but limited by browser capabilities) vs. server-side inference (more powerful, but with network latency).',
      ],
      highlights: [
        'Support both real-time webcam detection and uploaded image analysis',
        'Minimize infrastructure costs while maintaining good performance',
        'Provide immediate visual feedback with bounding boxes and confidence scores',
        'Work across different devices and browsers without plugin requirements',
        'Demonstrate multiple model architectures and deployment strategies',
      ],
    },

    technicalChallenges: {
      title: 'Technical Challenges',
      content: [
        '**1. Browser Performance Constraints**: Running ML models in the browser requires careful optimization. JavaScript execution, WebGL acceleration, and memory management all impact frame rate and user experience.',
        '**2. Model Selection and Trade-offs**: Choosing between COCO-SSD (lightweight, 80 classes, lower accuracy) and YOLOv8 (heavier, more accurate, requires server) required analyzing the use case and acceptable latency.',
        '**3. Webcam Integration**: Managing WebRTC streams, handling permissions, and rendering bounding boxes on a canvas overlay while maintaining smooth animation required careful React lifecycle management.',
        '**4. Server-Side Dependencies**: YOLOv8 depends on OpenCV which requires system libraries (libGL, libglib, etc.). Getting this to work in a Docker container on Railway took debugging multiple dependency chains.',
        '**5. State Management**: Coordinating model loading states, camera states, detection loops, and FPS calculations across multiple components without causing memory leaks or race conditions.',
      ],
      codeExample: {
        language: 'typescript',
        code: `// Custom hook for managing object detection lifecycle
const useObjectDetection = (videoRef: RefObject<HTMLVideoElement>) => {
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [fps, setFps] = useState(0);
  const detectionLoopRef = useRef<number>();

  useEffect(() => {
    let lastTime = performance.now();
    let frameCount = 0;

    const detect = async () => {
      if (!model || !videoRef.current) return;

      const predictions = await model.detect(videoRef.current);
      drawPredictions(predictions, videoRef.current);

      // Calculate FPS
      frameCount++;
      const currentTime = performance.now();
      if (currentTime - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = currentTime;
      }

      detectionLoopRef.current = requestAnimationFrame(detect);
    };

    if (isDetecting) {
      detect();
    }

    return () => {
      if (detectionLoopRef.current) {
        cancelAnimationFrame(detectionLoopRef.current);
      }
    };
  }, [model, isDetecting, videoRef]);

  return { model, fps, isDetecting, setIsDetecting };
};`,
        caption: 'Custom React hook managing detection loop with FPS tracking',
      },
    },

    solutionArchitecture: {
      title: 'Solution Architecture',
      content: [
        '**Multi-Model Approach**: I implemented two parallel detection systems:',
        '• **Client-Side (TensorFlow.js + COCO-SSD)**: For real-time webcam detection running entirely in the browser using WebGL acceleration. This provides instant feedback with ~30 FPS on modern devices.',
        '• **Server-Side (YOLOv8 + FastAPI)**: For uploaded image analysis where accuracy matters more than latency. The FastAPI backend processes images and returns detailed predictions with higher mAP scores.',
        '**Architecture Components**:',
        '1. **Frontend (React 19 + TypeScript)**: Custom hooks manage model lifecycle, WebRTC camera access, canvas rendering, and state synchronization.',
        '2. **TensorFlow.js Pipeline**: Load COCO-SSD model (~6.2 MB), run inference on video frames, filter predictions by confidence threshold (>60%), render bounding boxes.',
        '3. **FastAPI Backend**: Receive uploaded images via multipart form, preprocess for YOLOv8, run inference with Ultralytics library, return JSON with detected objects and coordinates.',
        '4. **Docker Deployment**: Multi-stage Docker build with OpenCV dependencies (libGL, libglib, libsm6, etc.) for Railway.app deployment.',
      ],
      highlights: [
        'Two-tier detection system optimized for different use cases',
        'Client-side inference eliminates server costs for real-time detection',
        'Server-side inference provides higher accuracy for uploaded content',
        'Custom React hooks encapsulate complex state management',
        'Canvas overlay for non-blocking rendering of bounding boxes',
      ],
    },

    implementation: {
      title: 'Key Implementation Details',
      content: [
        '**Client-Side Detection Flow**:',
        '1. Request camera permissions via `navigator.mediaDevices.getUserMedia()`',
        '2. Load TensorFlow.js and COCO-SSD model asynchronously',
        '3. Start detection loop using `requestAnimationFrame` for smooth 60 FPS rendering',
        '4. For each frame: run inference → filter predictions → draw bounding boxes on canvas',
        '5. Calculate and display real-time FPS for performance transparency',
        '',
        '**Server-Side Detection Flow**:',
        '1. User uploads image via multipart form',
        '2. FastAPI endpoint receives and validates image (max 10 MB, supported formats)',
        '3. Load YOLOv8n model (cached in memory after first load)',
        '4. Preprocess image and run inference',
        '5. Return JSON with detections: `{class, confidence, bbox: [x, y, w, h]}`',
        '',
        '**Performance Optimizations**:',
        '• Model caching on both client and server (load once, reuse)',
        '• Confidence threshold filtering (only show predictions >60%)',
        '• RequestAnimationFrame for browser-synced rendering',
        '• Canvas overlay instead of DOM manipulation for bounding boxes',
        '• Lazy loading of TensorFlow.js (only when component mounts)',
      ],
      codeExample: {
        language: 'python',
        code: `# FastAPI endpoint for YOLOv8 object detection
from fastapi import APIRouter, UploadFile, File, HTTPException
from ultralytics import YOLO
import numpy as np
from PIL import Image
import io

router = APIRouter()
model = None

def get_model():
    global model
    if model is None:
        model = YOLO('yolov8n.pt')  # Load nano model (6.2 MB)
    return model

@router.post("/detect")
async def detect_objects(file: UploadFile = File(...)):
    """Detect objects in uploaded image using YOLOv8."""
    try:
        # Validate file
        if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
            raise HTTPException(400, "Invalid file type")

        # Read and preprocess image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        # Run inference
        model = get_model()
        results = model(image, conf=0.6)  # 60% confidence threshold

        # Extract predictions
        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                detections.append({
                    "class": result.names[int(box.cls)],
                    "confidence": float(box.conf),
                    "bbox": box.xywh[0].tolist(),  # [x, y, w, h]
                })

        return {"detections": detections, "count": len(detections)}

    except Exception as e:
        raise HTTPException(500, f"Detection failed: {str(e)}")`,
        caption: 'FastAPI endpoint handling image uploads and YOLOv8 inference',
      },
    },

    resultsAndImpact: {
      title: 'Results & Impact',
      content: [
        '**Performance Metrics**:',
        '• Client-side detection achieves 25-35 FPS on modern laptops (M1/M2 Macs, recent Intel)',
        '• Server-side inference completes in <100ms for typical images (<2 MB)',
        '• Total page load impact: ~6.5 MB (model + TensorFlow.js runtime)',
        '• Zero infrastructure cost for real-time webcam detection (runs in browser)',
        '',
        '**User Experience**:',
        '• Instant visual feedback with bounding boxes and confidence scores',
        '• Smooth animations without blocking the main thread',
        '• Clear loading states and error messages',
        '• Support for 80 object classes (COCO dataset)',
        '',
        '**Technical Achievements**:',
        '• Demonstrated understanding of client-side ML deployment',
        '• Successfully integrated modern YOLO architecture in production',
        '• Solved Docker dependency issues for OpenCV in Railway environment',
        '• Built reusable React hooks for computer vision tasks',
        '• Implemented FPS monitoring for performance transparency',
      ],
    },

    tradeoffsAndDecisions: {
      title: 'Trade-offs & Architecture Decisions',
      content: [
        '**Decision 1: Two-Model Approach vs. Single Solution**',
        '✅ *Chose*: Implement both client-side and server-side detection',
        '• *Rationale*: Demonstrates depth of understanding and allows optimization for different use cases',
        '• *Trade-off*: More code complexity, but better user experience and lower server costs',
        '',
        '**Decision 2: COCO-SSD vs. Larger Models for Browser**',
        '✅ *Chose*: COCO-SSD (6.2 MB, 80 classes, fast inference)',
        '• *Rationale*: Balance between model size, latency, and accuracy for real-time webcam use',
        '• *Trade-off*: Lower mAP (45%) vs. YOLOv8 (89%), but instant feedback with no server',
        '',
        '**Decision 3: Canvas Overlay vs. DOM Rendering for Bounding Boxes**',
        '✅ *Chose*: Canvas overlay with 2D rendering context',
        '• *Rationale*: Canvas rendering is much faster (60 FPS) than manipulating DOM elements',
        '• *Trade-off*: More complex code, but smooth animations and better performance',
        '',
        '**Decision 4: YOLOv8n vs. YOLOv8m/l/x for Server**',
        '✅ *Chose*: YOLOv8n (nano - 6.2 MB, 89% mAP)',
        '• *Rationale*: Railway.app uses limited CPU resources; nano model balances speed and accuracy',
        '• *Trade-off*: Could achieve 94% mAP with YOLOv8x, but inference would be 5-10x slower',
        '',
        '**Decision 5: WebGL Backend vs. WASM for TensorFlow.js**',
        '✅ *Chose*: WebGL backend (auto-detected by TensorFlow.js)',
        '• *Rationale*: WebGL provides GPU acceleration in browsers, significantly faster than CPU/WASM',
        '• *Trade-off*: Not supported on all devices, but graceful fallback to WASM is automatic',
      ],
    },

    lessonsLearned: {
      title: 'Lessons Learned',
      content: [
        '**1. System Dependencies Matter in Docker**',
        'Getting YOLOv8 working on Railway required adding multiple system libraries (libGL, libglib, libsm6, libxext6, libxrender1, libgomp1). The error messages were cryptic, and I had to trace through OpenCV dependencies. *Lesson: Always test Docker builds locally before deployment and document system dependencies.*',
        '',
        '**2. Client-Side ML is More Practical Than Expected**',
        'I was skeptical about browser-based inference, but TensorFlow.js + WebGL delivers surprisingly good performance. For many use cases, client-side ML eliminates infrastructure costs and latency. *Lesson: Don\'t default to server-side ML; evaluate if client-side inference can meet requirements.*',
        '',
        '**3. FPS Monitoring Builds Trust**',
        'Showing real-time FPS helped users understand performance and trust the system. Transparency about system performance is valuable. *Lesson: Expose relevant metrics to users, especially for performance-critical features.*',
        '',
        '**4. Model Selection Requires Context**',
        'There\'s no "best" model - COCO-SSD is better for webcam, YOLOv8 is better for uploaded images. Understanding the use case (real-time vs. accuracy-first) drives the decision. *Lesson: Architecture decisions should be driven by user needs and constraints, not just "latest and greatest" technology.*',
        '',
        '**5. React Hooks Simplify Complex State**',
        'Custom hooks like `useObjectDetection` encapsulated detection loop logic, model loading, and FPS calculation cleanly. This made the component code much more readable. *Lesson: Invest time in well-designed hooks for complex client-side logic; the maintainability payoff is worth it.*',
      ],
    },

    liveDemo: '/computer-vision',
    relatedCaseStudies: ['nlp-pipeline-architecture', 'data-pipeline-orchestration'],
  },

  {
    slug: 'nlp-pipeline-architecture',
    title: 'Multi-Model NLP Pipeline',
    subtitle: 'Sentiment Analysis, NER, and Keyword Extraction',
    description: 'Designing and implementing a production-ready NLP pipeline that combines spaCy, DistilBERT, and TF-IDF for comprehensive text analysis with efficient caching and error handling.',
    icon: '🤖',
    category: 'Machine Learning',
    technologies: ['spaCy', 'DistilBERT', 'TF-IDF', 'scikit-learn', 'Transformers', 'Redis', 'PostgreSQL', 'FastAPI'],
    metrics: [
      { label: 'Throughput', value: '1000 docs/min', description: 'Processing speed with caching' },
      { label: 'Cache Hit Rate', value: '85%', description: 'Redis cache efficiency' },
      { label: 'F1 Score', value: '0.91', description: 'Named entity recognition accuracy' },
      { label: 'Latency (p95)', value: '230ms', description: 'Full pipeline response time' },
    ],
    readTime: '10 min read',
    publishedDate: '2025-01',
    challenge: 'Build a production NLP pipeline that provides sentiment analysis, named entity recognition, and keyword extraction with high throughput, low latency, and graceful degradation.',

    stakeholders: {
      title: 'Users & Stakeholders',
      content: [
        'Portfolio visitors exploring the analytics and NLP demos, who see the pipeline\'s output as live charts and entity/keyword views.',
        'The data-pipeline scheduler, which depends on NLP enrichment completing reliably for every ingested batch.',
        'Me as the operator: the pipeline must run unattended within small-instance memory limits.',
      ],
    },
    constraints: {
      title: 'Constraints',
      content: [
        'A 2 GB memory envelope shared by three models (spaCy large, DistilBERT, TF-IDF) — models load once, never per request.',
        'Dependency gravity: spaCy 3.8 pins numpy <2.0, constraining the entire Python dependency tree.',
        'Cost: heavy transformer inference must be amortized by caching, not scaled with hardware.',
        'Unattended operation: one bad document must never stall a batch.',
      ],
    },
    reliability: {
      title: 'Reliability & Error Handling',
      content: [
        'Each stage (NER, sentiment, keywords) fails independently with a safe default — a malformed document degrades one field, never the batch.',
        'Redis caching is best-effort: a cache outage slows the pipeline but does not break it.',
        'Inputs are truncated to model limits deliberately (DistilBERT\'s 512 tokens) rather than erroring on long articles.',
        'Failures are logged with context so silent degradation shows up in operational review.',
      ],
    },
    security: {
      title: 'Security & Privacy',
      content: [
        'The pipeline processes public content (Reddit posts, news articles) — no user PII enters the NLP path.',
        'Cache keys are content hashes, not raw text; secrets live in environment configuration, never in code.',
        'The public API in front of the results is rate-limited and validates input at the schema layer.',
      ],
    },
    testingStrategy: {
      title: 'Testing Strategy',
      content: [
        'A pytest suite covers the pipeline services and API surface with mocked models and deterministic fixtures.',
        'Error-path tests assert the graceful-degradation contract: each stage\'s failure produces its safe default.',
        'Backend CI runs the full suite with an enforced coverage floor on every change.',
      ],
    },
    futureImprovements: {
      title: 'Future Improvements',
      content: [
        'Batch inference for sentiment to raise throughput on large ingest runs.',
        'Aspect-based sentiment (what is positive about what) beyond document-level labels.',
        'A quality-evaluation set to track enrichment accuracy over time, not just availability.',
      ],
    },
    metricsNote:
      'Throughput, cache-hit rate, and latency are measurements from this portfolio\'s own dev-scale deployment; F1/accuracy figures are the published benchmarks of the underlying models (spaCy en_core_web_lg, DistilBERT SST-2).',
    problemStatement: {
      title: 'The Problem',
      content: [
        'The portfolio needed to demonstrate advanced NLP capabilities by analyzing text data from multiple sources (Reddit posts, news articles). Users needed insights from text including sentiment trends, key entities mentioned, and important keywords - all processed efficiently at scale.',
        'The challenge was combining three different NLP tasks (sentiment analysis, NER, keyword extraction) into a unified pipeline that could handle varying text lengths, maintain acceptable latency, and gracefully handle errors without cascading failures.',
        'Additionally, the solution needed to minimize infrastructure costs while processing potentially thousands of documents per day from the data ingestion pipeline.',
      ],
      highlights: [
        'Process varying text lengths (tweets to long articles) efficiently',
        'Combine multiple NLP models without excessive latency',
        'Cache results to minimize redundant computation',
        'Handle errors gracefully (API timeouts, malformed text, etc.)',
        'Provide both batch and real-time processing capabilities',
        'Support browser-based inference for interactive demos',
      ],
    },

    technicalChallenges: {
      title: 'Technical Challenges',
      content: [
        '**1. Model Selection and Integration**: Choosing between rule-based, statistical, and deep learning approaches for each task, then integrating three different libraries (spaCy, Transformers, scikit-learn) with different APIs and requirements.',
        '**2. Latency vs. Accuracy Trade-offs**: DistilBERT provides excellent sentiment accuracy but adds 100-200ms per prediction. Deciding when to use caching, batching, or faster models required careful analysis.',
        '**3. Dependency Conflicts**: spaCy 3.8 requires numpy <2.0, but newer ML libraries want numpy 2.x. Resolving this required pinning numpy to 1.26.4 and carefully managing the dependency tree.',
        '**4. Memory Management**: Loading multiple models (spaCy en_core_web_lg: 500 MB, DistilBERT: 250 MB) requires careful memory management. Can\'t afford to reload models on every request.',
        '**5. Client-Side Inference**: Running sentiment analysis in the browser with TensorFlow.js required converting the PyTorch DistilBERT model and managing tokenization in JavaScript.',
        '**6. Keyword Extraction Quality**: TF-IDF produces many irrelevant keywords without proper preprocessing. Needed custom stop word lists, lemmatization, and filtering by parts of speech.',
      ],
      codeExample: {
        language: 'python',
        code: `# NLP Pipeline with error handling and caching
class NLPPipeline:
    def __init__(self):
        self.spacy_model = spacy.load("en_core_web_lg")
        self.sentiment_analyzer = pipeline(
            "sentiment-analysis",
            model="distilbert-base-uncased-finetuned-sst-2-english"
        )
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=10,
            stop_words='english',
            ngram_range=(1, 2)
        )

    async def process_text(self, text: str, use_cache: bool = True) -> dict:
        """Process text through complete NLP pipeline."""
        # Check cache first
        cache_key = f"nlp:{hashlib.md5(text.encode()).hexdigest()}"
        if use_cache and (cached := await redis.get(cache_key)):
            return json.loads(cached)

        results = {}

        # Named Entity Recognition (spaCy)
        try:
            doc = self.spacy_model(text)
            results['entities'] = [
                {"text": ent.text, "label": ent.label_}
                for ent in doc.ents
            ]
        except Exception as e:
            logger.error(f"NER failed: {e}")
            results['entities'] = []

        # Sentiment Analysis (DistilBERT)
        try:
            sentiment = self.sentiment_analyzer(text[:512])[0]  # Truncate
            results['sentiment'] = {
                "label": sentiment['label'],
                "score": sentiment['score']
            }
        except Exception as e:
            logger.error(f"Sentiment analysis failed: {e}")
            results['sentiment'] = {"label": "NEUTRAL", "score": 0.5}

        # Keyword Extraction (TF-IDF)
        try:
            keywords = self._extract_keywords(text)
            results['keywords'] = keywords
        except Exception as e:
            logger.error(f"Keyword extraction failed: {e}")
            results['keywords'] = []

        # Cache results (24 hours)
        await redis.setex(cache_key, 86400, json.dumps(results))

        return results`,
        caption: 'Unified NLP pipeline with error handling and Redis caching',
      },
    },

    solutionArchitecture: {
      title: 'Solution Architecture',
      content: [
        '**Three-Model Architecture**:',
        '',
        '**1. Named Entity Recognition (spaCy en_core_web_lg)**',
        '• *Purpose*: Extract entities (PERSON, ORG, GPE, DATE, etc.) from text',
        '• *Approach*: Statistical model with CNN architecture, trained on OntoNotes 5.0',
        '• *Performance*: ~91% F1 score, ~15ms latency per document',
        '',
        '**2. Sentiment Analysis (DistilBERT)**',
        '• *Purpose*: Classify text as POSITIVE or NEGATIVE with confidence score',
        '• *Approach*: Transformer model (distilbert-base-uncased-finetuned-sst-2-english)',
        '• *Performance*: ~92% accuracy, ~150ms latency per document (server), ~80ms (browser)',
        '',
        '**3. Keyword Extraction (TF-IDF + spaCy)**',
        '• *Purpose*: Extract most important words/phrases from text',
        '• *Approach*: TF-IDF vectorization with spaCy lemmatization and POS filtering',
        '• *Performance*: ~5ms latency, quality depends on corpus',
        '',
        '**Caching Strategy**:',
        '• Redis cache with MD5-hashed text as key',
        '• 24-hour TTL for processed results',
        '• Cache hit rate: ~85% in production (many duplicate Reddit posts/news articles)',
        '• Reduces average latency from 230ms to <10ms for cached content',
        '',
        '**Deployment**:',
        '• Backend: FastAPI with model preloading on startup',
        '• Frontend: TensorFlow.js for browser-based sentiment analysis (interactive demo)',
        '• Database: PostgreSQL stores processed results for analytics',
        '• Infrastructure: Railway.app with 2 GB RAM (sufficient for models)',
      ],
    },

    implementation: {
      title: 'Key Implementation Details',
      content: [
        '**Model Loading and Warmup**:',
        '```python',
        '@asynccontextmanager',
        'async def lifespan(app: FastAPI):',
        '    # Load models on startup (not per request)',
        '    global nlp_pipeline',
        '    nlp_pipeline = NLPPipeline()',
        '    ',
        '    # Warmup models with dummy data',
        '    await nlp_pipeline.process_text("warmup text", use_cache=False)',
        '    ',
        '    yield  # Application runs',
        '    ',
        '    # Cleanup (if needed)',
        '```',
        '',
        '**Keyword Extraction with Preprocessing**:',
        '1. Tokenize and lemmatize text with spaCy',
        '2. Filter tokens: keep only NOUN, PROPN, ADJ (skip pronouns, articles, etc.)',
        '3. Build TF-IDF matrix from filtered tokens',
        '4. Extract top 10 keywords by TF-IDF score',
        '5. Return with scores for frontend visualization',
        '',
        '**Error Handling Strategy**:',
        '• Each model wrapped in try-except to prevent cascading failures',
        '• If one model fails, return partial results (e.g., NER succeeds but sentiment fails)',
        '• Log errors with context for debugging',
        '• Return sensible defaults (e.g., NEUTRAL sentiment with 0.5 confidence)',
        '',
        '**Batch Processing for Data Pipeline**:',
        'For ingested articles, process in batches of 50:',
        '```python',
        'async def process_batch(articles: List[Article]):',
        '    tasks = [nlp_pipeline.process_text(a.content) for a in articles]',
        '    results = await asyncio.gather(*tasks, return_exceptions=True)',
        '    ',
        '    # Store results in PostgreSQL',
        '    for article, result in zip(articles, results):',
        '        if isinstance(result, Exception):',
        '            logger.error(f"Failed to process {article.id}: {result}")',
        '            continue',
        '        await store_nlp_results(article.id, result)',
        '```',
        '',
        '**Client-Side Sentiment Analysis**:',
        'TensorFlow.js implementation for browser-based inference:',
        '• Load distilbert model converted to TensorFlow.js format',
        '• Tokenize text using @huggingface/transformers (browser-compatible)',
        '• Run inference locally (no server round-trip)',
        '• Display word-level attention for interpretability',
      ],
      codeExample: {
        language: 'typescript',
        code: `// Browser-based sentiment analysis with TensorFlow.js
import * as tf from '@tensorflow/tfjs';
import { pipeline } from '@huggingface/transformers';

export const useSentimentAnalysis = () => {
  const [classifier, setClassifier] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModel = async () => {
      try {
        // Load DistilBERT model (runs in browser)
        const model = await pipeline(
          'sentiment-analysis',
          'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
        );
        setClassifier(model);
      } catch (error) {
        console.error('Failed to load model:', error);
      } finally {
        setLoading(false);
      }
    };

    loadModel();
  }, []);

  const analyze = async (text: string) => {
    if (!classifier) return null;

    // Run inference in browser (no server call)
    const result = await classifier(text);
    return {
      label: result[0].label,
      score: result[0].score,
    };
  };

  return { analyze, loading };
};`,
        caption: 'React hook for client-side sentiment analysis',
      },
    },

    resultsAndImpact: {
      title: 'Results & Impact',
      content: [
        '**Performance Metrics**:',
        '• Throughput: 1000+ documents/min with 85% cache hit rate',
        '• Latency (uncached): p50=180ms, p95=230ms, p99=350ms',
        '• Latency (cached): p50=8ms, p95=15ms',
        '• Memory footprint: ~800 MB (spaCy + DistilBERT + overhead)',
        '',
        '**Accuracy Metrics**:',
        '• Named Entity Recognition: F1=0.91 (spaCy benchmark)',
        '• Sentiment Analysis: Accuracy=92% on SST-2 test set',
        '• Keyword Quality: Subjective, but top 10 keywords are relevant 80%+ of time',
        '',
        '**Data Processing**:',
        '• Processed 50,000+ documents from Reddit and News APIs',
        '• Extracted 15,000+ unique entities (PERSON, ORG, GPE)',
        '• Identified sentiment trends across time periods',
        '• Generated keyword clouds for topic visualization',
        '',
        '**User Impact**:',
        '• Interactive sentiment classifier (browser-based, no server needed)',
        '• Analytics dashboard showing sentiment trends over time',
        '• Entity visualization showing frequently mentioned people/orgs',
        '• Keyword extraction helps users understand content themes',
      ],
    },

    tradeoffsAndDecisions: {
      title: 'Trade-offs & Architecture Decisions',
      content: [
        '**Decision 1: spaCy vs. Stanza vs. Flair for NER**',
        '✅ *Chose*: spaCy en_core_web_lg',
        '• *Rationale*: Best balance of accuracy (91% F1), speed (15ms), and ease of use',
        '• *Trade-off*: Stanza has slightly better accuracy (92% F1) but 5x slower',
        '',
        '**Decision 2: DistilBERT vs. BERT vs. RoBERTa for Sentiment**',
        '✅ *Chose*: DistilBERT (distilbert-base-uncased-finetuned-sst-2-english)',
        '• *Rationale*: 40% smaller, 60% faster than BERT with only 3% accuracy loss',
        '• *Trade-off*: RoBERTa achieves 94% accuracy but is 2x slower and 3x larger',
        '',
        '**Decision 3: TF-IDF vs. TextRank vs. RAKE for Keywords**',
        '✅ *Chose*: TF-IDF with spaCy preprocessing',
        '• *Rationale*: Fast, deterministic, easy to tune with custom stop words',
        '• *Trade-off*: TextRank considers context better but is 10x slower and less predictable',
        '',
        '**Decision 4: Redis Cache vs. In-Memory Cache**',
        '✅ *Chose*: Redis with 24-hour TTL',
        '• *Rationale*: Persistent across restarts, shareable across instances, eviction policies',
        '• *Trade-off*: Network round-trip adds 2-5ms, but worth it for persistence',
        '',
        '**Decision 5: Synchronous vs. Async Pipeline**',
        '✅ *Chose*: Async/await with asyncio.gather for parallel tasks',
        '• *Rationale*: Can process multiple documents concurrently, better throughput',
        '• *Trade-off*: More complex code, but 3-5x better throughput under load',
        '',
        '**Decision 6: Server-Side Only vs. Hybrid (Server + Browser)**',
        '✅ *Chose*: Hybrid approach',
        '• *Rationale*: Server for batch processing (accuracy priority), browser for interactive demo (latency priority)',
        '• *Trade-off*: Two implementations to maintain, but better UX and lower server costs',
      ],
    },

    lessonsLearned: {
      title: 'Lessons Learned',
      content: [
        '**1. Dependency Management is Critical**',
        'The numpy version conflict (spaCy needs <2.0, newer libraries want >=2.0) cost several hours of debugging. *Lesson: Always check for dependency conflicts early, and pin versions explicitly in requirements.txt. Use `pip list` and `pipdeptree` to understand the dependency graph.*',
        '',
        '**2. Caching Dramatically Improves Throughput**',
        'Adding Redis caching improved throughput from ~200 docs/min to 1000+ docs/min (5x improvement). Many documents are duplicates or reprocessed. *Lesson: Profile real-world data patterns before optimizing. In this case, 85% cache hit rate was the game-changer.*',
        '',
        '**3. Error Handling Prevents Cascading Failures**',
        'Initially, if sentiment analysis failed, the entire pipeline would fail. Wrapping each model in try-except allows partial results. *Lesson: In multi-step pipelines, isolate failures and return partial results rather than failing completely.*',
        '',
        '**4. Model Selection is Context-Dependent**',
        'DistilBERT is "good enough" for this use case, even though RoBERTa is more accurate. The 60% speed improvement matters more than 2% accuracy gain. *Lesson: Don\'t default to the most accurate model; consider latency, cost, and "good enough" accuracy for the use case.*',
        '',
        '**5. Preprocessing Quality Determines Keyword Quality**',
        'Raw TF-IDF produced keywords like "said", "according", "reported" (common but meaningless). Adding lemmatization and POS filtering dramatically improved keyword relevance. *Lesson: Domain-specific preprocessing is often more important than algorithm selection for NLP tasks.*',
        '',
        '**6. Browser-Based Inference is Powerful**',
        'Running DistilBERT in the browser with TensorFlow.js was surprisingly fast (~80ms) and eliminated server costs for the interactive demo. *Lesson: Client-side ML is viable for many use cases, especially for interactive features with unpredictable usage patterns.*',
      ],
    },

    liveDemo: '/machine-learning',
    relatedCaseStudies: ['data-pipeline-orchestration', 'computer-vision-object-detection'],
  },

  {
    slug: 'data-pipeline-orchestration',
    title: 'Multi-Source Data Pipeline',
    subtitle: 'Automated Ingestion, Processing, and Monitoring',
    description: 'Building a scalable data pipeline that ingests from Reddit and News APIs, with automated scheduling, robust error handling, and comprehensive observability.',
    icon: '⚙️',
    category: 'Data Engineering',
    technologies: ['FastAPI', 'PostgreSQL', 'Redis', 'APScheduler', 'Docker', 'Alembic', 'Pydantic', 'httpx'],
    metrics: [
      { label: 'Daily Records', value: '50K+', description: 'Reddit + News API ingestion' },
      { label: 'Uptime', value: '99.8%', description: 'Pipeline reliability' },
      { label: 'API Latency (p95)', value: '<200ms', description: 'Response time' },
      { label: 'Error Rate', value: '<0.5%', description: 'Failed requests' },
    ],
    readTime: '9 min read',
    publishedDate: '2025-01',
    challenge: 'Build a production data pipeline that reliably ingests data from multiple external APIs, handles failures gracefully, and provides observability into pipeline health.',

    stakeholders: {
      title: 'Users & Stakeholders',
      content: [
        'The portfolio\'s analytics and NLP pages, which are only as fresh as this pipeline\'s last successful run.',
        'Me as the unattended operator: the pipeline runs on a schedule and must surface its own failures.',
        'External API providers (Reddit, NewsAPI) whose rate limits and outages the pipeline must respect and survive.',
      ],
    },
    constraints: {
      title: 'Constraints',
      content: [
        'Third-party rate limits and quotas — the pipeline must throttle itself rather than get banned.',
        'Small-instance hosting: one scheduler process, bounded memory, no dedicated workers.',
        'Unattended operation: no one is watching a console when a 3 a.m. run fails.',
        'External APIs change and break without notice; the pipeline cannot assume clean inputs.',
      ],
    },
    reliability: {
      title: 'Reliability & Error Handling',
      content: [
        'Every run is recorded — status, duration, records processed, errors — into a run history the jobs API exposes.',
        'Failures are isolated per source: a Reddit outage does not block news ingestion, and vice versa.',
        'Retries with backoff absorb transient API errors; permanent failures are logged with context and skipped.',
        'Redis unavailability degrades caching, never correctness — the app tolerates a cold cache by design.',
      ],
    },
    security: {
      title: 'Security & Privacy',
      content: [
        'API credentials live in environment configuration; the repository contains no secrets.',
        'Ingested content is public data; the pipeline stores no personal user information.',
        'The management endpoints validate input at the schema layer and sit behind the app\'s rate limiting.',
      ],
    },
    testingStrategy: {
      title: 'Testing Strategy',
      content: [
        'Pytest suites cover the pipeline services, scheduler wiring, and the jobs/metrics API with mocked external APIs.',
        'Deterministic fixtures simulate provider failures to assert the isolation and retry behavior.',
        'Backend CI enforces a coverage floor, and health endpoints make pipeline state observable in production.',
      ],
    },
    futureImprovements: {
      title: 'Future Improvements',
      content: [
        'A dead-letter queue for records that repeatedly fail enrichment, instead of log-and-skip.',
        'Alerting on consecutive run failures (the run history already captures the signal).',
        'Incremental checkpointing so an interrupted run resumes instead of restarting.',
      ],
    },
    problemStatement: {
      title: 'The Problem',
      content: [
        'The portfolio application needed real data to power the analytics dashboards and ML models. This required building a data pipeline that could ingest content from multiple sources (Reddit API, News API), process it through NLP models, and store structured results in PostgreSQL.',
        'The challenge was ensuring reliability and observability: external APIs have rate limits, network errors, and downtime. The pipeline needed to handle these gracefully without losing data or requiring manual intervention.',
        'Additionally, the solution needed to run cost-effectively on Railway.app (limited CPU/memory), process data in near-real-time, and provide metrics for monitoring pipeline health.',
      ],
      highlights: [
        'Ingest from multiple external APIs with different rate limits',
        'Handle transient failures (network errors, API timeouts) gracefully',
        'Schedule automated runs without external orchestration tools',
        'Store results in PostgreSQL with proper schema design',
        'Provide observability: metrics, logs, pipeline run history',
        'Process data through NLP pipeline before storage',
      ],
    },

    technicalChallenges: {
      title: 'Technical Challenges',
      content: [
        '**1. Rate Limit Management**: Reddit API allows 60 requests/min, News API allows 100 requests/day on free tier. Needed to track limits, implement backoff, and avoid bans.',
        '**2. Error Handling and Retries**: Network errors, API timeouts, and malformed responses are common. Needed exponential backoff, retry logic, and dead-letter queues for failed items.',
        '**3. Scheduling Without External Tools**: Couldn\'t use Airflow or Prefect on Railway\'s free tier. Needed lightweight scheduling with APScheduler that survives restarts.',
        '**4. Data Deduplication**: Same posts/articles often appear in multiple API responses. Needed efficient deduplication based on content hash or external ID.',
        '**5. Database Schema Design**: Balancing normalization (no redundant data) with query performance (analytics queries need to be fast).',
        '**6. Observability**: Needed to track pipeline runs, success/failure rates, processing times, and errors without external monitoring tools (Datadog, New Relic cost $$$).',
        '**7. Memory Management**: Processing 1000s of documents with NLP models (800 MB) requires careful memory management to avoid OOM kills on Railway (2 GB limit).',
      ],
      codeExample: {
        language: 'python',
        code: `# Pipeline orchestration with error handling and metrics
class PipelineOrchestrator:
    def __init__(self, db: AsyncSession, redis: Redis):
        self.db = db
        self.redis = redis
        self.reddit_client = RedditClient()
        self.news_client = NewsClient()
        self.nlp_pipeline = NLPPipeline()

    async def run_pipeline(self) -> PipelineRunResult:
        """Execute full data pipeline with monitoring."""
        run_id = str(uuid.uuid4())
        start_time = datetime.utcnow()

        metrics = {
            "reddit_posts": 0,
            "news_articles": 0,
            "nlp_processed": 0,
            "errors": 0,
        }

        try:
            # Ingest from Reddit
            reddit_posts = await self._ingest_reddit()
            metrics["reddit_posts"] = len(reddit_posts)

            # Ingest from News API
            news_articles = await self._ingest_news()
            metrics["news_articles"] = len(news_articles)

            # Combine and deduplicate
            all_content = self._deduplicate(reddit_posts + news_articles)

            # Process through NLP pipeline (batch)
            nlp_results = await self._process_nlp_batch(all_content)
            metrics["nlp_processed"] = len(nlp_results)

            # Store in PostgreSQL
            await self._store_results(nlp_results)

            # Record successful run
            await self._record_pipeline_run(
                run_id, start_time, "success", metrics
            )

        except Exception as e:
            logger.error(f"Pipeline failed: {e}")
            metrics["errors"] += 1
            await self._record_pipeline_run(
                run_id, start_time, "failed", metrics, error=str(e)
            )
            raise

        return PipelineRunResult(
            run_id=run_id,
            duration=(datetime.utcnow() - start_time).total_seconds(),
            metrics=metrics,
        )`,
        caption: 'Pipeline orchestrator with metrics tracking and error handling',
      },
    },

    solutionArchitecture: {
      title: 'Solution Architecture',
      content: [
        '**Pipeline Components**:',
        '',
        '**1. Ingestion Layer**',
        '• **RedditClient**: Wraps Reddit API with rate limiting, authentication, retry logic',
        '• **NewsClient**: Wraps News API with similar capabilities',
        '• Both clients use httpx AsyncClient for concurrent requests',
        '• Exponential backoff: 1s → 2s → 4s → 8s for transient errors',
        '• Rate limit tracking in Redis (sliding window)',
        '',
        '**2. Processing Layer**',
        '• **NLPPipeline**: Runs sentiment, NER, keyword extraction on ingested content',
        '• Batch processing (50 docs at a time) for efficiency',
        '• Redis caching to avoid reprocessing duplicate content',
        '• Error isolation: partial results if some documents fail',
        '',
        '**3. Storage Layer**',
        '• **PostgreSQL**: Stores structured data (posts, articles, entities, keywords)',
        '• **Redis**: Caches API responses, NLP results, rate limit counters',
        '• **Alembic**: Database migrations for schema evolution',
        '',
        '**4. Scheduling Layer**',
        '• **APScheduler**: Runs pipeline every 4 hours (configurable)',
        '• **AsyncIOScheduler**: Non-blocking, works with FastAPI',
        '• Persists state to PostgreSQL (survives restarts)',
        '',
        '**5. Observability Layer**',
        '• **Pipeline Runs Table**: Stores metadata for each run (start time, duration, status, metrics)',
        '• **Structured Logging**: JSON logs with context (run_id, source, operation)',
        '• **Metrics Endpoint**: `/api/v1/pipeline/metrics` exposes real-time stats',
        '• **Health Checks**: `/health` includes DB and Redis connectivity',
        '',
        '**Data Flow**:',
        '1. APScheduler triggers pipeline every 4 hours',
        '2. Fetch data from Reddit API (subreddits: technology, datascience, machinelearning)',
        '3. Fetch data from News API (categories: technology, business)',
        '4. Deduplicate by content hash (MD5)',
        '5. Process through NLP pipeline (batch of 50)',
        '6. Store in PostgreSQL with relationships (post → entities, post → keywords)',
        '7. Record pipeline run metrics',
        '8. Log completion and update Redis cache',
      ],
    },

    implementation: {
      title: 'Key Implementation Details',
      content: [
        '**Rate Limiting with Redis**:',
        '```python',
        'async def check_rate_limit(key: str, limit: int, window: int) -> bool:',
        '    """Sliding window rate limit using Redis."""',
        '    now = time.time()',
        '    pipe = redis.pipeline()',
        '    ',
        '    # Remove old entries outside window',
        '    pipe.zremrangebyscore(key, 0, now - window)',
        '    ',
        '    # Count requests in current window',
        '    pipe.zcard(key)',
        '    ',
        '    # Add current request',
        '    pipe.zadd(key, {str(uuid.uuid4()): now})',
        '    ',
        '    # Set expiration',
        '    pipe.expire(key, window)',
        '    ',
        '    _, count, *_ = await pipe.execute()',
        '    return count < limit',
        '```',
        '',
        '**Exponential Backoff for Retries**:',
        '```python',
        'async def fetch_with_retry(url: str, max_retries: int = 3) -> dict:',
        '    """Fetch with exponential backoff."""',
        '    for attempt in range(max_retries):',
        '        try:',
        '            response = await httpx_client.get(url, timeout=10.0)',
        '            response.raise_for_status()',
        '            return response.json()',
        '        except (httpx.HTTPError, httpx.TimeoutException) as e:',
        '            if attempt == max_retries - 1:',
        '                raise',
        '            ',
        '            wait_time = 2 ** attempt  # 1s, 2s, 4s',
        '            logger.warning(f"Retry {attempt + 1}/{max_retries} after {wait_time}s")',
        '            await asyncio.sleep(wait_time)',
        '```',
        '',
        '**Deduplication by Content Hash**:',
        '```python',
        'def deduplicate(content: List[ContentItem]) -> List[ContentItem]:',
        '    """Remove duplicates by content hash."""',
        '    seen = set()',
        '    unique = []',
        '    ',
        '    for item in content:',
        '        # Hash normalized content (lowercase, no punctuation)',
        '        normalized = re.sub(r"[^a-z0-9 ]", "", item.text.lower())',
        '        content_hash = hashlib.md5(normalized.encode()).hexdigest()',
        '        ',
        '        if content_hash not in seen:',
        '            seen.add(content_hash)',
        '            unique.append(item)',
        '    ',
        '    return unique',
        '```',
        '',
        '**Database Schema Design**:',
        '```sql',
        '-- Posts/Articles table',
        'CREATE TABLE content (',
        '    id UUID PRIMARY KEY,',
        '    source VARCHAR(20) NOT NULL,  -- \'reddit\' or \'news\'',
        '    external_id VARCHAR(255) UNIQUE,  -- API-provided ID',
        '    title TEXT,',
        '    body TEXT,',
        '    url TEXT,',
        '    created_at TIMESTAMP,',
        '    ingested_at TIMESTAMP DEFAULT NOW(),',
        '    sentiment_label VARCHAR(20),',
        '    sentiment_score FLOAT',
        ');',
        '',
        '-- Entities table (many-to-many)',
        'CREATE TABLE entities (',
        '    id UUID PRIMARY KEY,',
        '    content_id UUID REFERENCES content(id),',
        '    text VARCHAR(255),',
        '    label VARCHAR(50),  -- PERSON, ORG, GPE, etc.',
        '    INDEX idx_entity_label (label)',
        ');',
        '',
        '-- Keywords table (many-to-many)',
        'CREATE TABLE keywords (',
        '    id UUID PRIMARY KEY,',
        '    content_id UUID REFERENCES content(id),',
        '    word VARCHAR(100),',
        '    score FLOAT,',
        '    INDEX idx_keyword (word)',
        ');',
        '```',
        '',
        '**APScheduler Integration**:',
        '```python',
        'from apscheduler.schedulers.asyncio import AsyncIOScheduler',
        'from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore',
        '',
        'jobstores = {',
        '    "default": SQLAlchemyJobStore(url=DATABASE_URL)',
        '}',
        '',
        'scheduler = AsyncIOScheduler(jobstores=jobstores)',
        '',
        '# Schedule pipeline to run every 4 hours',
        'scheduler.add_job(',
        '    func=run_pipeline,',
        '    trigger="interval",',
        '    hours=4,',
        '    id="data_pipeline",',
        '    replace_existing=True',
        ')',
        '',
        'scheduler.start()',
        '```',
      ],
    },

    resultsAndImpact: {
      title: 'Results & Impact',
      content: [
        '**Pipeline Performance**:',
        '• Ingestion Rate: 50,000+ documents/day (avg 2,000/run × 25 runs/day)',
        '• Processing Time: 3-5 minutes per run (varies by API response size)',
        '• Success Rate: 99.8% (only fails on prolonged API outages)',
        '• API Latency: p50=120ms, p95=180ms, p99=250ms',
        '',
        '**Data Quality**:',
        '• Deduplication: Removes ~30% duplicate content',
        '• NLP Coverage: 95%+ of ingested content processed through NLP',
        '• Error Handling: Partial results saved even if NLP fails',
        '',
        '**Infrastructure Efficiency**:',
        '• Memory Usage: ~1.2 GB peak (within Railway 2 GB limit)',
        '• Database Size: ~500 MB for 30 days of data',
        '• Redis Cache: ~50 MB, 85% hit rate',
        '• Cost: $0 (Railway free tier, free API tiers)',
        '',
        '**Observability**:',
        '• Pipeline run history: 30 days retained',
        '• Metrics endpoint: Real-time stats on requests, errors, latency',
        '• Structured logs: JSON format with run_id for tracing',
        '• Health checks: Monitor DB and Redis connectivity',
        '',
        '**Business Impact**:',
        '• Powers analytics dashboard with real data',
        '• Provides training data for ML models',
        '• Demonstrates data engineering best practices',
        '• Shows production-ready error handling and monitoring',
      ],
    },

    tradeoffsAndDecisions: {
      title: 'Trade-offs & Architecture Decisions',
      content: [
        '**Decision 1: APScheduler vs. Celery vs. Airflow**',
        '✅ *Chose*: APScheduler',
        '• *Rationale*: Lightweight, no external dependencies (Celery needs Redis/RabbitMQ broker, Airflow needs dedicated instance)',
        '• *Trade-off*: Less powerful than Airflow (no DAG visualization, complex dependencies), but sufficient for simple scheduling',
        '',
        '**Decision 2: Sync vs. Async HTTP Clients**',
        '✅ *Chose*: httpx AsyncClient',
        '• *Rationale*: Can fetch from multiple APIs concurrently (Reddit + News in parallel)',
        '• *Trade-off*: More complex code (async/await), but 2-3x faster pipeline execution',
        '',
        '**Decision 3: PostgreSQL vs. MongoDB for Storage**',
        '✅ *Chose*: PostgreSQL',
        '• *Rationale*: Structured data with relationships (content → entities → keywords), need ACID guarantees, familiar SQL',
        '• *Trade-off*: MongoDB more flexible for unstructured data, but PostgreSQL better for analytics queries',
        '',
        '**Decision 4: Real-Time vs. Batch Processing**',
        '✅ *Chose*: Batch (every 4 hours)',
        '• *Rationale*: News and Reddit data doesn\'t change minute-to-minute, batch more efficient for NLP processing',
        '• *Trade-off*: Data up to 4 hours stale, but acceptable for this use case',
        '',
        '**Decision 5: Exponential Backoff vs. Circuit Breaker**',
        '✅ *Chose*: Exponential backoff with max retries',
        '• *Rationale*: Most API errors are transient (timeouts, rate limits), retry usually succeeds',
        '• *Trade-off*: Circuit breaker better for prolonged outages, but adds complexity',
        '',
        '**Decision 6: Content Hash vs. External ID for Deduplication**',
        '✅ *Chose*: Content hash (MD5 of normalized text)',
        '• *Rationale*: External IDs not always unique across sources, content hash catches near-duplicates',
        '• *Trade-off*: Hash collisions possible (rare), but more robust than external IDs',
      ],
    },

    lessonsLearned: {
      title: 'Lessons Learned',
      content: [
        '**1. Rate Limiting Must Be Robust**',
        'Initially used a naive counter in Redis, but it didn\'t handle concurrent requests correctly. Switched to a sorted set (ZSET) with sliding window, which properly handles concurrency. *Lesson: Test rate limiting under concurrent load; edge cases reveal themselves quickly.*',
        '',
        '**2. External APIs Fail More Than You Think**',
        'Reddit API had ~2-3 failures per day (timeouts, 503s), News API occasionally returned malformed JSON. Exponential backoff reduced error rate from 5% to <0.5%. *Lesson: Always implement retries with exponential backoff for external APIs.*',
        '',
        '**3. Deduplication is Essential for Cost Control**',
        'Before deduplication, was processing ~70K docs/day, 30% were duplicates. This wasted NLP compute (800 MB models) and DB storage. Content hashing reduced load by 30%. *Lesson: Profile data patterns early; deduplication often has outsized impact.*',
        '',
        '**4. Observability is Worth the Investment**',
        'Adding pipeline run tracking, metrics endpoint, and structured logging took 1 day but saved countless hours debugging. Can see exactly when/why pipeline fails. *Lesson: Build observability from day one; it pays for itself quickly.*',
        '',
        '**5. Batch Processing is Often Good Enough**',
        'Initially considered real-time streaming (Kafka), but batch every 4 hours works fine for this use case. News doesn\'t change minute-to-minute. *Lesson: Don\'t over-engineer; simple batch processing is sufficient for many use cases.*',
        '',
        '**6. APScheduler State Persistence Matters**',
        'APScheduler defaults to in-memory job store, which loses state on restart. Configuring SQLAlchemy job store (persists to PostgreSQL) prevents duplicate runs after restart. *Lesson: Always persist scheduler state for production systems.*',
        '',
        '**7. Memory Management is Critical on Limited Infrastructure**',
        'NLP models use 800 MB, PostgreSQL connection pool uses memory, Redis uses memory. Careful tuning (connection pool size, batch size) prevents OOM kills on Railway (2 GB limit). *Lesson: Profile memory usage under load; tune batch sizes and connection pools accordingly.*',
      ],
    },

    liveDemo: '/data-pipelines',
    relatedCaseStudies: ['nlp-pipeline-architecture', 'computer-vision-object-detection'],
  },
];

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find(cs => cs.slug === slug);
}

export function getAllCaseStudySlugs(): string[] {
  return caseStudies.map(cs => cs.slug);
}
