# BUMAS Ansor Web App - Implementation Plan

## Context
This web app mirrors the mobile POS interface for audit purposes. Built with Next.js + TailwindCSS, mobile-first (480px container).

## Backend API Available (from docs/API.md & schema.prisma)
- Auth: POST /auth/login, POST /auth/refresh, GET /auth/me
- Products: GET /products (BUMAS catalog)
- WarungProducts: Per-warung inventory with sellingPrice & stockQty
- Sales: POST /sales, GET /sales, GET /sales/:id, GET /sales/daily-summary
- Finance: GET /finance/receivables, POST /finance/payments
- Reports: GET /reports/dashboard, GET /reports/daily
- Stock: GET /stocks
- Orders/DO: GET /delivery-orders, POST /delivery-orders/:id/confirm

## Pages Required (from docs 2.md, 4.md, 5.md, 9.md)

### Already Built ✅
1. Login Page (`/login`) - auth with email/password
2. POS Product Grid (`/pos`) - product catalog + search + cart add
3. Cart Bar - floating cart summary

### To Build 🔲
4. **Checkout Page** (`/pos/checkout`)
   - Cart review with qty +/- controls
   - Payment method selection (CASH, QRIS, TRANSFER, EDC)
   - Cash received input + change calculation
   - Process payment → POST /sales
   
5. **Receipt Page** (`/pos/receipt/[id]`)
   - Transaction complete confirmation
   - Receipt display (warung name, items, totals, payment info)
   - Share/print buttons

6. **Transaction History** (`/pos/history`)
   - Daily sales list with filter
   - Daily summary (total omzet, transaction count)
   
7. **Cart Sheet/Drawer** (component)
   - Full cart view with item management
   - Quantity adjustment, remove items
   - Navigate to checkout

8. **Warung Dashboard** (`/dashboard`)
   - Today's sales summary (omzet)
   - Low stock alerts
   - Quick action buttons
   - Recent transactions

## Technical Implementation Order
1. Cart Sheet component (needed for POS flow completion)
2. Checkout Page (core POS functionality)
3. Receipt Page (post-transaction)
4. Transaction History (audit trail)
5. Dashboard (overview)
6. Polish & Integration
