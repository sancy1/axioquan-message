# infrastructure/modules/render/main.tf
# Manages Render Web Service for messag API

terraform {
  required_providers {
    render = {
      source  = "render-oss/render"
      version = "~> 1.3"
    }
  }
}

resource "render_web_service" "messag_api" {
  name   = "${var.project_name}-api-${var.environment}"
  plan   = "free"
  region = "oregon"

  runtime_source = {
    docker = {
      repo_url        = "https://github.com/${var.github_owner}/${var.github_repo_name}"
      branch          = var.production_branch
      dockerfile_path = "./Dockerfile"
      context         = "."
      target          = "production"
    }
  }

  env_vars = {
    NODE_ENV = {
      value = "production"
    }
    PORT = {
      value = "3001"
    }
    DATABASE_URL = {
      value = var.database_url
    }
    JWT_SECRET = {
      value = var.jwt_secret
    }
    JWT_EXPIRES_IN = {
      value = "7d"
    }
    CORS_ORIGIN = {
      value = var.cors_origin
    }
    WS_ENABLED = {
      value = "true"
    }
    RATE_LIMIT_MAX = {
      value = "100"
    }
    RATE_LIMIT_WINDOW = {
      value = "60000"
    }
    LOG_LEVEL = {
      value = "info"
    }
  }
}