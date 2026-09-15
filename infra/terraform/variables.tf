variable "project_id" {
  description = "Id do projeto GCP onde a infraestrutura é provisionada"
  type        = string
}

variable "region" {
  description = "Região principal do GCP"
  type        = string
  default     = "southamerica-east1"
}

variable "environment" {
  description = "Nome do ambiente (production, staging, etc.) — usado como sufixo em nomes de recursos"
  type        = string
  default     = "production"
}

variable "api_image" {
  description = "Imagem Docker da API publicada no Artifact Registry (ex: <region>-docker.pkg.dev/<project>/ticket-manager/api:<tag>)"
  type        = string
}

variable "jwt_secret" {
  description = "Segredo usado pra assinar os tokens JWT"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Senha do usuário do banco de dados"
  type        = string
  sensitive   = true
}

variable "github_repository" {
  description = "Repositório do GitHub no formato owner/repo, usado na Workload Identity Federation"
  type        = string
}
