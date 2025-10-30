import { Section, Card, Badge } from '@/components/ui';
import Image from 'next/image';

export default function CloudDevOpsPage() {
  return (
    <div className="min-h-screen pt-16">
      <Section padding="xl" background="subtle">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Cloud & DevOps
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Production-grade AWS infrastructure with ECS Fargate, managed with Terraform and automated CI/CD pipelines.
          </p>
        </div>
      </Section>

      <Section padding="lg">
        <Card variant="elevated" padding="lg">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-semibold">AWS Infrastructure Architecture</h2>
              <Badge variant="success" size="lg">
                Production Ready
              </Badge>
            </div>
            <p className="text-gray-400 mb-8">
              Multi-AZ deployment with ECS Fargate, RDS PostgreSQL, ElastiCache Redis,
              and comprehensive monitoring. All infrastructure is defined as code using Terraform
              with automated deployments via GitHub Actions.
            </p>
          </div>

          {/* Architecture Diagram */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 mb-8">
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
                <div className="text-3xl font-bold text-primary-500 mb-1">2</div>
                <div className="text-sm text-gray-400">Availability Zones</div>
              </div>
            </Card>
            <Card variant="bordered" padding="md">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-500 mb-1">9</div>
                <div className="text-sm text-gray-400">AWS Services</div>
              </div>
            </Card>
            <Card variant="bordered" padding="md">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-500 mb-1">66</div>
                <div className="text-sm text-gray-400">Resources</div>
              </div>
            </Card>
            <Card variant="bordered" padding="md">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-500 mb-1">100%</div>
                <div className="text-sm text-gray-400">IaC Coverage</div>
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
            <p className="text-gray-400 mb-4">
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
            <p className="text-gray-400 mb-4">
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
            <p className="text-gray-400 mb-4">
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
            <p className="text-gray-400 mb-4">
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
            <p className="text-gray-400 mb-4">
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
            <p className="text-gray-400 mb-4">
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
            <p className="text-gray-400 mb-4">
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
            <p className="text-gray-400 mb-4">
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

      <Section padding="lg">
        <Card variant="elevated" padding="lg">
          <h2 className="text-3xl font-bold mb-6">Technical Documentation</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Architecture Documentation</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Comprehensive documentation including Mermaid diagrams, component descriptions,
                  traffic flows, and scalability strategies.
                </p>
                <a
                  href="https://github.com/JoseRoberts87/myPortfolio/blob/main/docs/architecture.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 hover:text-primary-600 text-sm font-medium"
                >
                  View on GitHub →
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Deployment Guide</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Step-by-step guide for deploying the infrastructure, including prerequisites,
                  AWS setup, and GitHub Actions configuration.
                </p>
                <a
                  href="https://github.com/JoseRoberts87/myPortfolio/blob/main/DEPLOYMENT.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 hover:text-primary-600 text-sm font-medium"
                >
                  View on GitHub →
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Terraform Source Code</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Browse the complete Terraform infrastructure code with 9 modular components
                  and environment-specific configurations.
                </p>
                <a
                  href="https://github.com/JoseRoberts87/myPortfolio/tree/main/terraform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 hover:text-primary-600 text-sm font-medium"
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
