resource "google_artifact_registry_repository" "api" {
  repository_id = "ticket-manager"
  location      = var.region
  format        = "DOCKER"
  description   = "Imagens Docker da API do Ticket Manager"
}
