# Troubleshooting BUMAS Ansor

Panduan cepat untuk masalah umum backend dan mobile.

## Backend

### Database connection error

Gejala:

- API gagal start.
- Muncul error Prisma `P1001` atau `Can't reach database`.

Langkah:

1. Cek container:
   - `docker compose -f backend/docker-compose.yml ps`
2. Cek nilai `DATABASE_URL`.
3. Restart service DB:
   - `docker compose -f backend/docker-compose.yml restart postgres`

### Migration gagal

Langkah:

1. Generate ulang client:
   - `npm --workspace backend run prisma:generate`
2. Jalankan deploy migration:
   - `npm --workspace backend run prisma:deploy`

### Health check tidak hijau

1. Cek endpoint:
   - `curl http://localhost:3000/health`
2. Jika `database: down`, fokus ke PostgreSQL.
3. Jika `redis: down`, cek `REDIS_URL`/`REDIS_HOST` dan service Redis.

## Mobile

### Build gagal

Langkah:

1. `flutter clean`
2. `flutter pub get`
3. Build ulang:
   - `flutter build apk --flavor dev --debug`

### Gagal login

Periksa:

1. API URL (`API_BASE_URL`) sesuai environment.
2. Backend aktif dan bisa diakses.
3. Credential benar.

### Sinkronisasi offline tidak jalan

Periksa:

1. Perangkat sudah online.
2. Login ulang aplikasi.
3. Lihat ulang data setelah refresh.

## Deploy Produksi

### Deployment script gagal

1. Pastikan file `.env.production` ada di `backend/`.
2. Pastikan image backend tersedia (`BACKEND_IMAGE`).
3. Jalankan:
   - `bash backend/scripts/deploy.sh`

### Backup database

Jalankan:

- `bash backend/scripts/backup-db.sh`

Restore manual:

1. `gunzip backup_YYYYMMDD_HHMMSS.sql.gz`
2. `docker compose -f backend/docker-compose.prod.yml exec -T postgres psql -U postgres bumas_ansor < backup_YYYYMMDD_HHMMSS.sql`

