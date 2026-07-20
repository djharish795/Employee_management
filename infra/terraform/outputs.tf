output "vpc_id" {
  value       = module.vpc.vpc_id
  description = "The ID of the VPC"
}

output "internal_alb_dns" {
  value       = module.alb.alb_dns_name
  description = "The internal DNS name of the Load Balancer (for Cloudflare Tunnel)"
}

output "rds_endpoint" {
  value       = module.rds.db_endpoint
  description = "The endpoint of the RDS instance"
}

output "redis_endpoint" {
  value       = module.elasticache.redis_endpoint
  description = "The endpoint of the Redis cluster"
}
