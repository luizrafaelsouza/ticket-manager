resource "google_storage_bucket" "frontend" {
  name                        = "ticket-manager-${var.environment}-frontend"
  location                    = var.region
  uniform_bucket_level_access = true

  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html" # SPA: qualquer rota desconhecida cai no index
  }
}

resource "google_storage_bucket_iam_member" "frontend_public_read" {
  bucket = google_storage_bucket.frontend.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

resource "google_compute_backend_bucket" "frontend" {
  name        = "ticket-manager-${var.environment}-frontend"
  bucket_name = google_storage_bucket.frontend.name
  enable_cdn  = true
}
