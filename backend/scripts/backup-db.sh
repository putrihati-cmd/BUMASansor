#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"

POSTGRES_DB="${POSTGRES_DB:-bumas_ansor}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"

mkdir -p "${BACKUP_DIR}"

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"

echo "[backup] dumping database to ${BACKUP_FILE}.gz"
docker compose -f "${COMPOSE_FILE}" exec -T postgres pg_dump -U "${POSTGRES_USER}" "${POSTGRES_DB}" > "${BACKUP_FILE}"
gzip -f "${BACKUP_FILE}"

# Keep only last 7 backups
ls -t "${BACKUP_DIR}"/backup_*.sql.gz 2>/dev/null | tail -n +8 | xargs -r rm -f

echo "[backup] OK"

