

// infrastructure/modules/neon/variables.tf

variable "database_url" {
  description = "NeonDB connection string — injected from Spacelift workspace variable"
  type        = string
  sensitive   = true
}