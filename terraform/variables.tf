variable "gcp_project_id" {
  type        = string
  description = "Google Cloud Project ID"
  default     = "cloudops-ai-production"
}

variable "gcp_region" {
  type        = string
  description = "Google Cloud Region for Cloud Run & Artifact Registry"
  default     = "us-central1"
}

variable "aws_region" {
  type        = string
  description = "AWS Region for EC2 and CloudWatch"
  default     = "us-east-1"
}

variable "environment" {
  type        = string
  description = "Deployment environment (dev, staging, prod)"
  default     = "production"
}
