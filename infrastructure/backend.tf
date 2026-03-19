
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