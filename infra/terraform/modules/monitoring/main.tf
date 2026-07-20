variable "environment" {}
variable "ecs_cluster_name" {}

resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "Naprocs-EMS-Dashboard-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ClusterName", var.ecs_cluster_name]
          ]
          period = 300
          stat   = "Average"
          region = "ap-south-1"
          title  = "ECS Cluster CPU Utilization"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ECS", "MemoryUtilization", "ClusterName", var.ecs_cluster_name]
          ]
          period = 300
          stat   = "Average"
          region = "ap-south-1"
          title  = "ECS Cluster Memory Utilization"
        }
      }
    ]
  })
}
