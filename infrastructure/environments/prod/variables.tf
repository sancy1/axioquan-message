
// infrastructure/environments/prod/variables.tf

variable "render_api_key" {
  description = "Render API key — set in Spacelift workspace variables"
  type        = string
  sensitive   = true
}

variable "render_owner_id" {
  description = "Render owner/team ID"
  type        = string
}

variable "github_owner" {
  description = "GitHub username"
  type        = string
}

variable "github_repo_name" {
  description = "GitHub repository name"
  type        = string
}

variable "database_url" {
  description = "NeonDB connection string — set in Spacelift workspace variables"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing secret — set in Spacelift workspace variables"
  type        = string
  sensitive   = true
}

variable "cors_origin" {
  description = "Allowed CORS origin — frontend URL"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "messag"
}

variable "environment" {
  description = "Environment: dev | staging | prod"
  type        = string
  default     = "prod"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Must be dev, staging, or prod."
  }
}