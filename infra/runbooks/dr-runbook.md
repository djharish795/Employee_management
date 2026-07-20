# 🌋 Disaster Recovery Runbook (ap-south-2)

## Scenario: Mumbai (ap-south-1) goes offline completely
**Action:**
1. Log into AWS Console and switch region to **ap-south-2 (Hyderabad)**.
2. The S3 document bucket `naprocs-documents-dr-prod` already contains all replicated PDF/images.
3. Go to AWS Backup and restore the latest RDS snapshot to a new PostgreSQL instance in `ap-south-2`.
4. Update `infra/environments/prod/terraform.tfvars` to change `aws_region = "ap-south-2"`.
5. Run `terraform apply` to provision the VPC, ECS, and ALB in the new region.
6. Update Cloudflare Tunnel configuration to point `crewbase.naprocs.in` to the new Hyderabad Load Balancer.
