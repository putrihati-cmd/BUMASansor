# BUMAS Ansor Platform

Monorepo implementasi ulang sistem distribusi BUMAS Ansor sesuai dokumen `1.md`, `2.md`, dan `3.md`.

## Struktur

- `backend/` - NestJS + Prisma + PostgreSQL + Redis
- `mobile_app/` - Flutter + Riverpod + Dio + Hive
- `docs/` - OpenAPI, SQL baseline, dan status implementasi

## Prasyarat

- Node.js 20+
- npm 10+
- Flutter 3.x
- Docker (opsional, untuk PostgreSQL + Redis)

## Menjalankan Infrastruktur Lokal

```bash
docker compose up -d
```

## Menjalankan Backend

```bash
cd backend
copy .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

Backend API:
- Base URL: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`

## Menjalankan Mobile App

```bash
cd mobile_app
flutter pub get
flutter run
```

## CI/CD

- Backend CI: `.github/workflows/backend-ci.yml`
- Mobile CI: `.github/workflows/mobile-ci.yml`
- Backend Deploy (Docker): `.github/workflows/deploy.yml`
- Mobile Build Artifacts: `.github/workflows/flutter-deploy.yml`

## Dokumentasi

- API: `docs/API.md`
- Panduan Warung: `docs/USER_MANUAL_WARUNG.md`
- Troubleshooting: `docs/TROUBLESHOOTING.md`
- Deployment: `docs/DEPLOYMENT.md`

## Catatan Kebijakan

- Komponen `n8n`, `WAHA`, dan `Vercel` tidak dipakai.
- Aturan baku proyek: `ATURAN-BAKU.md`.
