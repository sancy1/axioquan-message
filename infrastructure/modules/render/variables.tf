

// infrastructure/modules/render/variables.tf

variable "render_api_key" {
  description = "Render API key"
  type        = string
  sensitive   = true
}

variable "render_owner_id" {
  description = "Render owner/team ID"
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
}

variable "github_owner" {
  description = "GitHub username"
  type        = string
}

variable "github_repo_name" {
  description = "GitHub repository name"
  type        = string
}

variable "production_branch" {
  description = "Git branch to deploy from"
  type        = string
  default     = "main"
}

variable "database_url" {
  description = "NeonDB connection string"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing secret"
  type        = string
  sensitive   = true
}

variable "cors_origin" {
  description = "Allowed CORS origin — frontend URL"
  type        = string
}