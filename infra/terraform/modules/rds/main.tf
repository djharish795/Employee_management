variable "environment" {}
variable "vpc_id" {}
variable "private_subnet_ids" {}
variable "db_password" {}

resource "aws_db_subnet_group" "main" {
  name       = "naprocs-db-subnet-group-${var.environment}"
  subnet_ids = var.private_subnet_ids
}

resource "aws_security_group" "rds" {
  name        = "rds-sg-${var.environment}"
  description = "Allow inbound traffic from ECS"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"] # Should restrict to ECS SG in prod
  }
}

resource "aws_db_instance" "main" {
  identifier           = "naprocs-db-${var.environment}"
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = "db.t4g.micro" # Adjust based on phase
  allocated_storage    = 20
  storage_type         = "gp3"
  db_name              = "naprocsems"
  username             = "postgres"
  password             = var.db_password
  db_subnet_group_name = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  skip_final_snapshot  = true
  storage_encrypted    = true
}

output "db_endpoint" {
  value = aws_db_instance.main.endpoint
}

output "db_connection_string" {
  value = "postgresql://postgres:${var.db_password}@${aws_db_instance.main.endpoint}/naprocsems"
  sensitive = true
}
