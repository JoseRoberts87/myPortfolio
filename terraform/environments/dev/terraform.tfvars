# Development Environment Configuration

environment = "dev"
aws_region  = "us-east-1"

# VPC Configuration
vpc_cidr             = "10.0.0.0/16"
availability_zones   = ["us-east-1a", "us-east-1b"]
public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnet_cidrs = ["10.0.10.0/24", "10.0.11.0/24"]

# Domain Configuration
domain_name = "dev.therpiproject.com"

# Database Configuration
db_name           = "portfolio_dev"
db_username       = "portfolio_admin"
# db_password should be set via environment variable or secrets manager
db_instance_class = "db.t4g.micro"
db_allocated_storage = 20

# Redis Configuration
redis_node_type      = "cache.t4g.micro"
redis_num_cache_nodes = 1

# ECS Configuration - Minimal for dev
backend_cpu     = 256  # 0.25 vCPU
backend_memory  = 512  # 512 MB
frontend_cpu    = 256  # 0.25 vCPU
frontend_memory = 512  # 512 MB

backend_desired_count  = 1
frontend_desired_count = 1

# Application Environment Variables
environment_variables = {
  backend = {
    LOG_LEVEL = "DEBUG"
    LOG_FORMAT = "colored"
    ENVIRONMENT = "development"
  }
  frontend = {
    NODE_ENV = "development"
  }
}
