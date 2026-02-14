#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

VERSION_LINE="$(grep '^version:' pubspec.yaml | head -n 1 | awk '{print $2}')"
VERSION="${VERSION_LINE%%+*}"
BUILD_NUMBER="${VERSION_LINE##*+}"

echo "[mobile] version: ${VERSION} (${BUILD_NUMBER})"

echo "[mobile] clean + deps"
flutter clean
flutter pub get

echo "[mobile] build dev apk"
flutter build apk --flavor dev --debug --dart-define=API_BASE_URL=http://10.0.2.2:3000/api

echo "[mobile] build staging apk"
flutter build apk --flavor staging --release --dart-define=API_BASE_URL=https://staging-api.bumasansor.com/api

echo "[mobile] build prod aab"
flutter build appbundle --flavor prod --release --dart-define=API_BASE_URL=https://api.bumasansor.com/api

DIST_DIR="distribution/v${VERSION}-${BUILD_NUMBER}"
mkdir -p "${DIST_DIR}"

cp "build/app/outputs/flutter-apk/app-dev-debug.apk" "${DIST_DIR}/" || true
cp "build/app/outputs/flutter-apk/app-staging-release.apk" "${DIST_DIR}/" || true
cp "build/app/outputs/bundle/prodRelease/app-prod-release.aab" "${DIST_DIR}/" || true

echo "[mobile] generating checksums..."
if command -v sha256sum >/dev/null 2>&1; then
  (cd "${DIST_DIR}" && sha256sum * > checksums.txt)
fi

echo "[mobile] done"
echo " - ${DIST_DIR}"
