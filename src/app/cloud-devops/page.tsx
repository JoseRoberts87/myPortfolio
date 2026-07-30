import { Section, Card, Badge, PageHero } from '@/components/ui';

export default function CloudDevOpsPage() {
  return (
    <div className="min-h-screen pt-16">
      <PageHero
        title="Cloud & DevOps"
        tagline="Multi-cloud data & platform engineering — this portfolio runs on AWS (ECS Fargate + Terraform), backed by production Databricks Lakehouse and Azure Data Factory experience across AWS and Azure."
        badges={['AWS', 'Azure', 'Databricks']}
      />

      <Section padding="lg">
        <Card variant="elevated" padding="lg">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-semibold">AWS Infrastructure Architecture</h2>
              <Badge variant="success" size="lg">
                Production Ready
              </Badge>
            </div>
            <p className="mb-2 text-sm font-medium uppercase tracking-wide text-accent">
              What this portfolio runs on
            </p>
            <p className="text-muted mb-8">
              Multi-AZ deployment with ECS Fargate, RDS PostgreSQL, ElastiCache Redis,
              and comprehensive monitoring. All infrastructure is defined as code using Terraform
              with automated deployments via GitHub Actions.
            </p>
          </div>

          {/* Architecture Diagram */}
          <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
            <img
              src="/images/aws-architecture.svg"
              alt="AWS Infrastructure Architecture"
              className="w-full h-auto"
            />
          </div>

          {/* Key Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card variant="bordered" padding="md">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-1">2</div>
                <div className="text-sm text-muted">Availability Zones</div>
              </div>
            </Card>
            <Card variant="bordered" padding="md">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-1">9</div>
                <div className="text-sm text-muted">AWS Services</div>
              </div>
            </Card>
            <Card variant="bordered" padding="md">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-1">66</div>
                <div className="text-sm text-muted">Resources</div>
              </div>
            </Card>
            <Card variant="bordered" padding="md">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-1">100%</div>
                <div className="text-sm text-muted">IaC Coverage</div>
              </div>
            </Card>
          </div>

          {/* Technology Stack */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="primary">AWS ECS Fargate</Badge>
            <Badge variant="primary">Terraform</Badge>
            <Badge variant="primary">RDS PostgreSQL</Badge>
            <Badge variant="primary">ElastiCache Redis</Badge>
            <Badge variant="primary">Application Load Balancer</Badge>
            <Badge variant="primary">Route 53</Badge>
            <Badge variant="primary">CloudWatch</Badge>
            <Badge variant="primary">ECR</Badge>
            <Badge variant="primary">GitHub Actions</Badge>
          </div>
        </Card>
      </Section>

      <Section padding="lg" background="subtle">
        <h2 className="text-3xl font-bold mb-8">Implementation Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Infrastructure as Code</h3>
            <p className="text-muted mb-4">
              Complete infrastructure defined in Terraform with 9 modular components: VPC, ECS,
              RDS, ElastiCache, ALB, Route53, ECR, CloudWatch, and Security Groups.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" size="sm">Terraform</Badge>
              <Badge variant="secondary" size="sm">Modular Design</Badge>
              <Badge variant="secondary" size="sm">State Management</Badge>
            </div>
          </Card>

          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Container Orchestration</h3>
            <p className="text-muted mb-4">
              Serverless containers on ECS Fargate with auto-scaling (1-4 tasks), deployment
              circuit breakers, and health checks. Frontend (Next.js) and Backend (FastAPI)
              services with independent scaling policies.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" size="sm">ECS Fargate</Badge>
              <Badge variant="secondary" size="sm">Auto-Scaling</Badge>
              <Badge variant="secondary" size="sm">Blue-Green Deploy</Badge>
            </div>
          </Card>

          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Database & Caching</h3>
            <p className="text-muted mb-4">
              RDS PostgreSQL with automated backups, encryption at rest, and enhanced monitoring.
              ElastiCache Redis for session management and application caching with automatic
              failover capabilities.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" size="sm">PostgreSQL 16</Badge>
              <Badge variant="secondary" size="sm">Redis 7.1</Badge>
              <Badge variant="secondary" size="sm">Automated Backups</Badge>
            </div>
          </Card>

          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">CI/CD Pipeline</h3>
            <p className="text-muted mb-4">
              Fully automated deployments with GitHub Actions. Terraform workflow for infrastructure,
              separate workflows for backend and frontend with testing, building, and zero-downtime
              deployments to ECS.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" size="sm">GitHub Actions</Badge>
              <Badge variant="secondary" size="sm">Automated Tests</Badge>
              <Badge variant="secondary" size="sm">Zero Downtime</Badge>
            </div>
          </Card>

          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">High Availability</h3>
            <p className="text-muted mb-4">
              Multi-AZ deployment across us-east-1a and us-east-1b with Application Load Balancer,
              NAT Gateways in each AZ, and automatic task replacement on failure.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" size="sm">Multi-AZ</Badge>
              <Badge variant="secondary" size="sm">Load Balancing</Badge>
              <Badge variant="secondary" size="sm">Auto-Recovery</Badge>
            </div>
          </Card>

          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Security & Compliance</h3>
            <p className="text-muted mb-4">
              Private subnets for all application resources, security groups with least-privilege
              access, SSL/TLS encryption, image scanning, and secrets management. No hardcoded
              credentials.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" size="sm">Private Subnets</Badge>
              <Badge variant="secondary" size="sm">SSL/TLS</Badge>
              <Badge variant="secondary" size="sm">Security Groups</Badge>
            </div>
          </Card>

          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Monitoring & Observability</h3>
            <p className="text-muted mb-4">
              CloudWatch with Container Insights, custom dashboards, log aggregation with 30-day
              retention, CPU/memory alarms, and enhanced RDS monitoring at 60-second intervals.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" size="sm">CloudWatch</Badge>
              <Badge variant="secondary" size="sm">Container Insights</Badge>
              <Badge variant="secondary" size="sm">Alarms</Badge>
            </div>
          </Card>

          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Cost Optimization</h3>
            <p className="text-muted mb-4">
              Environment-specific sizing (dev: t4g.micro, prod: t4g.small), lifecycle policies
              for ECR images, minimal task counts with auto-scaling, and efficient resource
              utilization. Dev environment ~$115/month.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" size="sm">Right-Sizing</Badge>
              <Badge variant="secondary" size="sm">Auto-Scaling</Badge>
              <Badge variant="secondary" size="sm">Cost Tracking</Badge>
            </div>
          </Card>
        </div>
      </Section>

      {/* Databricks Lakehouse */}
      <Section padding="lg">
        <Card variant="elevated" padding="lg">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="text-3xl font-semibold">Databricks Lakehouse Platform</h2>
            <Badge variant="primary" size="lg">
              Databricks Certified — Data Engineer Professional
            </Badge>
          </div>
          <p className="text-muted mb-8">
            Beyond this site&apos;s AWS footprint, my day-to-day is building production data
            platforms on the Databricks Lakehouse. At MojoTech I designed agentic data ingestion
            on Databricks and integrated and automated pipelines and APIs for a Fortune&nbsp;500
            company — enabling AI agents across their work streams and driving{' '}
            <span className="text-accent font-semibold">72% growth</span> of their analytics
            platform. The patterns below are how I structure those Lakehouses.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card variant="bordered">
              <h3 className="text-xl font-semibold mb-3">Medallion Architecture &amp; Delta Lake</h3>
              <p className="text-muted mb-4">
                Bronze → Silver → Gold layering on Delta Lake: raw landing, cleansed/conformed
                tables, and curated business marts. ACID transactions, schema enforcement and
                evolution, time travel, and <code>OPTIMIZE</code>/<code>Z-ORDER</code> for fast reads.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" size="sm">Delta Lake</Badge>
                <Badge variant="secondary" size="sm">Medallion</Badge>
                <Badge variant="secondary" size="sm">Schema Evolution</Badge>
              </div>
            </Card>

            <Card variant="bordered">
              <h3 className="text-xl font-semibold mb-3">Streaming &amp; Incremental Ingestion</h3>
              <p className="text-muted mb-4">
                Structured Streaming and Auto Loader for exactly-once, incremental ingestion from
                object storage and message streams (Kinesis / Event Hubs), with checkpointing and
                backfill — the same engine powers batch and near-real-time.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" size="sm">Structured Streaming</Badge>
                <Badge variant="secondary" size="sm">Auto Loader</Badge>
                <Badge variant="secondary" size="sm">Apache Spark</Badge>
              </div>
            </Card>

            <Card variant="bordered">
              <h3 className="text-xl font-semibold mb-3">Governance with Unity Catalog</h3>
              <p className="text-muted mb-4">
                Centralized governance across workspaces: three-level namespaces, fine-grained
                access control, column/row-level security, data lineage, and a searchable catalog
                so teams can trust and discover data.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" size="sm">Unity Catalog</Badge>
                <Badge variant="secondary" size="sm">Lineage</Badge>
                <Badge variant="secondary" size="sm">Access Control</Badge>
              </div>
            </Card>

            <Card variant="bordered">
              <h3 className="text-xl font-semibold mb-3">Orchestration &amp; DataOps</h3>
              <p className="text-muted mb-4">
                Delta Live Tables for declarative, testable pipelines with data-quality
                expectations; Databricks Workflows for job orchestration and dependencies; and
                MLflow for experiment tracking and model registry alongside the data.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" size="sm">Delta Live Tables</Badge>
                <Badge variant="secondary" size="sm">Workflows</Badge>
                <Badge variant="secondary" size="sm">MLflow</Badge>
              </div>
            </Card>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="primary">Delta Lake</Badge>
            <Badge variant="primary">Apache Spark</Badge>
            <Badge variant="primary">Structured Streaming</Badge>
            <Badge variant="primary">Unity Catalog</Badge>
            <Badge variant="primary">Delta Live Tables</Badge>
            <Badge variant="primary">Databricks Workflows</Badge>
            <Badge variant="primary">MLflow</Badge>
            <Badge variant="primary">PySpark / SQL</Badge>
          </div>
        </Card>
      </Section>

      {/* Azure (multi-cloud) */}
      <Section padding="lg" background="subtle">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h2 className="text-3xl font-bold">Azure — Multi-Cloud Delivery</h2>
          <Badge variant="info" size="lg">
            Multi-Cloud
          </Badge>
        </div>
        <p className="text-muted mb-8 max-w-3xl">
          The same Lakehouse patterns port to Azure. I&apos;ve delivered data pipelines on Azure
          using Data Factory for orchestration, ADLS&nbsp;Gen2 as the Delta storage layer, and
          Azure Databricks for transformation — so the platform choice follows the client&apos;s
          cloud rather than the other way around.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Azure Data Factory Orchestration</h3>
            <p className="text-muted mb-4">
              Pipelines with linked services, datasets, and triggers; mapping data flows for
              code-free transformation; and Integration Runtimes to bridge on-prem and cloud
              sources. Parameterized, metadata-driven pipelines for reusable ingestion.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" size="sm">Data Factory</Badge>
              <Badge variant="secondary" size="sm">Mapping Data Flows</Badge>
              <Badge variant="secondary" size="sm">Triggers</Badge>
            </div>
          </Card>

          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">ADLS Gen2 + Delta</h3>
            <p className="text-muted mb-4">
              Azure Data Lake Storage Gen2 as the lake layer with hierarchical namespaces, holding
              the same Bronze/Silver/Gold Delta tables — a consistent storage contract regardless
              of cloud.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" size="sm">ADLS Gen2</Badge>
              <Badge variant="secondary" size="sm">Delta Lake</Badge>
              <Badge variant="secondary" size="sm">Hierarchical NS</Badge>
            </div>
          </Card>

          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Azure Databricks &amp; Synapse</h3>
            <p className="text-muted mb-4">
              Azure Databricks for Spark transformation and ML, with Synapse Analytics for
              serving warehouse workloads and Event Hubs for streaming ingestion — the Azure-native
              equivalents of the AWS stack.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" size="sm">Azure Databricks</Badge>
              <Badge variant="secondary" size="sm">Synapse Analytics</Badge>
              <Badge variant="secondary" size="sm">Event Hubs</Badge>
            </div>
          </Card>

          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Security &amp; Governance</h3>
            <p className="text-muted mb-4">
              Managed Identities for credential-free access between services, Key Vault for
              secrets, and Microsoft Purview for cataloging and lineage — least-privilege access
              wired in from the start.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" size="sm">Managed Identity</Badge>
              <Badge variant="secondary" size="sm">Key Vault</Badge>
              <Badge variant="secondary" size="sm">Purview</Badge>
            </div>
          </Card>
        </div>
      </Section>

      {/* Multi-cloud service mapping */}
      <Section padding="lg">
        <Card variant="elevated" padding="lg">
          <h2 className="text-3xl font-bold mb-2">Multi-Cloud Service Mapping</h2>
          <p className="text-muted mb-6">
            The same Lakehouse building blocks, expressed in each cloud&apos;s native services —
            how I keep architectures portable across AWS and Azure.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <caption className="sr-only">
                Equivalent AWS and Azure services for each data-platform capability
              </caption>
              <thead>
                <tr className="border-b border-subtle">
                  <th scope="col" className="py-3 pr-4 text-sm font-semibold">Capability</th>
                  <th scope="col" className="py-3 pr-4 text-sm font-semibold">AWS</th>
                  <th scope="col" className="py-3 pr-4 text-sm font-semibold">Azure</th>
                </tr>
              </thead>
              <tbody className="text-muted text-sm">
                {[
                  ['Lake storage', 'Amazon S3', 'ADLS Gen2'],
                  ['Lakehouse compute', 'Databricks on AWS', 'Azure Databricks'],
                  ['Streaming ingestion', 'Kinesis Data Streams', 'Event Hubs'],
                  ['Orchestration / ETL', 'Glue + Step Functions', 'Data Factory'],
                  ['Analytics warehouse', 'Redshift', 'Synapse Analytics'],
                  ['Secrets management', 'Secrets Manager', 'Key Vault'],
                  ['Serverless compute', 'ECS Fargate / Lambda', 'Container Apps / Functions'],
                ].map(([cap, aws, azure]) => (
                  <tr key={cap} className="border-b border-subtle/60">
                    <th scope="row" className="py-3 pr-4 font-medium text-body">{cap}</th>
                    <td className="py-3 pr-4">{aws}</td>
                    <td className="py-3 pr-4">{azure}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Section>

      <Section padding="lg" background="subtle">
        <Card variant="elevated" padding="lg">
          <h2 className="text-3xl font-bold mb-6">Technical Documentation</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Architecture Documentation</h3>
                <p className="text-muted text-sm mb-3">
                  Comprehensive documentation including Mermaid diagrams, component descriptions,
                  traffic flows, and scalability strategies.
                </p>
                <a
                  href="https://github.com/JoseRoberts87/myPortfolio/blob/main/docs/architecture.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-strong text-sm font-medium"
                >
                  View on GitHub →
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Deployment Guide</h3>
                <p className="text-muted text-sm mb-3">
                  Step-by-step guide for deploying the infrastructure, including prerequisites,
                  AWS setup, and GitHub Actions configuration.
                </p>
                <a
                  href="https://github.com/JoseRoberts87/myPortfolio/blob/main/DEPLOYMENT.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-strong text-sm font-medium"
                >
                  View on GitHub →
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Terraform Source Code</h3>
                <p className="text-muted text-sm mb-3">
                  Browse the complete Terraform infrastructure code with 9 modular components
                  and environment-specific configurations.
                </p>
                <a
                  href="https://github.com/JoseRoberts87/myPortfolio/tree/main/terraform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-strong text-sm font-medium"
                >
                  View on GitHub →
                </a>
              </div>
            </div>
          </div>
        </Card>
      </Section>
    </div>
  );
}
