resource "google_compute_network" "main" {
  name                    = "ticket-manager-${var.environment}"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "main" {
  name          = "ticket-manager-${var.environment}"
  network       = google_compute_network.main.id
  region        = var.region
  ip_cidr_range = "10.10.0.0/24"
}

# Faixa de IPs reservada pra conexão privada com o Cloud SQL (VPC peering) —
# o banco nunca tem IP público, só é alcançável de dentro desta rede.
resource "google_compute_global_address" "private_services" {
  name          = "ticket-manager-${var.environment}-private-services"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.main.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.main.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_services.name]
}
