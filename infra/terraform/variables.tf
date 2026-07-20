variable "aws_region" {
  description = "AWS Region to deploy to"
  type        = string
  default     = "ap-south-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "domain_name" {
  description = "Base domain name for the application"
  type        = string
  default     = "naprocs.in"
}

variable "app_subdomain" {
  description = "Subdomain for the application"
  type        = string
  default     = "crewbase"
}

variable "db_password" {
  description = "Master password for PostgreSQL database"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT Secret Key"
  type        = string
  sensitive   = true
}

variable "cloudflare_tunnel_token" {
  description = "Cloudflare Tunnel Token for Zero Trust access"
  type        = string
  sensitive   = true
}
