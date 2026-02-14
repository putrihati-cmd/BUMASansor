#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "[deploy] root: ${ROOT_DIR}"
cd "${ROOT_DIR}"

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"

echo "[deploy] pulling images..."
docker compose -f "${COMPOSE_FILE}" pull

echo "[deploy] starting services..."
docker compose -f "${COMPOSE_FILE}" up -d --remove-orphans

echo "[deploy] running migrations..."
docker compose -f "${COMPOSE_FILE}" exec -T app npx prisma migrate deploy

echo "[deploy] waiting for health..."
sleep 5
curl -fsS "http://localhost:3000/health" >/dev/null

echo "[deploy] OK"

