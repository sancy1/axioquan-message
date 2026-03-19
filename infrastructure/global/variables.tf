
// infrastructure/global/variables.tf

variable "render_api_key" {
  description = "Render API key — set in Spacelift workspace variables"
  type        = string
  sensitive   = true
}

variable "render_owner_id" {
  description = "Render owner/team ID"
  type        = string
}

variable "environment" {
  description = "Environment: dev | staging | prod"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Must be dev, staging, or prod."
  }
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "messag"
}

