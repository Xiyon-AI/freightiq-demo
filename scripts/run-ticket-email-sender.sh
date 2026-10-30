#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/Vocale/va-user-frontend"
ENV_FILE="$APP_DIR/.env.runtime"
APP_PORT="${PORT:-3000}"
CRON_URL="http://127.0.0.1:${APP_PORT}/user/api/cron/ticket-email-sender"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "$(date -Is) missing env file: $ENV_FILE" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

CRON_TOKEN="${TICKET_EMAIL_CRON_SECRET:-${CRON_SECRET:-}}"

if [[ -z "$CRON_TOKEN" ]]; then
  echo "$(date -Is) TICKET_EMAIL_CRON_SECRET or CRON_SECRET must be set" >&2
  exit 1
fi

response="$(
  curl -fsS \
    -X POST \
    -H "Authorization: Bearer $CRON_TOKEN" \
    "$CRON_URL"
)"

echo "$(date -Is) $response"
