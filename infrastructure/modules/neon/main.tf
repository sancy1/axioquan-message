
// infrastructure/modules/neon/main.tf

# ── Neon Module (messag) ───────────────────────────────────────────────────────
# This module does NOT create any Neon resources.
# The NeonDB is shared with the axioquan frontend.
# The database_url is injected via Spacelift workspace variables.
# It is never stored in code or Terraform state.
#
# How it works:
#   1. database_url is set as a sensitive variable in Spacelift
#   2. This module receives it and passes it to the render module
#   3. The render module injects it as an environment variable
#      into the Render web service at deploy time
#
# To update the connection string:
#   Go to Spacelift → messag-dev workspace → Variables → database_url














