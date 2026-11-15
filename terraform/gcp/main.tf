terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# 1. Artifact Registry for CloudOps Container Images
resource "google_artifact_registry_repository" "cloudops_repo" {
  provider      = google
  location      = var.gcp_region
  repository_id = "cloudops-agent-repo"
  description   = "Docker repository for CloudOps AI Agent microservices"
  format        = "DOCKER"
}

# 2. Secret Manager for Google Gemini API Key
resource "google_secret_manager_secret" "gemini_key" {
  provider  = google
  secret_id = "gemini-api-key"

  replication {
    auto {}
  }
}

# 3. Dedicated IAM Service Account with Least Privilege
resource "google_service_account" "cloudops_runner" {
  provider     = google
  account_id   = "cloudops-agent-runner"
  display_name = "CloudOps AI Agent Cloud Run Service Account"
}

# 4. Google Cloud Run Service for FastAPI Multi-Agent Engine
resource "google_cloud_run_v2_service" "cloudops_api" {
  provider = google
  name     = "cloudops-ai-agent-api"
  location = var.gcp_region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.cloudops_runner.email
    scaling {
      min_instance_count = 1
      max_instance_count = 10
    }

    containers {
      image = "${var.gcp_region}-docker.pkg.dev/${var.gcp_project_id}/${google_artifact_registry_repository.cloudops_repo.repository_id}/cloudops-backend:latest"

      resources {
        limits = {
          cpu    = "2"
          memory = "2Gi"
        }
      }

      env {
        name  = "ENVIRONMENT"
        value = var.environment
      }
      env {
        name  = "AWS_REGION"
        value = var.aws_region
      }
      env {
        name = "GEMINI_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.gemini_key.secret_id
            version = "latest"
          }
        }
      }
    }
  }
}

# 5. Allow Unauthenticated Access to API Gateway (or restrict via IAP)
resource "google_cloud_run_service_iam_member" "public_access" {
  provider = google
  location = google_cloud_run_v2_service.cloudops_api.location
  service  = google_cloud_run_v2_service.cloudops_api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

output "cloud_run_url" {
  value       = google_cloud_run_v2_service.cloudops_api.uri
  description = "Public URL of the CloudOps AI Agent Cloud Run service"
}
