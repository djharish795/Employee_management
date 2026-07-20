variable "environment" {}

resource "aws_secretsmanager_secret" "jwt_secret" {
  name        = "naprocs/${var.environment}/jwt_secret"
  description = "JWT Secret for API Authentication"
}

resource "aws_secretsmanager_secret" "db_url" {
  name        = "naprocs/${var.environment}/database_url"
  description = "PostgreSQL Database Connection String"
}

output "jwt_secret_arn" {
  value = aws_secretsmanager_secret.jwt_secret.arn
}
