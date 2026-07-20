variable "environment" {}
variable "vpc_id" {}
variable "private_subnet_ids" {}

resource "aws_security_group" "alb" {
  name        = "naprocs-alb-sg-${var.environment}"
  description = "Security group for internal ALB"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"] # Only allow traffic from within the VPC (e.g., Cloudflare Tunnel task)
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_lb" "internal" {
  name               = "naprocs-internal-alb-${var.environment}"
  internal           = true
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = var.private_subnet_ids
}

resource "aws_lb_target_group" "web" {
  name        = "naprocs-tg-web-${var.environment}"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path = "/api/health"
    matcher = "200"
  }
}

resource "aws_lb_target_group" "api" {
  name        = "naprocs-tg-api-${var.environment}"
  port        = 3001
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path = "/api/v1/health"
    matcher = "200"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.internal.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}

resource "aws_lb_listener_rule" "api_routing" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  condition {
    path_pattern {
      values = ["/api/v1/*"]
    }
  }
}

output "alb_dns_name" {
  value = aws_lb.internal.dns_name
}
output "tg_web_arn" {
  value = aws_lb_target_group.web.arn
}
output "tg_api_arn" {
  value = aws_lb_target_group.api.arn
}
