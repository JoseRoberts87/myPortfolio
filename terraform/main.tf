terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }

  backend "s3" {
    # Backend configuration should be provided via backend config file
    # Example: terraform init -backend-config=environments/prod/backend.hcl
    bucket = "tf-backend-rpiproject"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"

  project_name        = var.project_name
  environment         = var.environment
  vpc_cidr            = var.vpc_cidr
  availability_zones  = var.availability_zones
  public_subnet_cidrs = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
}

# Security Groups Module
module "security_groups" {
  source = "./modules/security-groups"

  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.vpc.vpc_id
}

# ECR Module
module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
  environment  = var.environment
}

# RDS Module
module "rds" {
  source = "./modules/rds"

  project_name           = var.project_name
  environment            = var.environment
  vpc_id                 = module.vpc.vpc_id
  private_subnet_ids     = module.vpc.private_subnet_ids
  db_security_group_id   = module.security_groups.db_security_group_id
  db_name                = var.db_name
  db_instance_class      = var.db_instance_class
  db_allocated_storage   = var.db_allocated_storage
}

# ElastiCache Module
module "elasticache" {
  source = "./modules/elasticache"

  project_name             = var.project_name
  environment              = var.environment
  vpc_id                   = module.vpc.vpc_id
  private_subnet_ids       = module.vpc.private_subnet_ids
  redis_security_group_id  = module.security_groups.redis_security_group_id
  redis_node_type          = var.redis_node_type
  redis_num_cache_nodes    = var.redis_num_cache_nodes
}

# ALB Module
module "alb" {
  source = "./modules/alb"

  project_name                = var.project_name
  environment                 = var.environment
  vpc_id                      = module.vpc.vpc_id
  public_subnet_ids           = module.vpc.public_subnet_ids
  alb_security_group_id       = module.security_groups.alb_security_group_id
  certificate_arn             = module.route53.certificate_arn
}

# CloudWatch Module
module "cloudwatch" {
  source = "./modules/cloudwatch"

  project_name = var.project_name
  environment  = var.environment
}

# ECS Module
module "ecs" {
  source = "./modules/ecs"

  project_name              = var.project_name
  environment               = var.environment
  vpc_id                    = module.vpc.vpc_id
  private_subnet_ids        = module.vpc.private_subnet_ids
  ecs_security_group_id     = module.security_groups.ecs_security_group_id

  # ECR repositories
  backend_ecr_repository_url  = module.ecr.backend_repository_url
  frontend_ecr_repository_url = module.ecr.frontend_repository_url

  # ALB target groups
  backend_target_group_arn    = module.alb.backend_target_group_arn
  frontend_target_group_arn   = module.alb.frontend_target_group_arn

  # Database connection
  db_host     = module.rds.db_endpoint
  db_name     = var.db_name
  db_username = module.rds.db_username
  db_password = module.rds.db_password

  # Redis connection
  redis_host = module.elasticache.redis_endpoint
  redis_port = module.elasticache.redis_port

  # CloudWatch log groups
  backend_log_group_name  = module.cloudwatch.backend_log_group_name
  frontend_log_group_name = module.cloudwatch.frontend_log_group_name

  # Task configuration
  backend_cpu     = var.backend_cpu
  backend_memory  = var.backend_memory
  frontend_cpu    = var.frontend_cpu
  frontend_memory = var.frontend_memory

  backend_desired_count  = var.backend_desired_count
  frontend_desired_count = var.frontend_desired_count

  # Domain name
  domain_name = var.domain_name

  # Environment-specific variables
  environment_variables = var.environment_variables
}

# Route53 Module
module "route53" {
  source = "./modules/route53"

  project_name = var.project_name
  environment  = var.environment
  domain_name  = var.domain_name
  alb_dns_name = module.alb.alb_dns_name
  alb_zone_id  = module.alb.alb_zone_id
}
