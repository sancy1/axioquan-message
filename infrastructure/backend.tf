
// infrastructure/backend.tf

# ── Root backend configuration ────────────────────────────────────────────────
# This file documents the Spacelift backend configuration.
# Each environment has its own backend.tf in environments/*/

# Spacelift manages state automatically when running inside a stack.
# Organization: axioquan
# Workspaces:
#   messag-dev     → environments/dev/
#   messag-staging → environments/staging/
#   messag-prod    → environments/prod/


# ── Backend managed by Spacelift ──────────────────────────────────────────────
# Spacelift automatically configures the backend and manages state.
# Do NOT add a backend block here — Spacelift injects its own.