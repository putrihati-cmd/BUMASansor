import { INestApplication } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  api,
  authHeader,
  closeTestApp,
  createTestApp,
  getErrorMessage,
  registerAndLogin,
  resetDatabase,
  unwrapData,
} from './e2e-utils';

describe('Complete Workflow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let adminToken: string;
  let gudangToken: string;
  let kurirToken: string;
  let warungToken: string;

  let kurirId: string;
  let warungId: string;
  let warehouseId: string;
  let supplierId: string;
  let categoryId: string;
  let productId: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    prisma = testApp.prisma;
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
    await seedActorsAndMasterData();
  });

  afterAll(async () => {
    await closeTestApp(app, prisma);
  });

  async function seedActorsAndMasterData() {
    const admin = await registerAndLogin(app, {
      email: 'admin.workflow@bumas.test',
      password: 'password123',
      name: 'Admin Workflow',
      role: Role.ADMIN,
    });
    adminToken = admin.accessToken;

    const gudang = await registerAndLogin(app, {
      email: 'gudang.workflow@bumas.test',
      password: 'password123',
      name: 'Gudang Workflow',
      role: Role.GUDANG,
    });
    gudangToken = gudang.accessToken;

    const kurir = await registerAndLogin(app, {
      email: 'kurir.workflow@bumas.test',
      password: 'password123',
      name: 'Kurir Workflow',
      role: Role.KURIR,
    });
    kurirToken = kurir.accessToken;
    kurirId = kurir.user.id;

    const warehouseRes = await api(app)
      .post('/api/warehouses')
      .set(authHeader(adminToken))
      .send({
        name: 'Gudang Utama Workflow',
        location: 'Banyumas',
        phone: '081111111111',
      })
      .expect(201);
    warehouseId = unwrapData<{ id: string }>(warehouseRes).id;

    const supplierRes = await api(app)
      .post('/api/suppliers')
      .set(authHeader(adminToken))
      .send({
        name: 'Supplier Workflow',
        contact: 'Workflow PIC',
        phone: '082222222222',
      })
      .expect(201);
    supplierId = unwrapData<{ id: string }>(supplierRes).id;

    const categoryRes = await api(app)
      .post('/api/categories')
      .set(authHeader(adminToken))
      .send({
        name: 'Makanan Workflow',
      })
      .expect(201);
    categoryId = unwrapData<{ id: string }>(categoryRes).id;

    const productRes = await api(app)
      .post('/api/products')
      .set(authHeader(adminToken))
      .send({
        name: 'Produk Workflow',
        barcode: 'WF-001',
        categoryId,
        buyPrice: 2500,
        sellPrice: 3200,
        unit: 'pcs',
      })
      .expect(201);
    productId = unwrapData<{ id: string }>(productRes).id;

    const warungRes = await api(app)
      .post('/api/warungs')
      .set(authHeader(adminToken))
      .send({
        name: 'Warung Workflow',
        ownerName: 'Bu Workflow',
        phone: '083333333333',
        address: 'Purwokerto',
        creditLimit: 200000,
        creditDays: 14,
      })
      .expect(201);
    warungId = unwrapData<{ id: string }>(warungRes).id;

    const warung = await registerAndLogin(app, {
      email: 'warung.workflow@bumas.test',
      password: 'password123',
      name: 'Warung Workflow User',
      role: Role.WARUNG,
      warungId,
    });
    warungToken = warung.accessToken;
  }

  async function addStock(quantity: number) {
    await api(app)
      .post('/api/stocks/movement')
      .set(authHeader(gudangToken))
      .send({
        movementType: 'IN',
        productId,
        quantity,
        toWarehouseId: warehouseId,
      })
      .expect(201);
  }

  describe('PO -> DO -> Sale -> Payment', () => {
    it('runs complete end-to-end flow', async () => {
      const poRes = await api(app)
        .post('/api/purchase-orders')
        .set(authHeader(gudangToken))
        .send({
          supplierId,
          warehouseId,
          items: [
            {
              productId,
              quantity: 100,
              price: 2500,
            },
          ],
          notes: 'PO e2e workflow',
        })
        .expect(201);
      const po = unwrapData<{ id: string; poNumber: string; status: string }>(poRes);
      expect(po.poNumber).toMatch(/^PO-/);
      expect(po.status).toBe('PENDING');

      const approvedRes = await api(app)
        .put(`/api/purchase-orders/${po.id}/approve`)
        .set(authHeader(adminToken))
        .expect(200);
      const approved = unwrapData<{ status: string }>(approvedRes);
      expect(approved.status).toBe('APPROVED');

      const receivedRes = await api(app)
        .post(`/api/purchase-orders/${po.id}/receive`)
        .set(authHeader(gudangToken))
        .expect(201);
      const received = unwrapData<{ status: string }>(receivedRes);
      expect(received.status).toBe('RECEIVED');

      const stockAfterReceiveRes = await api(app)
        .get(`/api/stocks/${warehouseId}/${productId}`)
        .set(authHeader(adminToken))
        .expect(200);
      const stockAfterReceive = unwrapData<{ quantity: number }>(stockAfterReceiveRes);
      expect(stockAfterReceive.quantity).toBe(100);

      const doRes = await api(app)
        .post('/api/delivery-orders')
        .set(authHeader(adminToken))
        .send({
          warungId,
          warehouseId,
          items: [
            {
              productId,
              quantity: 60,
              price: 3200,
            },
          ],
          creditDays: 14,
        })
        .expect(201);
      const delivery = unwrapData<{ id: string; doNumber: string; totalAmount: number }>(doRes);
      expect(delivery.doNumber).toMatch(/^DO-/);
      expect(Number(delivery.totalAmount)).toBe(192000);

      await api(app)
        .put(`/api/delivery-orders/${delivery.id}/assign-kurir`)
        .set(authHeader(adminToken))
        .send({ kurirId })
        .expect(200);

      await api(app)
        .put(`/api/delivery-orders/${delivery.id}/start-delivery`)
        .set(authHeader(kurirToken))
        .expect(200);

      await api(app)
        .put(`/api/delivery-orders/${delivery.id}/mark-delivered`)
        .set(authHeader(kurirToken))
        .expect(200);

      const confirmRes = await api(app)
        .post(`/api/delivery-orders/${delivery.id}/confirm`)
        .set(authHeader(kurirToken))
        .send({ photoProof: 'base64-proof' })
        .expect(201);
      const confirmed = unwrapData<{ status: string }>(confirmRes);
      expect(confirmed.status).toBe('CONFIRMED');

      const receivablesRes = await api(app)
        .get(`/api/finance/receivables?warungId=${warungId}`)
        .set(authHeader(adminToken))
        .expect(200);
      const receivableList = unwrapData<{ items: Array<{ id: string; amount: number; balance: number }> }>(
        receivablesRes,
      );
      expect(receivableList.items).toHaveLength(1);
      const receivableId = receivableList.items[0].id;
      expect(Number(receivableList.items[0].amount)).toBe(192000);
      expect(Number(receivableList.items[0].balance)).toBe(192000);

      const saleRes = await api(app)
        .post('/api/sales')
        .set(authHeader(warungToken))
        .send({
          warungId,
          warehouseId,
          paymentMethod: 'CASH',
          items: [
            {
              productId,
              quantity: 10,
              price: 3500,
            },
          ],
        })
        .expect(201);
      const sale = unwrapData<{ id: string; invoiceNumber: string; totalAmount: number }>(saleRes);
      expect(sale.invoiceNumber).toMatch(/^INV-/);
      expect(Number(sale.totalAmount)).toBe(35000);

      const paymentRes = await api(app)
        .post('/api/finance/payments')
        .set(authHeader(adminToken))
        .send({
          receivableId,
          amount: 192000,
          method: 'TRANSFER',
          proofUrl: 'https://example.com/proof.jpg',
        })
        .expect(201);
      const payment = unwrapData<{
        payment: { id: string; amount: number };
        receivable: { status: string; balance: number; paidAmount: number };
      }>(paymentRes);
      expect(payment.payment.id).toBeDefined();
      expect(Number(payment.payment.amount)).toBe(192000);
      expect(payment.receivable.status).toBe('PAID');
      expect(Number(payment.receivable.balance)).toBe(0);
      expect(Number(payment.receivable.paidAmount)).toBe(192000);

      const stockAfterSalesRes = await api(app)
        .get(`/api/stocks/${warehouseId}/${productId}`)
        .set(authHeader(adminToken))
        .expect(200);
      const stockAfterSales = unwrapData<{ quantity: number }>(stockAfterSalesRes);
      expect(stockAfterSales.quantity).toBe(30);

      const dashboardRes = await api(app)
        .get('/api/reports/dashboard')
        .set(authHeader(adminToken))
        .expect(200);
      const dashboard = unwrapData<{
        today: { omzet: number };
        receivables: { outstanding: number };
      }>(dashboardRes);
      expect(Number(dashboard.today.omzet)).toBeGreaterThan(0);
      expect(Number(dashboard.receivables.outstanding)).toBe(0);
    });
  });

  describe('Error Scenarios', () => {
    it('fails to create DO when credit limit is exceeded', async () => {
      await addStock(1000);

      const doRes = await api(app)
        .post('/api/delivery-orders')
        .set(authHeader(adminToken))
        .send({
          warungId,
          warehouseId,
          items: [
            {
              productId,
              quantity: 100,
              price: 3000,
            },
          ],
          creditDays: 14,
        })
        .expect(400);

      expect(getErrorMessage(doRes)).toContain('Credit limit exceeded');
    });

    it('fails to create sale when stock is insufficient', async () => {
      const saleRes = await api(app)
        .post('/api/sales')
        .set(authHeader(warungToken))
        .send({
          warungId,
          warehouseId,
          paymentMethod: 'CASH',
          items: [
            {
              productId,
              quantity: 1,
            },
          ],
        })
        .expect(400);

      expect(getErrorMessage(saleRes)).toContain('Insufficient stock');
    });

    it('fails to pay receivable with amount greater than remaining balance', async () => {
      await addStock(20);

      const doRes = await api(app)
        .post('/api/delivery-orders')
        .set(authHeader(adminToken))
        .send({
          warungId,
          warehouseId,
          items: [{ productId, quantity: 10, price: 3000 }],
          creditDays: 14,
        })
        .expect(201);
      const delivery = unwrapData<{ id: string }>(doRes);

      await api(app)
        .put(`/api/delivery-orders/${delivery.id}/assign-kurir`)
        .set(authHeader(adminToken))
        .send({ kurirId })
        .expect(200);
      await api(app)
        .put(`/api/delivery-orders/${delivery.id}/start-delivery`)
        .set(authHeader(kurirToken))
        .expect(200);
      await api(app)
        .put(`/api/delivery-orders/${delivery.id}/mark-delivered`)
        .set(authHeader(kurirToken))
        .expect(200);
      await api(app)
        .post(`/api/delivery-orders/${delivery.id}/confirm`)
        .set(authHeader(kurirToken))
        .send({ photoProof: 'proof' })
        .expect(201);

      const receivablesRes = await api(app)
        .get(`/api/finance/receivables?warungId=${warungId}`)
        .set(authHeader(adminToken))
        .expect(200);
      const receivables = unwrapData<{ items: Array<{ id: string }> }>(receivablesRes);
      const receivableId = receivables.items[0].id;

      const paymentRes = await api(app)
        .post('/api/finance/payments')
        .set(authHeader(adminToken))
        .send({
          receivableId,
          amount: 999999,
          method: 'CASH',
        })
        .expect(400);

      expect(getErrorMessage(paymentRes)).toContain('exceeds receivable balance');
    });
  });
});