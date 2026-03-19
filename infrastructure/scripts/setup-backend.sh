
## infrastructure/scripts/setup-backend.sh

#!/bin/bash
# ── Setup Spacelift backend for messag ───────────────────────────────────────
# Run this once to initialize the Terraform working directory

set -e

ENVIRONMENT=${1:-dev}
echo "Setting up backend for environment: $ENVIRONMENT"

cd "$(dirname "$0")/../environments/$ENVIRONMENT"

echo "Initializing Terraform..."
terraform init

echo "Validating configuration..."
terraform validate

echo "Setup complete for $ENVIRONMENT environment"
echo "Next: trigger a run in Spacelift or run terraform plan"