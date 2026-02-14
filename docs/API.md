# BUMAS Ansor API

Dokumen ringkas endpoint utama. Kontrak lengkap tetap di `docs/openapi.yaml`.

## Base URL

- Lokal: `http://localhost:3000/api`
- Produksi (contoh): `https://api.bumasansor.com/api`

## Authentication

Semua endpoint (kecuali login/refresh) menggunakan Bearer token:

`Authorization: Bearer <access_token>`

### Login

`POST /auth/login`

```json
{
  "email": "admin@bumas.local",
  "password": "password123"
}
```

### Refresh token

`POST /auth/refresh`

```json
{
  "refreshToken": "..."
}
```

### Register user (admin only)

`POST /auth/register`

Harus memakai akses token admin pada header `Authorization`.

## Modul Endpoint

### Master Data

- `GET /products`, `POST /products`, `PUT /products/{id}`, `DELETE /products/{id}`
- `GET /warungs`, `POST /warungs`, `PUT /warungs/{id}`
- `GET /suppliers`, `POST /suppliers`
- `GET /warehouses`, `POST /warehouses`
- `GET /categories`, `POST /categories`

### Inventory & Distribution

- `GET /stocks`
- `POST /stocks/movement`
- `POST /stocks/opname`
- `POST /purchase-orders`
- `PUT /purchase-orders/{id}/approve`
- `POST /purchase-orders/{id}/receive`
- `POST /delivery-orders`
- `PUT /delivery-orders/{id}/assign-kurir`
- `PUT /delivery-orders/{id}/start-delivery`
- `PUT /delivery-orders/{id}/mark-delivered`
- `POST /delivery-orders/{id}/confirm`

### Sales (POS)

- `POST /sales`
- `GET /sales`
- `GET /sales/{id}`
- `GET /sales/daily-summary`

### Finance

- `GET /finance/receivables`
- `POST /finance/payments`
- `GET /finance/receivables/aging`
- `POST /finance/receivables/refresh-overdue`

### Reports

- `GET /reports/dashboard`
- `GET /reports/daily`
- `GET /reports/monthly`
- `GET /reports/top-products`
- `GET /reports/warungs`

### Utility

- `GET /health` (di luar prefix `/api`)
- `POST /api/uploads` (multipart `file`, menerima PNG/JPG)

## Response Envelope

Secara default API mengembalikan format:

```json
{
  "success": true,
  "path": "/api/products",
  "timestamp": "2026-02-14T00:00:00.000Z",
  "data": {}
}
```

## Referensi Lengkap

- OpenAPI source: `docs/openapi.yaml`
- Swagger UI runtime: `/api/docs`
