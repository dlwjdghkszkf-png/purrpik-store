#!/usr/bin/env bash
# 로컬 dev에서 Cron 라우트 수동 호출
# Usage:
#   ./scripts/trigger-cron.sh alimtalk
#   ./scripts/trigger-cron.sh cleanup
#   ./scripts/trigger-cron.sh instagram
#
# env:
#   CRON_SECRET (default: dev-secret)
#   BASE_URL    (default: http://localhost:3000)

set -euo pipefail

SECRET=${CRON_SECRET:-dev-secret}
BASE=${BASE_URL:-http://localhost:3000}

case "${1:-}" in
  alimtalk)  PATH_API="/api/alimtalk/retry" ;;
  cleanup)   PATH_API="/api/orders/cleanup" ;;
  instagram) PATH_API="/api/instagram/sync" ;;
  *) echo "Usage: $0 {alimtalk|cleanup|instagram}" >&2; exit 1 ;;
esac

curl -s -X GET "$BASE$PATH_API" \
  -H "Authorization: Bearer $SECRET" \
  | (command -v jq >/dev/null && jq . || cat)
