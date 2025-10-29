output "backend_log_group_name" {
  description = "Name of the backend CloudWatch log group"
  value       = aws_cloudwatch_log_group.backend.name
}

output "backend_log_group_arn" {
  description = "ARN of the backend CloudWatch log group"
  value       = aws_cloudwatch_log_group.backend.arn
}

output "frontend_log_group_name" {
  description = "Name of the frontend CloudWatch log group"
  value       = aws_cloudwatch_log_group.frontend.name
}

output "frontend_log_group_arn" {
  description = "ARN of the frontend CloudWatch log group"
  value       = aws_cloudwatch_log_group.frontend.arn
}

output "cluster_log_group_name" {
  description = "Name of the ECS cluster CloudWatch log group"
  value       = aws_cloudwatch_log_group.ecs_cluster.name
}
