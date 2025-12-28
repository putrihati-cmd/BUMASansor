# 📋 Sentry Quick Reference

Quick reference untuk menggunakan Sentry dalam project Infiatin Store.

---

## 🚀 Quick Start

```javascript
import * as Sentry from '@sentry/nextjs';
```

---

## 📝 Common Usage

### 1. Capture Exception
```javascript
try {
  riskyOperation();
} catch (error) {
  Sentry.captureException(error);
}
```

### 2. Capture dengan Context
```javascript
Sentry.captureException(error, {
  tags: {
    component: 'checkout',
    orderId: 'INV-123',
  },
  extra: {
    amount: 500000,
    paymentMethod: 'midtrans',
  },
  level: 'error', // debug, info, warning, error, fatal
});
```

### 3. Capture Message
```javascript
Sentry.captureMessage('Important event occurred', {
  level: 'info',
  tags: { feature: 'payment' },
});
```

### 4. Set User
```javascript
// After login
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});

// After logout
Sentry.setUser(null);
```

### 5. Set Tags
```javascript
Sentry.setTag('feature', 'checkout');
Sentry.setTag('payment_gateway', 'midtrans');
```

### 6. Set Context
```javascript
Sentry.setContext('order', {
  id: 'INV-123',
  total: 500000,
  items: 3,
});
```

---

## 🎯 Real Examples

### API Error Tracking
```javascript
// app/api/orders/route.js
export async function POST(request) {
  try {
    const order = await createOrder(data);
    return NextResponse.json(order);
  } catch (error) {
    Sentry.captureException(error, {
      tags: { api: 'create_order' },
      extra: { data: JSON.stringify(data) },
    });
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

### Database Error
```javascript
try {
  const users = await prisma.user.findMany();
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      database: 'postgresql',
      model: 'user',
    },
  });
}
```

### Payment Error
```javascript
try {
  const payment = await midtrans.charge(data);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      payment_gateway: 'midtrans',
      order_id: orderId,
    },
    level: 'fatal',
  });
}
```

### Client-side Error
```javascript
'use client';
import * as Sentry from '@sentry/nextjs';

export default function MyComponent() {
  const handleSubmit = async () => {
    try {
      await submitForm(data);
    } catch (error) {
      Sentry.captureException(error, {
        tags: { component: 'ContactForm' },
      });
      toast.error('Something went wrong!');
    }
  };
}
```

---

## 📊 Performance Tracking

### Track Transaction
```javascript
const transaction = Sentry.startTransaction({
  name: 'Process Order',
  op: 'order.process',
});

try {
  await processOrder(orderId);
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  Sentry.captureException(error);
} finally {
  transaction.finish();
}
```

### Track Span (sub-operation)
```javascript
const transaction = Sentry.getCurrentHub().getScope().getTransaction();
const span = transaction?.startChild({
  op: 'db.query',
  description: 'Fetch user orders',
});

const orders = await prisma.order.findMany();
span?.finish();
```

---

## 🔍 Dashboard Actions

### Access Dashboard
```
https://sentry.io → Projects → infiatin-store
```

### Tabs
- **Issues:** View all errors
- **Performance:** Monitor speed
- **Releases:** Track deployments
- **Alerts:** Configure notifications

### Issue Actions
- ✅ **Resolve:** Mark as fixed
- 🔕 **Ignore:** Mute this error
- 🔖 **Assign:** Assign to team
- 📌 **Bookmark:** Mark important

### Filters
```
is:unresolved
release:latest
user.email:*@gmail.com
environment:production
level:error
```

---

## 🧪 Testing

### Browser Test
```
http://localhost:3000/test-sentry
```

### API Test
```bash
curl http://localhost:3000/api/test-sentry
```

### Manual Trigger
```javascript
throw new Error('Test Sentry Integration');
```

---

## ⚙️ Configuration

### Environment Variables
```env
SENTRY_DSN="https://key@org.ingest.sentry.io/project"
SENTRY_AUTH_TOKEN="sntrys_token" # Optional
```

### Sample Rates
```javascript
// sentry.client.config.js
tracesSampleRate: 0.1,  // 10% performance
replaysSessionSampleRate: 0.1,  // 10% sessions
replaysOnErrorSampleRate: 1.0,  // 100% errors
```

---

## 🚫 Ignore Errors

```javascript
// sentry.client.config.js
ignoreErrors: [
  'NetworkError',
  'Network request failed',
  'ResizeObserver loop limit',
],
```

---

## 📱 Integration Points

### Login Flow
```javascript
// After successful login
Sentry.setUser({
  id: user.id,
  email: user.email,
  role: user.role,
});
```

### Logout Flow
```javascript
// Clear user context
Sentry.setUser(null);
```

### Checkout Flow
```javascript
Sentry.setTag('checkout_step', 'payment');
Sentry.setContext('cart', {
  items: cart.items.length,
  total: cart.total,
});
```

### Order Processing
```javascript
Sentry.setTag('order_id', orderId);
Sentry.setContext('shipping', {
  courier: 'JNE',
  trackingNumber: resi,
});
```

---

## 💡 Tips

### ✅ DO
- Set user context after login
- Add meaningful tags
- Use appropriate log levels
- Filter sensitive data
- Sample in production (10-20%)

### ❌ DON'T
- Send errors in loops
- Include passwords/tokens
- Spam with non-errors
- Set sample rate to 100% in prod
- Ignore all errors blindly

---

## 🔗 Quick Links

- **Dashboard:** https://sentry.io
- **Docs:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Test Page:** http://localhost:3000/test-sentry
- **Full Guide:** `docs/SENTRY_SETUP_GUIDE.md`

---

**Need Help?** Check main guide: `docs/SENTRY_SETUP_GUIDE.md`
