# VPC Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "private_subnet_ids" {
  description = "IDs of private subnets"
  value       = module.vpc.private_subnet_ids
}

output "public_subnet_ids" {
  description = "IDs of public subnets"
  value       = module.vpc.public_subnet_ids
}

# ECR Outputs
output "backend_ecr_repository_url" {
  description = "URL of the backend ECR repository"
  value       = module.ecr.backend_repository_url
}

output "frontend_ecr_repository_url" {
  description = "URL of the frontend ECR repository"
  value       = module.ecr.frontend_repository_url
}

# RDS Outputs
output "db_endpoint" {
  description = "RDS database endpoint"
  value       = module.rds.db_endpoint
  sensitive   = true
}

output "db_name" {
  description = "Database name"
  value       = var.db_name
}

# ElastiCache Outputs
output "redis_endpoint" {
  description = "Redis cache endpoint"
  value       = module.elasticache.redis_endpoint
}

output "redis_port" {
  description = "Redis port"
  value       = module.elasticache.redis_port
}

# ALB Outputs
output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.alb.alb_dns_name
}

output "alb_arn" {
  description = "ARN of the Application Load Balancer"
  value       = module.alb.alb_arn
}

# ECS Outputs
output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = module.ecs.cluster_name
}

output "backend_service_name" {
  description = "Name of the backend ECS service"
  value       = module.ecs.backend_service_name
}

output "frontend_service_name" {
  description = "Name of the frontend ECS service"
  value       = module.ecs.frontend_service_name
}

# Route53 Outputs
output "domain_name" {
  description = "Domain name"
  value       = var.domain_name
}

output "nameservers" {
  description = "Nameservers for the hosted zone"
  value       = module.route53.nameservers
}

# CloudWatch Outputs
output "backend_log_group_name" {
  description = "CloudWatch log group for backend"
  value       = module.cloudwatch.backend_log_group_name
}

output "frontend_log_group_name" {
  description = "CloudWatch log group for frontend"
  value       = module.cloudwatch.frontend_log_group_name
}
