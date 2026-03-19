
## infrastructure/scripts/validate-env.sh

#!/bin/bash
# ── Validate required environment variables are set ───────────────────────────

set -e

REQUIRED_VARS=(
  "render_api_key"
  "render_owner_id"
  "database_url"
  "jwt_secret"
  "cors_origin"
  "github_owner"
  "github_repo_name"
)

echo "Validating Spacelift workspace variables..."
echo "These must be set in Spacelift before running terraform apply:"
echo ""

for var in "${REQUIRED_VARS[@]}"; do
  echo "  [ ] $var"
done

echo ""
echo "Sensitive variables (mark as secret in Spacelift):"
echo "  - render_api_key"
echo "  - database_url"
echo "  - jwt_secret"