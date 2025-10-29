# ElastiCache Subnet Group
resource "aws_elasticache_subnet_group" "redis" {
  name       = "${var.project_name}-${var.environment}-redis-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${var.project_name}-${var.environment}-redis-subnet-group"
  }
}

# ElastiCache Parameter Group
resource "aws_elasticache_parameter_group" "redis" {
  name   = "${var.project_name}-${var.environment}-redis-params"
  family = "redis7"

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-redis-params"
  }
}

# ElastiCache Replication Group (Redis)
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id       = "${var.project_name}-${var.environment}-redis"
  replication_group_description = "Redis cache for ${var.project_name} ${var.environment}"

  engine               = "redis"
  engine_version       = "7.1"
  node_type            = var.redis_node_type
  num_cache_clusters   = var.redis_num_cache_nodes
  parameter_group_name = aws_elasticache_parameter_group.redis.name
  port                 = 6379

  subnet_group_name  = aws_elasticache_subnet_group.redis.name
  security_group_ids = [var.redis_security_group_id]

  # Automatic failover (requires at least 2 nodes)
  automatic_failover_enabled = var.redis_num_cache_nodes > 1

  # At-rest encryption
  at_rest_encryption_enabled = true
  # In-transit encryption
  transit_encryption_enabled = false  # Set to true if you want to enable TLS

  # Backup configuration
  snapshot_retention_limit = var.snapshot_retention_limit
  snapshot_window         = "03:00-05:00"
  maintenance_window      = "mon:05:00-mon:07:00"

  # Auto minor version upgrade
  auto_minor_version_upgrade = true

  # Notification topic (optional)
  # notification_topic_arn = var.notification_topic_arn

  tags = {
    Name = "${var.project_name}-${var.environment}-redis"
  }
}
