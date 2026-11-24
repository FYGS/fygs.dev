#!/bin/sh
# Applies the pending database migrations, then starts the server.
# - RUN_MIGRATIONS=1 turns the migration on (set it in Coolify); anything else starts the server only.
# - MIGRATE_DATABASE_URL: a DIRECT connection for the migration. A pooled one (Neon "-pooler", PgBouncer in transaction mode)
#   cannot hold the advisory lock Prisma takes. Falls back to DATABASE_URL.
# A failed migration stops the container before it serves anything: Coolify keeps the previous version running.
set -e

if [ "$RUN_MIGRATIONS" = "1" ]; then
  echo "[entrypoint] prisma migrate deploy"
  (cd /opt/migrate && DATABASE_URL="${MIGRATE_DATABASE_URL:-$DATABASE_URL}" node node_modules/prisma/build/index.js migrate deploy)
fi

exec node server.js
