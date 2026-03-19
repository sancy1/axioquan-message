
// infrastructure/modules/render/outputs.tf

output "service_id" {
  description = "Render web service ID"
  value       = render_web_service.messag_api.id
}

output "service_name" {
  description = "Render web service name"
  value       = render_web_service.messag_api.name
}

output "app_url" {
  description = "Live API URL"
  value       = "https://${render_web_service.messag_api.name}.onrender.com"
}

