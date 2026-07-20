variable "environment" {}
variable "domain" {
  default = "naprocs.in"
}

resource "aws_ses_domain_identity" "naprocs" {
  domain = var.domain
}

resource "aws_ses_domain_dkim" "naprocs" {
  domain = aws_ses_domain_identity.naprocs.domain
}

# Note: The output tokens need to be added to Route53/Cloudflare DNS
output "dkim_tokens" {
  value = aws_ses_domain_dkim.naprocs.dkim_tokens
}
