// infrastructure/modules/render/main.tf

# terraform {
#   required_providers {
#     render = {
#       source  = "render-oss/render"
#       version = "~> 1.3"
#     }
#   }
# }

# provider "render" {
#   api_key  = var.render_api_key
#   owner_id = var.render_owner_id
# }

# resource "render_web_service" "messag_api" {
#   name   = "${var.project_name}-api-${var.environment}"
#   plan   = "free"
#   region = "oregon"

#   runtime_source = {
#     native_runtime = {
#       auto_deploy   = true
#       branch        = var.production_branch
#       build_command = "npm install && npm run build"
#       repo_url      = "https://github.com/${var.github_owner}/${var.github_repo_name}"
#       runtime       = "node"
#       start_command = "node dist/server.js"
#     }
#   }

#   env_vars = {
#     NODE_ENV = {
#       value = var.environment == "prod" ? "production" : var.environment
#     }
#     PORT = {
#       value = "3001"
#     }
#     DATABASE_URL = {
#       value = var.database_url
#     }
#     JWT_SECRET = {
#       value = var.jwt_secret
#     }
#     JWT_EXPIRES_IN = {
#       value = "7d"
#     }
#     CORS_ORIGIN = {
#       value = var.cors_origin
#     }
#     WS_ENABLED = {
#       value = "true"
#     }
#     RATE_LIMIT_MAX = {
#       value = "100"
#     }
#     RATE_LIMIT_WINDOW = {
#       value = "60000"
#     }
#     LOG_LEVEL = {
#       value = var.environment == "prod" ? "info" : "debug"
#     }
#   }
# }



















// infrastructure/modules/render/main.tf

terraform {
  required_providers {
    render = {
      source  = "render-oss/render"
      version = "~> 1.3"
    }
  }
}

# ── No provider block here — inherited from root environment ──────────────────

resource "render_web_service" "messag_api" {
  name          = "${var.project_name}-api-${var.environment}"
  plan          = "free"
  region        = "oregon"
  start_command = "node dist/server.js"

  runtime_source = {
    native_runtime = {
      auto_deploy   = true
      branch        = var.production_branch
      build_command = "npm install && npm run build"
      repo_url      = "https://github.com/${var.github_owner}/${var.github_repo_name}"
      runtime       = "node"
    }
  }

  env_vars = {
    NODE_ENV = {
      value = var.environment == "prod" ? "production" : var.environment
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
      value = var.environment == "prod" ? "info" : "debug"
    }
  }
}

