
// infrastructure/environments/dev/backend.tf

# ── Spacelift Backend ─────────────────────────────────────────────────────────
# State is managed by Spacelift — not stored locally.
# Spacelift automatically configures the backend when running in a stack.
# For local runs outside Spacelift, comment this out and use:
#   terraform init -backend=false

# terraform {
#   backend "remote" {
#     organization = "axioquan"
#     workspaces {
#       name = "messag-dev"
#     }
#   }
# }


# ── Backend managed by Spacelift ──────────────────────────────────────────────
# Spacelift automatically configures the backend and manages state.
# Do NOT add a backend block here — Spacelift injects its own.

