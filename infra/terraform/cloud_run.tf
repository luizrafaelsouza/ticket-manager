# Cloud Run em vez de Kubernetes: escala automaticamente por requisição
# (inclusive até zero quando não há tráfego), sem cluster/node pool pra
# gerenciar. Pra uma API única — sem múltiplos serviços interagindo entre
# si — isso resolve "pico de acesso simultâneo global" com muito menos
# complexidade operacional do que Kubernetes traria.
resource "google_cloud_run_v2_service" "api" {
  name     = "ticket-manager-api-${var.environment}"
  location = var.region

  template {
    service_account = google_service_account.api.email

    scaling {
      min_instance_count = 0
      max_instance_count = 100
    }

    containers {
      image = var.api_image

      ports {
        container_port = 8000
      }

      env {
        name = "JWT_SECRET_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.jwt_secret.secret_id
            version = "latest"
          }
        }
      }

      env {
        name  = "DATABASE_URL"
        value = "postgresql+psycopg://${google_sql_user.app.name}:${var.db_password}@${google_sql_database_instance.main.private_ip_address}:5432/${google_sql_database.ticketing.name}"
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }

      startup_probe {
        http_get {
          path = "/health"
        }
        initial_delay_seconds = 5
        period_seconds        = 5
      }

      liveness_probe {
        http_get {
          path = "/health"
        }
        period_seconds = 30
      }
    }

    vpc_access {
      network_interfaces {
        network    = google_compute_network.main.id
        subnetwork = google_compute_subnetwork.main.id
      }
      # só o tráfego destinado a IPs privados (o banco) passa pela VPC;
      # chamadas normais de internet continuam sem passar por aqui
      egress = "PRIVATE_RANGES_ONLY"
    }
  }
}
