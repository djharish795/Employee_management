variable "environment" {}
variable "vpc_id" {}
variable "private_subnet_ids" {}
variable "alb_target_group_api_arn" {}
variable "alb_target_group_web_arn" {}
variable "db_url" {}
variable "redis_url" {}
variable "jwt_secret" {}
variable "cloudflare_tunnel_token" {}
variable "alb_dns_name" {}

resource "aws_ecs_cluster" "main" {
  name = "naprocs-cluster-${var.environment}"
}

# --- Cloudflare Tunnel Task ---
resource "aws_ecs_task_definition" "cloudflared" {
  family                   = "cloudflared-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn

  container_definitions = jsonencode([
    {
      name  = "cloudflared"
      image = "cloudflare/cloudflared:latest"
      command = ["tunnel", "--no-autoupdate", "run"]
      environment = [
        { name = "TUNNEL_TOKEN", value = var.cloudflare_tunnel_token }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/cloudflared-${var.environment}"
          "awslogs-region"        = "ap-south-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "cloudflared" {
  name            = "cloudflared-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.cloudflared.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }
}

# --- Security Group for ECS Tasks ---
resource "aws_security_group" "ecs_tasks" {
  name        = "ecs-tasks-sg-${var.environment}"
  description = "Allow inbound access from ALB only"
  vpc_id      = var.vpc_id

  ingress {
    protocol    = "tcp"
    from_port   = 3000
    to_port     = 3001
    cidr_blocks = ["10.0.0.0/16"] # Should restrict to ALB SG
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# IAM Role definition (stubbed for brevity)
resource "aws_iam_role" "ecs_execution_role" {
  name = "ecsTaskExecutionRole-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}
