output "db_instance_id" {
  description = "ID of the RDS instance"
  value       = aws_db_instance.postgres.id
}

output "db_endpoint" {
  description = "Connection endpoint for the database"
  value       = aws_db_instance.postgres.endpoint
  sensitive   = true
}

output "db_address" {
  description = "Address of the database"
  value       = aws_db_instance.postgres.address
}

output "db_port" {
  description = "Port of the database"
  value       = aws_db_instance.postgres.port
}

output "db_name" {
  description = "Name of the database"
  value       = aws_db_instance.postgres.db_name
}
