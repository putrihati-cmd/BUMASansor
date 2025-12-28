# 📱 n8n Cloud + WAHA Integration Guide

**Infiatin Store - WhatsApp Notification Setup (Production Ready)**

---

## 🎯 Tujuan

Setup WhatsApp notification untuk Infiatin Store menggunakan:
- ✅ **n8n.io Cloud** (Trial 14 hari, upgrade nanti)
- ✅ **WAHA** sebagai WhatsApp API (external service)
- ✅ **HTTP Request Node ONLY** (no custom nodes)
- ✅ **Zero setup server** - langsung pakai

---

## 🏗️ Arsitektur

```
[Infiatin Store di Vercel]
    ↓ (Webhook POST)
[n8n.io Cloud Workflow]
    ↓ (HTTP Request)
[WAHA API Service]
    ↓ (Send Message)
[WhatsApp Customer]
```

**WAHA bisa di-host di:**
- ✅ VPS sederhana (DigitalOcean $5/bulan)
- ✅ Local computer (untuk testing)
- ✅ Cloud platform lain
- ⚠️ Tidak perlu di server yang sama dengan n8n!

---

## 📋 Pre-requisites

### 1. WAHA Running Somewhere

WAHA harus sudah running dan accessible via internet. Contoh:
- `https://waha.yourdomain.com` (recommended)
- `http://your-server-ip:3123` (untuk testing)

**Check WAHA ready:**
```bash
curl https://waha.yourdomain.com/api/sessions
```

Response harus: `status: "WORKING"`

### 2. n8n.io Cloud Account

1. **Buka:** https://n8n.io/
2. **Start Free Trial** (14 hari gratis)
3. **Email confirmation**
4. **Login** ke dashboard

---

## 🚀 Setup n8n Cloud Workflows

### Step 1: Login n8n.io

1. **Akses:** https://app.n8n.cloud/
2. **Login** dengan account Anda
3. Dashboard akan terbuka

### Step 2: Create Workflow - Order Created

#### **2.1 Create New Workflow**

1. Klik **"New Workflow"**
2. Name: `WA - Order Created`

#### **2.2 Add Webhook Node**

1. Klik **"+" button**
2. Search: **"Webhook"**
3. Select **"Webhook"** (trigger node)
4. Configuration:
   ```
   HTTP Method: POST
   Path: order-created
   Authentication: None (atau Header Auth jika mau secure)
   Response: Immediately
   ```
5. **Save**
6. **Copy Webhook URL** (contoh: `https://yourinstance.app.n8n.cloud/webhook/order-created`)

#### **2.3 Add HTTP Request Node (Send WhatsApp)**

1. Klik **"+" button** setelah Webhook
2. Search: **"HTTP Request"**
3. Select **"HTTP Request"**
4. Configuration:

**Authentication:**
```
Authentication: Generic Credential Type
Credential Type: Header Auth
```

Buat credential baru:
- Name: `WAHA API Key`
- Name: `X-Api-Key`
- Value: `infiatin-store-2025DEC-9K7XQ2M8L4A6`

**Request Settings:**
```
Method: POST
URL: https://waha.yourdomain.com/api/sendText
```

**Body (JSON):**
```json
{
  "session": "default",
  "chatId": "{{ $json.phone }}@c.us",
  "text": "🎉 *PESANAN BARU*\n\nHalo {{ $json.customerName }}!\n\nPesanan Anda telah dibuat:\n📋 No. Order: *{{ $json.orderNumber }}*\n💰 Total: Rp {{ $json.total }}\n📦 Jumlah Item: {{ $json.itemsCount }}\n\nSilakan lakukan pembayaran.\nTerima kasih! 🙏"
}
```

**Options:**
```
Send Body: true
Body Content Type: JSON
```

5. **Save**

#### **2.4 Test Workflow**

1. Klik **"Test Workflow"**
2. Workflow akan standby untuk receive webhook
3. Test dengan curl dari local:

