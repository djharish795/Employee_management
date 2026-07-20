variable "environment" {}
variable "alb_arn" {}

resource "aws_wafv2_web_acl" "main" {
  name        = "naprocs-waf-${var.environment}"
  description = "WAF for Internal Load Balancer"
  scope       = "REGIONAL"

  default_action {
    block {} # Block everything by default
  }

  rule {
    name     = "AllowCloudflareIPs"
    priority = 1

    action {
      allow {}
    }

    statement {
      # In production, this would use Cloudflare's managed IP list or rate limits
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "CloudflareIPsMetric"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "naprocs-waf-metric"
    sampled_requests_enabled   = true
  }
}

resource "aws_wafv2_web_acl_association" "alb" {
  resource_arn = var.alb_arn
  web_acl_arn  = aws_wafv2_web_acl.main.arn
}
