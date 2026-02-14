# Deployment Guide (Baseline)

## 1. Environment produksi backend

Variabel minimum:

- `PORT`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_SECRET`
- `JWT_REFRESH_EXPIRES_IN`
- `BCRYPT_SALT_ROUNDS`
- `REDIS_URL`

Template:

- `backend/.env.production.example`

## 2. Build dan migrasi

```bash
cd backend
npm ci
npm run prisma:generate
npm run prisma:deploy
npm run build
npm run start:prod
```

## 3. Docker runtime

```bash
cd backend
docker compose -f docker-compose.yml up -d
```

Komponen baru:

- `backend/docker-compose.yml` (dev/staging)
- `backend/docker-compose.prod.yml` (produksi)
- `backend/nginx/nginx.conf`
- `backend/scripts/deploy.sh`
- `backend/scripts/backup-db.sh`

## 4. Health check

Endpoint:

- `GET /health` (tanpa prefix `/api`)

Respons berisi status database dan redis.

## 5. Mobile release

```bash
cd mobile_app
flutter pub get
flutter build apk --flavor dev --debug
flutter build apk --flavor staging --release
flutter build appbundle --flavor prod --release
```

Gunakan helper script:

- `mobile_app/scripts/build-all.sh`
- `mobile_app/scripts/build-all.ps1`

## 6. CI/CD

- Backend deploy: `.github/workflows/deploy.yml`
- Mobile artifact build: `.github/workflows/flutter-deploy.yml`

## 7. Wajib sebelum go-live

- Ganti seluruh credential default seed
- Aktifkan monitoring log + error tracking
- Aktifkan backup database harian
- Uji flow kritis: PO -> DO -> Confirm -> Receivable -> Payment