```bash
curl -X POST https://yourinstance.app.n8n.cloud/webhook/order-created \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "INV-TEST-001",
    "customerName": "John Doe",
    "phone": "6281234567890",
    "total": "Rp 500,000",
    "itemsCount": 3
  }'
```

4. **Check:** WhatsApp message harus terkirim!

#### **2.5 Activate Workflow**

1. Toggle **"Active"** switch (kanan atas)
2. Workflow sekarang production-ready!

---

### Step 3: Workflows Lainnya

Ulangi proses yang sama untuk workflows lain:

#### **3.1 WA - Payment Success**

**Webhook Path:** `payment-success`

**Message Template:**
```json
{
  "session": "default",
  "chatId": "{{ $json.phone }}@c.us",
  "text": "✅ *PEMBAYARAN BERHASIL*\n\nHalo {{ $json.customerName }}!\n\nPembayaran untuk order *{{ $json.orderNumber }}* telah kami terima.\n\nPesanan Anda segera kami proses.\n\nTerima kasih! 🙏"
}
```

#### **3.2 WA - Order Shipped**

**Webhook Path:** `order-shipped`

**Message Template:**
```json
{
  "session": "default",
  "chatId": "{{ $json.phone }}@c.us",
  "text": "📦 *PESANAN DIKIRIM*\n\nHalo {{ $json.customerName }}!\n\nPesanan *{{ $json.orderNumber }}* telah dikirim.\n\n🚚 Kurir: {{ $json.courier }}\n📋 No. Resi: {{ $json.trackingNumber }}\n\nTerimakasih telah berbelanja! 🙏"
}
```

#### **3.3 WA - Order Completed**

**Webhook Path:** `order-completed`

**Message Template:**
```json
{
  "session": "default",
  "chatId": "{{ $json.phone }}@c.us",
  "text": "🎊 *PESANAN SELESAI*\n\nHalo {{ $json.customerName }}!\n\nPesanan *{{ $json.orderNumber }}* telah selesai.\n\nTerima kasih telah berbelanja di Infiatin Store!\n\n⭐ Jangan lupa beri rating & review ya!\n\nSampai jumpa lagi! 🙏"
}
```

#### **3.4 WA - Order Cancelled**

**Webhook Path:** `order-cancelled`

**Message Template:**
```json
{
  "session": "default",
  "chatId": "{{ $json.phone }}@c.us",
  "text": "❌ *PESANAN DIBATALKAN*\n\nHalo {{ $json.customerName }}!\n\nPesanan *{{ $json.orderNumber }}* telah dibatalkan.\n\nAlasan: {{ $json.reason }}\n\nJika ada dana yang perlu dikembalikan, akan kami proses dalam 3-7 hari kerja.\n\nTerima kasih."
}
```

#### **3.5 WA - OTP Verification**

**Webhook Path:** `otp-verification`

**Message Template:**
```json
{
  "session": "default",
  "chatId": "{{ $json.phone }}@c.us",
  "text": "🔐 *KODE VERIFIKASI*\n\nKode OTP Anda: *{{ $json.otp }}*\n\nJangan bagikan kode ini ke siapapun.\n\nBerlaku 5 menit.\n\nInfiatin Store"
}
```

---

## ⚙️ Update .env di Next.js Project

Setelah semua workflows dibuat, update file `.env`:

