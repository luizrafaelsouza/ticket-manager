output "api_url" {
  description = "URL pública da API no Cloud Run"
  value       = google_cloud_run_v2_service.api.uri
}

output "load_balancer_ip" {
  description = "IP público do Load Balancer — apontar o domínio pra cá"
  value       = google_compute_global_forwarding_rule.main.ip_address
}

output "database_private_ip" {
  description = "IP privado do Cloud SQL (primário)"
  value       = google_sql_database_instance.main.private_ip_address
  sensitive   = true
}

output "frontend_bucket" {
  description = "Nome do bucket onde o build do frontend deve ser publicado"
  value       = google_storage_bucket.frontend.name
}

output "workload_identity_provider" {
  description = "Nome completo do provider — usado no workflow de deploy pra autenticar"
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "deployer_service_account" {
  description = "E-mail da service account usada pelo GitHub Actions pra fazer deploy"
  value       = google_service_account.deployer.email
}
