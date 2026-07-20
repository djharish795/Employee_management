terraform {
  backend "s3" {
    bucket         = "naprocs-terraform-state"
    key            = "global/s3/terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "naprocs-terraform-locks"
    encrypt        = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.5.0"
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Naprocs EMS"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
