# AWS Deployment Guide

Complete guide for deploying the Portfolio application to AWS using ECS Fargate, Terraform, and GitHub Actions CI/CD.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Terraform Deployment](#terraform-deployment)
- [Application Deployment](#application-deployment)
- [Domain Configuration](#domain-configuration)
- [Monitoring & Logs](#monitoring--logs)
- [Cost Estimation](#cost-estimation)
- [Troubleshooting](#troubleshooting)

## Architecture Overview

### AWS Services Used

- **ECS Fargate**: Serverless container orchestration
- **ECR**: Container image registry
- **RDS PostgreSQL**: Managed database
- **ElastiCache Redis**: Managed cache
- **Application Load Balancer**: Traffic routing
- **Route53**: DNS management
- **ACM**: SSL/TLS certificates
- **CloudWatch**: Logging and monitoring
- **VPC**: Network isolation with public/private subnets
- **NAT Gateway**: Outbound internet for private subnets

### Architecture Diagram

```
Internet
   │
   ├─→ Route53 (therpiproject.com)
   │
   └─→ ALB (Public Subnets)
         │
         ├─→ Frontend ECS Tasks (Private Subnets)
         │
         └─→ Backend ECS Tasks (Private Subnets)
               │
               ├─→ RDS PostgreSQL (Private Subnets)
               │
               └─→ ElastiCache Redis (Private Subnets)
```

## Prerequisites

### Local Requirements

- AWS CLI installed and configured
- Terraform >= 1.6.0
- Docker installed
- Git configured
- Domain name (therpiproject.com)

### AWS Requirements

1. **AWS Account** with admin access
2. **AWS CLI configured**:
   ```bash
   aws configure
   ```

3. **GitHub Secrets** configured:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `DB_USERNAME`
   - `DB_PASSWORD`

## Initial Setup

### Step 1: Create S3 Backend for Terraform State

```bash
# Create S3 buckets for dev and prod
aws s3api create-bucket \
  --bucket portfolio-terraform-state-dev \
  --region us-east-1

aws s3api create-bucket \
  --bucket portfolio-terraform-state-prod \
  --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket portfolio-terraform-state-dev \
  --versioning-configuration Status=Enabled

aws s3api put-bucket-versioning \
  --bucket portfolio-terraform-state-prod \
  --versioning-configuration Status=Enabled

# Create DynamoDB tables for state locking
aws dynamodb create-table \
  --table-name portfolio-terraform-locks-dev \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

aws dynamodb create-table \
  --table-name portfolio-terraform-locks-prod \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### Step 2: Domain Configuration

1. **Transfer domain to Route53** (or update nameservers)
2. After Terraform creates the hosted zone, update your domain registrar with the Route53 nameservers

## Terraform Deployment

### Deploy Development Environment

```bash
cd terraform

# Initialize Terraform
terraform init -backend-config=environments/dev/backend.hcl

# Review the plan
terraform plan \
  -var-file=environments/dev/terraform.tfvars \
  -var="db_username=portfolio_admin" \
  -var="db_password=YOUR_SECURE_PASSWORD"

# Apply the infrastructure
terraform apply \
  -var-file=environments/dev/terraform.tfvars \
  -var="db_username=portfolio_admin" \
  -var="db_password=YOUR_SECURE_PASSWORD"
```

### Deploy Production Environment

```bash
cd terraform

# Initialize Terraform
terraform init -backend-config=environments/prod/backend.hcl

# Review the plan
terraform plan \
  -var-file=environments/prod/terraform.tfvars \
  -var="db_username=portfolio_admin" \
  -var="db_password=YOUR_SECURE_PASSWORD"

# Apply the infrastructure
terraform apply \
  -var-file=environments/prod/terraform.tfvars \
  -var="db_username=portfolio_admin" \
  -var="db_password=YOUR_SECURE_PASSWORD"
```

### Get Terraform Outputs

```bash
terraform output

# Specific outputs
terraform output alb_dns_name
terraform output backend_ecr_repository_url
terraform output frontend_ecr_repository_url
terraform output nameservers
```

## Application Deployment

### Option 1: Automatic Deployment (GitHub Actions)

1. **Push to main branch**:
   ```bash
   git push origin main
   ```

2. **Monitor deployments**:
   - Go to GitHub Actions tab
   - Check `Backend CI/CD` and `Frontend CI/CD` workflows

3. **Manual trigger**:
   - Go to Actions → Select workflow → Run workflow
   - Choose environment (dev/prod)

### Option 2: Manual Deployment

#### Build and Push Backend

```bash
cd backend

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# Build and push
docker build -t portfolio-dev-backend .
docker tag portfolio-dev-backend:latest <ECR_BACKEND_URL>:latest
docker push <ECR_BACKEND_URL>:latest

# Update ECS service
aws ecs update-service \
  --cluster portfolio-dev-cluster \
  --service portfolio-dev-backend-service \
  --force-new-deployment
```

#### Build and Push Frontend

```bash
# Login to ECR (if not already logged in)
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# Build and push
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://dev.therpiproject.com/api \
  -t portfolio-dev-frontend .

docker tag portfolio-dev-frontend:latest <ECR_FRONTEND_URL>:latest
docker push <ECR_FRONTEND_URL>:latest

# Update ECS service
aws ecs update-service \
  --cluster portfolio-dev-cluster \
  --service portfolio-dev-frontend-service \
  --force-new-deployment
```

## Domain Configuration

### Update Nameservers

After Terraform creates the Route53 hosted zone:

1. **Get nameservers**:
   ```bash
   terraform output nameservers
   ```

2. **Update at domain registrar**:
   - Login to your domain registrar
   - Update nameservers to the Route53 values
   - Wait for DNS propagation (can take up to 48 hours)

3. **Verify DNS**:
   ```bash
   dig therpiproject.com
   dig dev.therpiproject.com
   ```

### SSL Certificate

ACM certificate is automatically created and validated via DNS. Monitor status:

```bash
aws acm list-certificates --region us-east-1
aws acm describe-certificate --certificate-arn <CERT_ARN> --region us-east-1
```

## Monitoring & Logs

### CloudWatch Logs

```bash
# Backend logs
aws logs tail /ecs/portfolio-dev/backend --follow

# Frontend logs
aws logs tail /ecs/portfolio-dev/frontend --follow
```

### CloudWatch Dashboard

Access at: AWS Console → CloudWatch → Dashboards → portfolio-dev-dashboard

### ECS Service Status

```bash
# Check service status
aws ecs describe-services \
  --cluster portfolio-dev-cluster \
  --services portfolio-dev-backend-service portfolio-dev-frontend-service

# Check running tasks
aws ecs list-tasks --cluster portfolio-dev-cluster
```

### Health Checks

```bash
# Backend API health
curl https://dev.therpiproject.com/api/v1/health
curl https://dev.therpiproject.com/api/v1/health/detailed

# Frontend health
curl https://dev.therpiproject.com/
```

## Cost Estimation

### Development Environment (~$65-80/month)

- **ECS Fargate**: ~$20/month (2 tasks at 0.25 vCPU, 0.5GB)
- **RDS (db.t4g.micro)**: Free tier or $13/month
- **ElastiCache (cache.t4g.micro)**: ~$11/month
- **ALB**: ~$16/month
- **NAT Gateway**: ~$32/month
- **Data Transfer**: ~$5/month
- **Route53**: ~$0.50/month

### Production Environment (~$120-160/month)

- **ECS Fargate**: ~$40/month (4 tasks at 0.5 vCPU, 1GB)
- **RDS (db.t4g.small)**: ~$26/month
- **ElastiCache (cache.t4g.small)**: ~$23/month
- **ALB**: ~$16/month
- **NAT Gateway**: ~$64/month (2 AZs)
- **Data Transfer**: ~$10-20/month
- **Route53**: ~$0.50/month

## Troubleshooting

### ECS Tasks Not Starting

1. **Check task logs**:
   ```bash
   aws ecs describe-tasks \
     --cluster portfolio-dev-cluster \
     --tasks <TASK_ARN>
   ```

2. **Check CloudWatch logs** for container errors

3. **Verify security groups** allow traffic

4. **Check ECR image** exists and is accessible

### Database Connection Issues

1. **Verify security group** rules allow port 5432 from ECS security group

2. **Check database endpoint**:
   ```bash
   terraform output db_endpoint
   ```

3. **Test connection from ECS task**:
   ```bash
   aws ecs execute-command \
     --cluster portfolio-dev-cluster \
     --task <TASK_ID> \
     --container backend \
     --interactive \
     --command "/bin/sh"
   ```

### SSL Certificate Not Validating

1. **Check DNS records** are created:
   ```bash
   aws route53 list-resource-record-sets \
     --hosted-zone-id <ZONE_ID>
   ```

2. **Verify nameservers** are updated at registrar

3. **Wait for DNS propagation** (up to 48 hours)

### High Costs

1. **Check NAT Gateway** data transfer (largest cost)
2. **Review CloudWatch logs** retention (default 30 days)
3. **Consider using VPC endpoints** for AWS services
4. **Scale down** dev environment when not in use

## Maintenance

### Update Application

Simply push to main branch or manually trigger workflows.

### Update Infrastructure

```bash
# Make changes to Terraform files
cd terraform

# Plan changes
terraform plan -var-file=environments/dev/terraform.tfvars

# Apply changes
terraform apply -var-file=environments/dev/terraform.tfvars
```

### Backup & Recovery

- **Database**: Automated backups enabled (7 days retention)
- **Redis**: Automated snapshots enabled (5 days retention)

### Destroy Environment

```bash
cd terraform

# Development
terraform destroy -var-file=environments/dev/terraform.tfvars

# Production
terraform destroy -var-file=environments/prod/terraform.tfvars
```

## Security Best Practices

1. **Rotate database passwords** regularly
2. **Use AWS Secrets Manager** for sensitive data
3. **Enable MFA** on AWS root account
4. **Review IAM policies** regularly
5. **Enable CloudTrail** for audit logging
6. **Use VPC Flow Logs** for network monitoring
7. **Keep container images** updated

## Support

For issues or questions:
- Check CloudWatch logs first
- Review ECS task status
- Verify security group rules
- Check GitHub Actions workflow logs

---

**Last Updated**: 2025-10-29
**Version**: 1.0.0
