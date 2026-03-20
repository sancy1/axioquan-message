
// infrastructure/environments/prod/outputs.tf

output "render_service_id" {
  description = "Render service ID"
  value       = module.render.service_id
}

output "render_service_name" {
  description = "Render service name"
  value       = module.render.service_name
}

output "api_url" {
  description = "Live messag API URL"
  value       = module.render.app_url
}

output "deployment_summary" {
  description = "Deployment summary"
  value       = <<-EOT
    Messag API — Production Ready
    ── Application ───────────────────────────────
    Service : ${module.render.service_name}
    URL     : ${module.render.app_url}
    ── Next Steps ────────────────────────────────
    1. Copy render_service_id to GitHub secret RENDER_SERVICE_ID
    2. Every push to main auto-deploys via GitHub Actions
    3. Test: curl ${module.render.app_url}/health
  EOT
}