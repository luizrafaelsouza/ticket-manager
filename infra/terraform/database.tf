resource "google_sql_database_instance" "main" {
  name                = "ticket-manager-${var.environment}"
  database_version    = "POSTGRES_17"
  region              = var.region
  deletion_protection = true

  depends_on = [google_service_networking_connection.private_vpc_connection]

  settings {
    tier              = "db-custom-2-7680"
    availability_type = "REGIONAL" # alta disponibilidade — instância replicada em duas zonas

    ip_configuration {
      ipv4_enabled    = false # sem IP público
      private_network = google_compute_network.main.id
    }

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
      start_time                     = "03:00"
    }
  }
}

resource "google_sql_database" "ticketing" {
  name     = "ticketing"
  instance = google_sql_database_instance.main.name
}

resource "google_sql_user" "app" {
  name     = "ticketing"
  instance = google_sql_database_instance.main.name
  password = var.db_password
}

# Réplica de leitura — descarrega a listagem/filtro de tickets (que domina sobre
# criação) do banco principal. Escrita continua só no primário; se o volume de
# escrita simultânea global virar o gargalo real, o próximo passo seria migrar
# pra um banco com escrita distribuída (ex: Spanner) — não vale antecipar isso
# sem dado real de carga.
resource "google_sql_database_instance" "read_replica" {
  name                 = "ticket-manager-${var.environment}-replica"
  master_instance_name = google_sql_database_instance.main.name
  database_version     = "POSTGRES_17"
  region               = var.region

  replica_configuration {
    failover_target = false
  }

  settings {
    tier              = "db-custom-2-7680"
    availability_type = "ZONAL"

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.main.id
    }
  }
}
