
// infrastructure/modules/neon/outputs.tf

output "database_url" {
  description = "NeonDB connection string passed through to render module"
  value       = var.database_url
  sensitive   = true
}