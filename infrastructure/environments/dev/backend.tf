
// infrastructure/environments/dev/backend.tf

# ── Spacelift Backend ─────────────────────────────────────────────────────────
# State is managed by Spacelift — not stored locally.
# Spacelift automatically configures the backend when running in a stack.
# For local runs outside Spacelift, comment this out and use:
#   terraform init -backend=false

terraform {
  backend "remote" {
    organization = "axioquan"
    workspaces {
      name = "messag-dev"
    }
  }
}