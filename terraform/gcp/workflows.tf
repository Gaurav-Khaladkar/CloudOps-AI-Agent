# ==============================================================================
# Terraform GCP: Google Cloud Workflows Orchestration for SRE Incident Response
# ==============================================================================

# 1. IAM Service Account for Google Cloud Workflows
resource "google_service_account" "workflows_sa" {
  provider     = google
  account_id   = "cloudops-workflows-sa"
  display_name = "CloudOps Incident Response Workflows Service Account"
}

# 2. Grant Invocation Permissions to call Google Cloud Run API
resource "google_cloud_run_service_iam_member" "workflows_run_invoker" {
  provider = google
  location = google_cloud_run_v2_service.cloudops_api.location
  service  = google_cloud_run_v2_service.cloudops_api.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.workflows_sa.email}"
}

# 3. Grant Logging Permissions to Workflows
resource "google_project_iam_member" "workflows_logging" {
  provider = google
  project  = var.gcp_project_id
  role     = "roles/logging.logWriter"
  member   = "serviceAccount:${google_service_account.workflows_sa.email}"
}

# 4. Google Cloud Workflows Definition
resource "google_workflows_workflow" "incident_remediation" {
  provider        = google
  name            = "cloudops-incident-remediation-workflow"
  region          = var.gcp_region
  description     = "Automated Multi-Agent SRE Incident Triage and Remediation Pipeline"
  service_account = google_service_account.workflows_sa.id

  source_contents = file("${path.module}/../../workflows/incident_remediation_workflow.yaml")

  user_env_vars = {
    CLOUDOPS_API_URL = google_cloud_run_v2_service.cloudops_api.uri
  }
}

output "workflows_id" {
  value       = google_workflows_workflow.incident_remediation.id
  description = "The ID of the Google Cloud Workflows incident remediation pipeline"
}