```env
# ==============================================
# WHATSAPP NOTIFICATIONS (n8n Cloud + WAHA)
# ==============================================

# n8n Cloud Webhooks (ganti dengan URL Anda!)
N8N_WEBHOOK_OTP="https://yourinstance.app.n8n.cloud/webhook/otp-verification"
N8N_WEBHOOK_ORDER_CREATED="https://yourinstance.app.n8n.cloud/webhook/order-created"
N8N_WEBHOOK_ORDER_SHIPPED="https://yourinstance.app.n8n.cloud/webhook/order-shipped"
N8N_WEBHOOK_ORDER_COMPLETED="https://yourinstance.app.n8n.cloud/webhook/order-completed"
N8N_WEBHOOK_ORDER_CANCELLED="https://yourinstance.app.n8n.cloud/webhook/order-cancelled"
N8N_WEBHOOK_PAYMENT_SUCCESS="https://yourinstance.app.n8n.cloud/webhook/payment-success"
N8N_WEBHOOK_PAYMENT_EXPIRED="https://yourinstance.app.n8n.cloud/webhook/payment-expired"
N8N_WEBHOOK_REFUND_REQUESTED="https://yourinstance.app.n8n.cloud/webhook/refund-requested"
N8N_WEBHOOK_SECURITY_ALERT="https://yourinstance.app.n8n.cloud/webhook/security-alert"
N8N_WEBHOOK_ERROR_SPIKE="https://yourinstance.app.n8n.cloud/webhook/error-spike"

# WhatsApp API Key (untuk WAHA)
WHATSAPP_API_KEY="infiatin-store-2025DEC-9K7XQ2M8L4A6"
```

**Update juga di Vercel Environment Variables!**

---

## 🧪 Testing

### Test Manual dari Browser/Postman

```bash
# Test Order Created
curl -X POST https://yourinstance.app.n8n.cloud/webhook/order-created \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "INV-TEST-001",
    "customerName": "Test User",
    "phone": "6281234567890",
    "total": "Rp 500,000",
    "itemsCount": 3
  }'

# Test Payment Success
curl -X POST https://yourinstance.app.n8n.cloud/webhook/payment-success \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "INV-TEST-001",
    "customerName": "Test User",
    "phone": "6281234567890"
  }'
```

**Ganti nomor WhatsApp dengan nomor Anda untuk testing!**

---

## 📊 Monitoring

### n8n Cloud Dashboard

1. **Executions Tab:**
   - See all workflow runs
   - Success/Failed status
   - Execution time
   - Input/Output data

2. **Workflow Tab:**
   - Active/Inactive status
   - Last execution time
   - Error count

3. **Settings:**
   - Webhook URLs
   - Credentials
   - Timezone

### Check Logs

1. Klik workflow
2. Tab **"Executions"**
3. Klik execution untuk detail
4. Lihat input/output setiap node

---

## 🔐 Security Best Practices

### 1. Secure Webhooks (Recommended)

#### Option A: Header Authentication

Di Webhook Node:
```
Authentication: Header Auth
Header Name: X-Webhook-Secret
Header Value: your-secret-key-here
```

Di Vercel `.env`:
```env
N8N_WEBHOOK_SECRET="your-secret-key-here"
```

Di aplikasi saat call webhook:
```javascript
fetch(N8N_WEBHOOK_URL, {
  headers: {
    'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});
```

#### Option B: IP Whitelist (n8n Paid Plan)

Restrict webhook hanya dari Vercel IPs.

### 2. WAHA API Key

Gunakan API key yang strong:
```
WHATSAPP_API_KEY="infiatin-store-2025-RANDOM_STRING_HERE"
```

Jangan share ke public!

---

## 💰 Pricing & Limits

### n8n.io Cloud

**Trial (14 hari):**
- ✅ FREE
- ✅ 5,000 workflow executions
- ✅ 2 active workflows

**Starter ($20/month):**
- ✅ 10,000 executions/month
- ✅ 20 active workflows
- ✅ Team collaboration

**Pro ($50/month):**
- ✅ 50,000 executions/month
- ✅ Unlimited workflows
- ✅ Priority support

### WAHA

**Self-hosted:** FREE
**Cloud WAHA:** Tergantung provider

### Estimasi Biaya Bulanan

- n8n Starter: $20/bulan
- VPS untuk WAHA: $5/bulan (DigitalOcean droplet)
- **Total:** ~$25/bulan

