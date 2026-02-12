# BUMAS Mobile App

Flutter client untuk role Admin, Warung, Kurir, dan Gudang.

## Fitur baseline

- Auth bootstrap + role routing
- Login API (`/auth/login`) + fallback mock login untuk development
- Dashboard admin dari endpoint report
- List produk warung dari endpoint products
- Offline sync queue service dasar

## Jalankan

1. `flutter pub get`
2. `flutter run`

## Struktur penting

- `lib/core/` konfigurasi tema dan network
- `lib/data/` datasource, repository, model, sync
- `lib/presentation/` provider, router, dan screens
