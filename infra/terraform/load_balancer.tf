# WAF + rate limiting na borda — filtra tráfego abusivo antes dele chegar
# no Cloud Run, sem gastar capacidade dos servidores da aplicação com isso.
resource "google_compute_security_policy" "api" {
  name = "ticket-manager-${var.environment}"

  rule {
    action   = "throttle"
    priority = 1000
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    rate_limit_options {
      conform_action = "allow"
      exceed_action  = "deny(429)"
      rate_limit_threshold {
        count        = 100
        interval_sec = 60
      }
      enforce_on_key = "IP"
    }
    description = "Limita cada IP a 100 requisições/minuto"
  }

  rule {
    action   = "allow"
    priority = 2147483647
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Regra padrão — permite o restante do tráfego"
  }
}

resource "google_compute_region_network_endpoint_group" "api" {
  name                  = "ticket-manager-${var.environment}-api"
  region                = var.region
  network_endpoint_type = "SERVERLESS"

  cloud_run {
    service = google_cloud_run_v2_service.api.name
  }
}

resource "google_compute_backend_service" "api" {
  name                  = "ticket-manager-${var.environment}-api"
  protocol              = "HTTPS"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  security_policy       = google_compute_security_policy.api.id

  backend {
    group = google_compute_region_network_endpoint_group.api.id
  }
}

# Um load balancer só, servindo a API (Cloud Run) e o frontend (bucket) sob
# o mesmo hostname — roteia automaticamente pra região mais próxima do
# usuário, primeiro passo real de alcance global.
resource "google_compute_url_map" "main" {
  name            = "ticket-manager-${var.environment}"
  default_service = google_compute_backend_bucket.frontend.id

  host_rule {
    hosts        = ["*"]
    path_matcher = "main"
  }

  path_matcher {
    name            = "main"
    default_service = google_compute_backend_bucket.frontend.id

    path_rule {
      paths   = ["/api/*", "/docs", "/health"]
      service = google_compute_backend_service.api.id
    }
  }
}

resource "google_compute_managed_ssl_certificate" "main" {
  name = "ticket-manager-${var.environment}"

  managed {
    domains = ["ticket-manager.example.com"] # trocar pelo domínio real antes de aplicar
  }
}

resource "google_compute_target_https_proxy" "main" {
  name             = "ticket-manager-${var.environment}"
  url_map          = google_compute_url_map.main.id
  ssl_certificates = [google_compute_managed_ssl_certificate.main.id]
}

resource "google_compute_global_forwarding_rule" "main" {
  name       = "ticket-manager-${var.environment}"
  target     = google_compute_target_https_proxy.main.id
  port_range = "443"
}
