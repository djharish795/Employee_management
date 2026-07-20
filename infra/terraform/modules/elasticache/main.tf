variable "environment" {}
variable "vpc_id" {}
variable "private_subnet_ids" {}

resource "aws_elasticache_subnet_group" "main" {
  name       = "naprocs-redis-subnet-group-${var.environment}"
  subnet_ids = var.private_subnet_ids
}

resource "aws_security_group" "redis" {
  name        = "naprocs-redis-sg-${var.environment}"
  description = "Allow inbound Redis traffic"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"] # Only ECS tasks can connect
  }
}

resource "aws_elasticache_cluster" "main" {
  cluster_id           = "naprocs-redis-${var.environment}"
  engine               = "redis"
  node_type            = "cache.t4g.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  engine_version       = "7.1"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]
}

output "redis_endpoint" {
  value = aws_elasticache_cluster.main.cache_nodes[0].address
}
output "redis_connection_string" {
  value = "redis://${aws_elasticache_cluster.main.cache_nodes[0].address}:6379"
  sensitive = true
}
