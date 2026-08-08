#!/usr/bin/env bash
# Fixes the funnel creation 500 by deploying pending migrations, including
# the new one that adds funnel_steps.pageId / funnel_steps.formId.
#
# Usage: DATABASE_URL="postgres://..." ./fix-funnels.sh
# (or just run it if DATABASE_URL is already set in your environment/.env)

set -e

echo "==> Deploying pending migrations..."
if ! npx prisma migrate deploy; then
  echo "==> migrate deploy failed — likely the old stuck 20260803_funnel_step_crm_links migration."
  echo "==> Marking it as applied (its work is now covered by the new migration) and retrying..."
  npx prisma migrate resolve --applied 20260803_funnel_step_crm_links
  npx prisma migrate deploy
fi

echo "==> Verifying funnel_steps columns..."
npx prisma db execute --stdin <<< "SELECT column_name FROM information_schema.columns WHERE table_name = 'funnel_steps' ORDER BY column_name;"

echo "==> Done. pageId and formId should be listed above."
