# S3 Backend Configuration for Production Environment
# Usage: terraform init -backend-config=environments/prod/backend.hcl

bucket         = "portfolio-terraform-state-prod"
key            = "prod/terraform.tfstate"
region         = "us-east-1"
encrypt        = true
dynamodb_table = "portfolio-terraform-locks-prod"
