
// infrastructure/environments/dev/main.tf

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    render = {
      source  = "render-oss/render"
      version = "~> 1.3"
    }
  }
}

# ── Provider configuration — must be in root module ───────────────────────────
provider "render" {
  api_key  = var.render_api_key
  owner_id = var.render_owner_id
}

# ── Neon module ───────────────────────────────────────────────────────────────
module "neon" {
  source       = "../../modules/neon"
  database_url = var.database_url
}

# ── Render module ─────────────────────────────────────────────────────────────
module "render" {
  source = "../../modules/render"

  render_api_key    = var.render_api_key
  render_owner_id   = var.render_owner_id
  project_name      = var.project_name
  environment       = var.environment
  github_owner      = var.github_owner
  github_repo_name  = var.github_repo_name
  production_branch = "main"

  database_url = module.neon.database_url
  jwt_secret   = var.jwt_secret
  cors_origin  = var.cors_origin
}