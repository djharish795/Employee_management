variable "environment" {}
variable "dr_region" {
  default = "ap-south-2" # Hyderabad as requested by user
}

provider "aws" {
  alias  = "dr"
  region = var.dr_region
}

# --- AWS Backup for RDS ---
resource "aws_backup_vault" "dr_vault" {
  name        = "naprocs-dr-vault-${var.environment}"
  provider    = aws.dr
}

resource "aws_backup_plan" "rds_snapshot" {
  name = "naprocs-rds-backup-plan-${var.environment}"

  rule {
    rule_name         = "daily-dr-backup"
    target_vault_name = aws_backup_vault.dr_vault.name
    schedule          = "cron(0 12 * * ? *)" # Daily
    
    lifecycle {
      delete_after = 30 # Retain for 30 days
    }
    
    copy_action {
      destination_vault_arn = aws_backup_vault.dr_vault.arn
    }
  }
}

# --- S3 Cross-Region Replication ---
resource "aws_s3_bucket" "dr_documents" {
  provider = aws.dr
  bucket   = "naprocs-documents-dr-${var.environment}"
}

resource "aws_s3_bucket_versioning" "dr_documents" {
  provider = aws.dr
  bucket   = aws_s3_bucket.dr_documents.id
  versioning_configuration {
    status = "Enabled"
  }
}