**💡 Untuk 100-500 orders/bulan sudah cukup dengan Starter plan!**

---

## 🔄 Migrasi ke Self-Hosted (Future)

### Kenapa Migrasi?

- ✅ Hemat biaya (self-host = gratis)
- ✅ Full control
- ✅ Unlimited executions
- ✅ Private data

### Cara Migrasi (Nanti)

1. **Export Workflows dari n8n Cloud:**
   - Workflow → Settings → Export

2. **Setup n8n Self-Hosted:**
   - Deploy ke VPS (gunakan panduan AWS_N8N_WAHA_SETUP.md)
   - Import workflows

3. **Update Environment Variables:**
   - Ganti webhook URLs dari n8n.cloud ke server Anda
   - Redeploy Vercel

4. **Test & Switch:**
   - Test semua workflows
   - Deactivate n8n Cloud workflows
   - Activate self-hosted workflows

**GOOD NEWS:** Karena menggunakan HTTP Request node (bukan custom node), migrasi akan smooth! ✅

---

## 🆘 Troubleshooting

### Webhook tidak terpanggil

**Check:**
1. Workflow ACTIVE? (toggle switch)
2. URL benar di `.env`?
3. Test dengan curl manual

### Message tidak terkirim

**Check:**
1. WAHA running?
   ```bash
   curl https://waha.yourdomain.com/api/sessions
   ```
2. WhatsApp session connected?
3. Phone format benar? (628xxx@c.us)
4. WAHA API key benar?

### n8n execution failed

**Check:**
1. n8n → Executions → Klik failed execution
2. Lihat error message di node yang merah
3. Check input data format

### WAHA timeout

**Check:**
1. WAHA server up?
2. Network accessible dari n8n Cloud?
3. Response time > 30s? (increase timeout di HTTP Request node)

---

## ✅ Production Checklist

### Before Go Live

- [ ] n8n Cloud account created & verified
- [ ] Trial activated (14 hari)
- [ ] WAHA deployed & WhatsApp connected
- [ ] WAHA accessible via public URL (https)
- [ ] All 10 workflows created & tested
- [ ] Webhooks URLs saved di `.env`
- [ ] `.env` uploaded ke Vercel
- [ ] Test dari production app
- [ ] Monitor n8n Executions tab
- [ ] Setup budget alert (jika perlu upgrade plan)

### After Go Live

- [ ] Monitor execution count (jangan exceed limit)
- [ ] Check WAHA session daily (auto-reconnect jika disconnect)
- [ ] Review n8n logs weekly
- [ ] Plan upgrade jika traffic tinggi
- [ ] Backup workflows (export JSON)

---

## 📚 Resources

- **n8n Cloud:** https://n8n.io/
- **n8n Docs:** https://docs.n8n.io/
- **WAHA Docs:** https://waha.devlike.pro/
- **HTTP Request Node:** https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/

---

## 🎯 Summary

**Setup Flow:**
1. ✅ WAHA deployed & running
2. ✅ n8n.io Cloud account created
3. ✅ 10 workflows created (Webhook → HTTP Request)
4. ✅ Webhook URLs di `.env`
5. ✅ Test & activate
6. ✅ Production ready!

**Advantages:**
- ⚡ Langsung jalan (no server setup)
- 💰 Murah untuk start ($0 trial, $20/bulan starter)
- 🔄 Easy migration ke self-host nanti
- 🛠️ Zero maintenance (n8n Cloud managed)

**Migration Path:**
Trial (14 hari) → Starter ($20/bulan untuk 6 bulan) → Self-Hosted (gratis forever)

---

**Status:** ✅ Production Ready  
**Setup Time:** ~30 menit  
**Cost:** $0 (trial) → $20/bulan (starter)  
**Scalability:** 10,000 executions/bulan (cukup untuk 500+ orders)

**Last Updated:** 2025-12-29
