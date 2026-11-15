terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

provider "aws" {
  region = var.aws_region
}

# GCP Module: Container Runtime, Secret Manager & Gemini Integration
module "gcp_infrastructure" {
  source         = "./gcp"
  gcp_project_id = var.gcp_project_id
  gcp_region     = var.gcp_region
  aws_region     = var.aws_region
  environment    = var.environment
}

# AWS Module: CloudWatch Alarms, SNS Incident Topics & Telemetry
module "aws_infrastructure" {
  source      = "./aws"
  aws_region  = var.aws_region
  environment = var.environment
}

output "cloudops_api_endpoint" {
  value       = module.gcp_infrastructure.cloud_run_url
  description = "Production Google Cloud Run URL for CloudOps AI Agent API"
}

output "aws_incident_sns_arn" {
  value       = module.aws_infrastructure.sns_topic_arn
  description = "AWS SNS Topic ARN wired to CloudWatch incident alerts"
}
