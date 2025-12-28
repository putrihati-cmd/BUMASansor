# 🔍 Sentry Setup & Usage Guide

**Real-time Error Monitoring untuk Infiatin Store**

---

## 📋 Table of Contents

1. [Apa itu Sentry?](#apa-itu-sentry)
2. [Setup Account](#setup-account)
3. [Konfigurasi Project](#konfigurasi-project)
4. [Testing](#testing)
5. [Cara Menggunakan](#cara-menggunakan)
6. [Monitoring Dashboard](#monitoring-dashboard)
7. [Advanced Usage](#advanced-usage)
8. [Best Practices](#best-practices)

---

## 🎯 Apa itu Sentry?

**Sentry** adalah platform error monitoring yang:
- ✅ Mendeteksi error secara real-time
- ✅ Capture stack traces lengkap
- ✅ Track performance issues
- ✅ Recording session replays
- ✅ Alert via email/Slack/Discord
- ✅ Grouping error yang sama
- ✅ Source map support

**Kenapa penting?**
- Tahu error production sebelum user complain
- Debug lebih cepat dengan context lengkap
- Monitor performa aplikasi
- Track error trends & regressions

---

## 🚀 Setup Account

### Step 1: Create Sentry Account

1. **Buka:** https://sentry.io/signup/
2. **Sign up** dengan:
   - Email
   - Google
   - GitHub
3. **Pilih plan:** **Free** (50K errors/month - cukup untuk start)

### Step 2: Create Project

1. **Platform:** Next.js
2. **Project Name:** `infiatin-store`
3. **Alert Frequency:** Default (atau customize)
4. **Team:** Personal (atau create team)

### Step 3: Get DSN (Data Source Name)

Setelah create project, Anda akan dapat **DSN** seperti:
```
https://abc123def456@o123456.ingest.sentry.io/7654321
```

**DSN ini unik untuk project Anda!** Copy dan simpan.

---

## ⚙️ Konfigurasi Project

### Step 1: Install Package (Sudah Done ✅)

Project ini sudah include `@sentry/nextjs` di `package.json`.

### Step 2: Update Environment Variables

**Di file `.env` Anda**, tambahkan:

```env
# ==============================================
# SENTRY ERROR MONITORING
# ==============================================
# Get from: https://sentry.io → Settings → Projects → Client Keys (DSN)
SENTRY_DSN="https://YOUR_KEY@YOUR_ORG.ingest.sentry.io/YOUR_PROJECT_ID"

# Optional: Auth token untuk upload source maps
# Get from: https://sentry.io → Settings → Auth Tokens
SENTRY_AUTH_TOKEN="sntrys_YOUR_AUTH_TOKEN_HERE"
```

**⚠️ IMPORTANT:**
- Ganti `YOUR_KEY`, `YOUR_ORG`, `YOUR_PROJECT_ID` dengan DSN asli Anda
- Jangan commit DSN ke Git (sudah di `.gitignore` ✅)

### Step 3: Update Vercel Environment Variables

Jika deploy ke Vercel:

1. **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add variable:
   - Name: `SENTRY_DSN`
   - Value: `https://...` (DSN Anda)
   - Environment: **Production, Preview, Development**
3. **Save**
4. **Redeploy**

---

## 🧪 Testing

### Method 1: Test Page (Recommended)

1. **Buka browser:** http://localhost:3000/test-sentry
2. **Klik tombol:** "🚨 Trigger Handled Error"
3. **Buka Sentry Dashboard:** https://sentry.io
4. **Lihat tab "Issues"** - Error harus muncul dalam 5-10 detik

### Method 2: Manual Test via Code

Tambahkan di component manapun:

```javascript
'use client';

import * as Sentry from '@sentry/nextjs';

export default function MyComponent() {
  const testSentry = () => {
    try {
      throw new Error('Test error from MyComponent');
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  return <button onClick={testSentry}>Test Sentry</button>;
}
```

### Method 3: Test via API Route

```javascript
// app/api/test-sentry/route.js
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    throw new Error('Test API Error');
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

Test dengan: `curl http://localhost:3000/api/test-sentry`

---

## 📊 Cara Menggunakan

### 1. **Automatic Error Capture (Sudah Aktif)**

Sentry otomatis capture:
- ❌ Unhandled exceptions
- ❌ Promise rejections
- ❌ API errors (500, 404, etc)
- ❌ Database errors

**Tidak perlu coding apa-apa!** 🎉

### 2. **Manual Error Capture**

Untuk error yang di-handle:

```javascript
import * as Sentry from '@sentry/nextjs';

try {
  // Some risky operation
  const result = riskyOperation();
} catch (error) {
  // Log to Sentry
  Sentry.captureException(error);
  
  // Show user-friendly message
  toast.error('Something went wrong. We have been notified.');
}
```

### 3. **Capture dengan Context**

Tambahkan informasi extra:

```javascript
import * as Sentry from '@sentry/nextjs';

try {
  await processPayment(orderId);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      component: 'checkout',
      orderId: orderId,
    },
    extra: {
      paymentMethod: 'midtrans',
      amount: 500000,
    },
    level: 'error', // debug, info, warning, error, fatal
  });
}
```

### 4. **Capture Message (Non-Error)**

Untuk logging penting:

```javascript
import * as Sentry from '@sentry/nextjs';

// Log important events
Sentry.captureMessage('Payment processed successfully', {
  level: 'info',
  tags: {
    orderId: 'INV-123',
    amount: '500000',
  },
});
```

### 5. **Set User Context**

Track user yang mengalami error:

```javascript
import * as Sentry from '@sentry/nextjs';

// Setelah user login
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});

// Setelah logout
Sentry.setUser(null);
```

**Contoh implementasi di login:**

```javascript
// app/api/auth/login/route.js
import * as Sentry from '@sentry/nextjs';

export async function POST(request) {
  try {
    const user = await authenticateUser(credentials);
    
    // Set user context untuk Sentry
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
      role: user.role,
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: 'Login failed' }, { status: 401 });
  }
}
```

### 6. **Set Custom Tags**

Untuk filter & search:

```javascript
import * as Sentry from '@sentry/nextjs';

Sentry.setTag('feature', 'checkout');
Sentry.setTag('payment_gateway', 'midtrans');
Sentry.setContext('order', {
  id: 'INV-123',
  total: 500000,
  items: 3,
});
```

---

## 📈 Monitoring Dashboard

### Akses Dashboard

1. **Login:** https://sentry.io
2. **Projects:** Pilih `infiatin-store`

### Dashboard Sections

#### **1. Issues Tab**
Lihat semua error yang terjadi:
- **New:** Error baru belum direview
- **Unresolved:** Error known tapi belum fix
- **Resolved:** Error yang sudah difix

**Actions:**
- ✅ **Resolve:** Mark sebagai fixed
- 🔕 **Ignore:** Ignore error ini (jika tidak penting)
- 🔖 **Assign:** Assign ke team member
- 📌 **Bookmark:** Tandai sebagai penting

#### **2. Performance Tab**
Monitor performa aplikasi:
- **Transaction Duration:** Waktu response API
- **Throughput:** Request per menit
- **Slow Transactions:** API yang lambat
- **Web Vitals:** LCP, FID, CLS

#### **3. Releases Tab**
Track error per deployment:
- **Version:** Lihat error per version
- **Regression:** Error baru setelah deploy
- **Health:** Success rate deployment

#### **4. Alerts Tab**
Configure notifikasi:
- **Email:** Kirim email saat error
- **Slack:** Post ke Slack channel
- **Discord:** Send to Discord webhook

### Detail Error Page

Klik error untuk lihat:

1. **Stack Trace:**
   - File & line number
   - Function call stack
   - Source code snippet

2. **Breadcrumbs:**
   - User actions sebelum error
   - API calls
   - Navigation history

3. **Tags & Context:**
   - Browser info
   - OS & device
   - User info
   - Custom tags

4. **Similar Issues:**
   - Error serupa
   - Error history

---

## 🔧 Advanced Usage

### 1. Performance Monitoring

Enable di `sentry.client.config.js`:

```javascript
Sentry.init({
  dsn: SENTRY_DSN,
  
  // Sample 10% transactions for performance
  tracesSampleRate: 0.1,
  
  // Track web vitals
  integrations: [
    new Sentry.BrowserTracing({
      tracingOrigins: ['localhost', 'infiatin.store'],
    }),
  ],
});
```

Track custom transaction:

```javascript
import * as Sentry from '@sentry/nextjs';

const transaction = Sentry.startTransaction({
  name: 'Process Order',
  op: 'order.process',
});

try {
  await processOrder(orderId);
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

### 2. Session Replay

Session replay sudah enabled di config (capture 10% sessions):

```javascript
// sentry.client.config.js
replaysSessionSampleRate: 0.1,  // 10% sessions
replaysOnErrorSampleRate: 1.0,  // 100% errors
```

**Cara lihat:**
1. Dashboard → **Session Replay**
2. Klik session
3. Tonton video replay user journey

### 3. Source Maps Upload

Untuk production (agar stack trace readable):

```bash
# Install Sentry CLI
npm install -g @sentry/cli

# Login
sentry-cli login

# Upload source maps saat build
npm run build
```

Source maps akan auto-upload jika `SENTRY_AUTH_TOKEN` di-set.

### 4. Environment Tags

Bedakan error per environment:

```javascript
// sentry.client.config.js
Sentry.init({
  dsn: SENTRY_DSN,
  environment: process.env.NODE_ENV, // development, production, etc
});
```

Filter di dashboard: **Environment: production**

### 5. Release Tracking

Track error per deployment:

```bash
# Set release saat build
SENTRY_RELEASE=$(git rev-parse --short HEAD)

# Build dengan release
npm run build
```

Di dashboard, lihat **Releases** → errors per version.

---

## ✅ Best Practices

### 1. **Jangan Spam Sentry**

❌ **JANGAN:**
```javascript
// Ini akan spam Sentry!
for (let i = 0; i < 1000; i++) {
  Sentry.captureMessage('Processing item');
}
```

✅ **DO:**
```javascript
// Group dan send sekali
Sentry.captureMessage('Processed 1000 items', {
  extra: { count: 1000 }
});
```

### 2. **Filter Sensitive Data**

```javascript
// sentry.client.config.js
beforeSend(event, hint) {
  // Remove password dari event
  if (event.request?.data) {
    delete event.request.data.password;
    delete event.request.data.cardNumber;
  }
  return event;
}
```

### 3. **Set Appropriate Sample Rates**

```javascript
// Development: 100% (untuk testing)
// Production: 10-20% (hemat quota)

tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
```

### 4. **Ignore Non-Critical Errors**

```javascript
ignoreErrors: [
  'Network request failed',  // User offline
  'ResizeObserver loop limit', // Browser quirk
  'Non-Error promise rejection', // Third-party
],
```

### 5. **Use Tags for Search**

```javascript
Sentry.setTag('feature', 'checkout');
Sentry.setTag('payment_method', 'midtrans');
Sentry.setTag('user_role', 'customer');
```

Filter: `feature:checkout payment_method:midtrans`

### 6. **Add User Feedback**

Enable user feedback widget:

```javascript
import * as Sentry from '@sentry/nextjs';

Sentry.showReportDialog({
  eventId: lastEventId,
  title: 'It looks like we're having issues.',
  subtitle: 'Our team has been notified.',
  subtitle2: 'If you'd like to help, tell us what happened below.',
});
```

---

## 🎓 Common Use Cases

### 1. API Error Tracking

```javascript
// app/api/orders/route.js
import * as Sentry from '@sentry/nextjs';

export async function POST(request) {
  try {
    const order = await createOrder(data);
    return NextResponse.json(order);
  } catch (error) {
    // Log to Sentry dengan context
    Sentry.captureException(error, {
      tags: {
        api: 'create_order',
        method: 'POST',
      },
      extra: {
        orderData: JSON.stringify(data),
      },
    });
    
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
```

### 2. Database Error Tracking

```javascript
import * as Sentry from '@sentry/nextjs';
import { prisma } from '@/lib/prisma';

try {
  const users = await prisma.user.findMany();
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      database: 'postgresql',
      query: 'findMany',
      model: 'user',
    },
  });
  throw error;
}
```

### 3. Payment Error Tracking

```javascript
import * as Sentry from '@sentry/nextjs';

try {
  const payment = await midtrans.charge(data);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      payment_gateway: 'midtrans',
      order_id: orderId,
    },
    extra: {
      amount: data.gross_amount,
      status_code: error.status_code,
    },
    level: 'fatal', // High priority!
  });
}
```

### 4. Third-Party API Errors

```javascript
import * as Sentry from '@sentry/nextjs';

try {
  const tracking = await rajaOngkir.getTracking(resi);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      external_api: 'rajaongkir',
      endpoint: 'tracking',
    },
    fingerprint: ['rajaongkir', '{{ default }}'],
  });
}
```

---

## 📊 Monitoring Checklist

- [ ] Sentry account created
- [ ] Project `infiatin-store` created
- [ ] DSN copied to `.env`
- [ ] DSN added to Vercel environment
- [ ] Test error triggered via `/test-sentry`
- [ ] Error muncul di Sentry dashboard
- [ ] Email alerts enabled
- [ ] User context tracking implemented
- [ ] Performance monitoring enabled
- [ ] Source maps configured for production

---

## 🆘 Troubleshooting

### Error tidak muncul di Sentry

**Check:**
1. DSN benar di `.env`?
2. `NODE_ENV` = production? (dev di-disable)
3. Internet connection aktif?
4. Check browser console untuk Sentry errors

**Test:**
```javascript
// Force send even in dev
if (process.env.NODE_ENV === 'development') {
  return event; // Don't return null
}
```

### Too many errors (quota exceeded)

**Solutions:**
1. Increase sample rate filter
2. Ignore common errors
3. Upgrade Sentry plan
4. Fix critical errors first

### Source maps not working

**Check:**
1. `SENTRY_AUTH_TOKEN` set?
2. Build successful?
3. Source maps uploaded?

**Manual upload:**
```bash
sentry-cli releases files <VERSION> upload-sourcemaps ./build
```

---

## 💰 Pricing

### Free Tier (Current)
- ✅ 50K errors/month
- ✅ 1 project
- ✅ 30 days retention
- ✅ Basic performance monitoring
- ✅ Session replay (limited)

### Developer ($29/month)
- ✅ 100K errors/month
- ✅ Unlimited projects
- ✅ 90 days retention
- ✅ Full performance monitoring
- ✅ Unlimited session replay

**💡 Tip:** Free tier cukup untuk starting! Upgrade jika traffic tinggi.

---

## 📚 Resources

- **Sentry Docs:** https://docs.sentry.io/
- **Next.js Integration:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Best Practices:** https://docs.sentry.io/platforms/javascript/best-practices/
- **Dashboard:** https://sentry.io/organizations/YOUR_ORG/issues/

---

**Status:** ✅ Configured & Ready  
**Test Page:** http://localhost:3000/test-sentry  
**Dashboard:** https://sentry.io  

**Last Updated:** 2025-12-29
