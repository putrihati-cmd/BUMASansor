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

## 2. Build dan migrasi

```bash
cd backend
npm ci
npm run prisma:generate
npm run prisma:deploy
npm run build
npm run start:prod
```

## 3. Docker runtime (opsional)

```bash
docker compose up -d
```

Lalu deploy backend container terpisah menggunakan `backend/Dockerfile`.

## 4. Mobile release

```bash
cd mobile_app
flutter pub get
flutter build apk --release
```

## 5. Wajib sebelum go-live

- Ganti seluruh credential default seed
- Aktifkan monitoring log + error tracking
- Aktifkan backup database harian
- Uji flow kritis: PO -> DO -> Confirm -> Receivable -> Payment
