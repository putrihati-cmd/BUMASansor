# ATURAN BAKU PROYEK BUMAS ANSOR

Dokumen ini menjadi standar kerja tim untuk pengembangan ulang sistem BUMAS Ansor.
Semua keputusan teknis dan eksekusi harian harus mengacu ke aturan di bawah.

## 1) Identitas dan ruang lingkup
- Nama brand resmi: BUMAS Ansor.
- Nama proyek resmi: BUMAS Ansor Platform.
- Fokus produk:
  - Backend operasional distribusi, POS, finance, reporting.
  - Mobile app berbasis Flutter untuk role admin, warung, kurir, gudang.
- Web Next.js yang ada saat ini hanya baseline awal, bukan arsitektur final utama.

## 2) Prinsip arsitektur wajib
- Arsitektur utama: Mobile (Flutter) + Backend API (Node.js/NestJS) + PostgreSQL + Redis.
- Integrasi realtime wajib lewat WebSocket (Socket.io) dan push notification (FCM).
- Desain sistem mengikuti modul inti:
  - Auth
  - Master data (produk, warung, supplier, gudang)
  - Stock dan movement
  - Purchase order
  - Delivery order
  - Sales POS
  - Finance (piutang, pembayaran, credit limit)
  - Reporting

## 3) Kebijakan platform dan tools
- Untuk fase rombak total ini, komponen berikut nonaktif dan tidak dipakai:
  - n8n
  - WAHA
  - Vercel
- Environment produksi lama dianggap tidak berlaku sampai ada setup baru.
- CI/CD default: GitHub Actions.
- Monitoring default saat produksi: Sentry + uptime monitoring + backup harian.

## 4) Standar pengembangan kode
- Backend:
  - Node.js 20+.
  - NestJS + TypeScript.
  - ORM: Prisma (default).
- Mobile:
  - Flutter 3.x.
  - State management: Riverpod (default).
  - HTTP client: Dio.
  - Offline-first: Hive/SQLite + queue sync.
- Prinsip coding:
  - Module-first, bukan file acak.
  - Validasi input wajib di boundary API.
  - Error handling konsisten dan bisa ditrace.
  - Tidak commit secret atau credential ke repo.

## 5) Aturan kualitas minimum
- Setiap endpoint baru wajib punya:
  - Validasi request.
  - Guard/authorization sesuai role.
  - Test minimal untuk jalur sukses dan jalur gagal utama.
- Area kritis wajib review manual ketat:
  - Auth
  - Perhitungan stok
  - Perhitungan piutang/credit limit
  - Pembayaran
  - Laporan keuangan
- Target kualitas awal:
  - API average response < 200 ms untuk endpoint umum.
  - Crash rate app < 1%.
  - Uptime layanan > 99.5% saat sudah live.

## 6) Aturan branch, commit, dan release
- Branch utama: `main`.
- Branch kerja:
  - `feat/<nama-fitur>`
  - `fix/<nama-perbaikan>`
  - `chore/<nama-pekerjaan>`
- Format commit:
  - `feat: ...`
  - `fix: ...`
  - `chore: ...`
  - `docs: ...`
- Dilarang merge ke `main` tanpa verifikasi dasar:
  - Build lulus.
  - Test inti lulus.
  - Tidak ada secret di diff.

## 7) Aturan dokumentasi
- Dokumen acuan awal:
  - `1.md` untuk arsitektur dan struktur modul.
  - `2.md` untuk roadmap implementasi.
- Dokumen baru wajib ringkas, eksekusi-able, dan update jika ada perubahan keputusan.
- Semua perubahan aturan baku harus dicatat di bagian riwayat perubahan.

## 8) Prioritas eksekusi fase awal
- Fase 1 (wajib): fondasi backend + schema database + auth + master data.
- Fase 2 (wajib): modul stock, PO, DO, sales, finance.
- Fase 3 (wajib): aplikasi mobile per role + offline-first.
- Fase 4 (wajib): testing, hardening, deployment baru.
- Scope tambahan di luar fase di atas butuh persetujuan dulu.

## 9) Riwayat perubahan
- 2026-02-12: Dokumen dibuat sebagai baseline aturan baku rombak total.
