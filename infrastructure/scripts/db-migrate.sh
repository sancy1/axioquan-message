## infrastructure/scripts/db-migrate.sh

#!/bin/bash
# ── Run database migrations ───────────────────────────────────────────────────
# Called by Render deploy hook or manually

set -e

echo "Running database migrations..."
cd "$(dirname "$0")/../../"
npm run db:migrate
echo "Migrations complete"