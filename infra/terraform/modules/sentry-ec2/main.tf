variable "environment" {}
variable "vpc_id" {}
variable "private_subnet_ids" {}

resource "aws_security_group" "sentry" {
  name        = "naprocs-sentry-sg-${var.environment}"
  description = "Security group for Sentry EC2 instance"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "sentry" {
  ami           = "ami-03f4878755434977f" # Ubuntu Server 22.04 LTS (ap-south-1)
  instance_type = "t3.medium" # t3.medium selected as best for minimum 4GB RAM required by Sentry
  subnet_id     = var.private_subnet_ids[0]
  vpc_security_group_ids = [aws_security_group.sentry.id]

  user_data = <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y docker.io docker-compose
              git clone https://github.com/getsentry/onpremise.git /opt/sentry
              cd /opt/sentry
              ./install.sh
              docker-compose up -d
              EOF

  tags = {
    Name = "naprocs-sentry-${var.environment}"
  }
}

output "sentry_private_ip" {
  value = aws_instance.sentry.private_ip
}
