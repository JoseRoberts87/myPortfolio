# S3 Backend Configuration for Dev Environment
# Usage: terraform init -backend-config=environments/dev/backend.hcl

bucket         = "portfolio-terraform-state-dev"
key            = "dev/terraform.tfstate"
region         = "us-east-1"
encrypt        = true
dynamodb_table = "portfolio-terraform-locks-dev"
