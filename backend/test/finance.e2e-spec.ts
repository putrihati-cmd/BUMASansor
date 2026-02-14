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

describe('Finance API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let adminToken: string;
  let gudangToken: string;
  let kurirToken: string;
  let warungToken: string;

  let warungId: string;
  let kurirId: string;
  let warehouseId: string;
  let productId: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    prisma = testApp.prisma;
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
    await seedBaseData();
  });

  afterAll(async () => {
    await closeTestApp(app, prisma);
  });

  async function seedBaseData() {
    const admin = await registerAndLogin(app, {
      email: 'admin.finance@bumas.test',
      password: 'password123',
      name: 'Admin Finance',
      role: Role.ADMIN,
    });
    adminToken = admin.accessToken;

    const gudang = await registerAndLogin(app, {
      email: 'gudang.finance@bumas.test',
      password: 'password123',
      name: 'Gudang Finance',
      role: Role.GUDANG,
    });
    gudangToken = gudang.accessToken;

    const kurir = await registerAndLogin(app, {
      email: 'kurir.finance@bumas.test',
      password: 'password123',
      name: 'Kurir Finance',
      role: Role.KURIR,
    });
    kurirToken = kurir.accessToken;
    kurirId = kurir.user.id;

    const warehouseRes = await api(app)
      .post('/api/warehouses')
      .set(authHeader(adminToken))
      .send({
        name: 'Warehouse Finance',
        location: 'Banyumas',
      })
      .expect(201);
    warehouseId = unwrapData<{ id: string }>(warehouseRes).id;

    const categoryRes = await api(app)
      .post('/api/categories')
      .set(authHeader(adminToken))
      .send({ name: 'Kategori Finance' })
      .expect(201);
    const categoryId = unwrapData<{ id: string }>(categoryRes).id;

    const productRes = await api(app)
      .post('/api/products')
      .set(authHeader(adminToken))
      .send({
        name: 'Produk Finance',
        barcode: 'FIN-001',
        categoryId,
        buyPrice: 2000,
        sellPrice: 3000,
        unit: 'pcs',
      })
      .expect(201);
    productId = unwrapData<{ id: string }>(productRes).id;

    const warungRes = await api(app)
      .post('/api/warungs')
      .set(authHeader(adminToken))
      .send({
        name: 'Warung Finance',
        ownerName: 'Bu Finance',
        creditLimit: 1000000,
        creditDays: 14,
      })
      .expect(201);
    warungId = unwrapData<{ id: string }>(warungRes).id;

    const warung = await registerAndLogin(app, {
      email: 'warung.finance@bumas.test',
      password: 'password123',
      name: 'Warung Finance User',
      role: Role.WARUNG,
      warungId,
    });
    warungToken = warung.accessToken;

    await api(app)
      .post('/api/stocks/movement')
      .set(authHeader(gudangToken))
      .send({
        movementType: 'IN',
        productId,
        quantity: 500,
        toWarehouseId: warehouseId,
      })
      .expect(201);
  }

  async function createReceivableByConfirmedDelivery(quantity: number, price = 3000) {
    const doRes = await api(app)
      .post('/api/delivery-orders')
      .set(authHeader(adminToken))
      .send({
        warungId,
        warehouseId,
        items: [{ productId, quantity, price }],
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

    const listRes = await api(app)
      .get(`/api/finance/receivables?warungId=${warungId}`)
      .set(authHeader(adminToken))
      .expect(200);

    const list = unwrapData<{
      items: Array<{ id: string; amount: number; balance: number; deliveryOrderId: string | null }>;
    }>(listRes);

    const receivable = list.items.find((item) => item.deliveryOrderId === delivery.id);
    if (!receivable) {
      throw new Error('Receivable was not created for delivery order');
    }

    return {
      id: receivable.id,
      amount: Number(receivable.amount),
      balance: Number(receivable.balance),
    };
  }

  it('lists receivables with pagination and filter', async () => {
    await createReceivableByConfirmedDelivery(10);
    await createReceivableByConfirmedDelivery(5);

    const res = await api(app)
      .get(`/api/finance/receivables?warungId=${warungId}&page=1&limit=1`)
      .set(authHeader(adminToken))
      .expect(200);

    const data = unwrapData<{
      items: Array<{ id: string }>;
      meta: { page: number; limit: number; total: number; totalPages: number };
    }>(res);

    expect(data.items).toHaveLength(1);
    expect(data.meta.page).toBe(1);
    expect(data.meta.limit).toBe(1);
    expect(data.meta.total).toBe(2);
    expect(data.meta.totalPages).toBe(2);
  });

  it('supports partial and full payment updates', async () => {
    const receivable = await createReceivableByConfirmedDelivery(10);

    const partialRes = await api(app)
      .post('/api/finance/payments')
      .set(authHeader(gudangToken))
      .send({
        receivableId: receivable.id,
        amount: 10000,
        method: 'CASH',
      })
      .expect(201);

    const partial = unwrapData<{
      receivable: { paidAmount: number; balance: number; status: string };
    }>(partialRes);
    expect(Number(partial.receivable.paidAmount)).toBe(10000);
    expect(Number(partial.receivable.balance)).toBe(receivable.amount - 10000);
    expect(partial.receivable.status).toBe('PARTIAL');

    const fullRes = await api(app)
      .post('/api/finance/payments')
      .set(authHeader(adminToken))
      .send({
        receivableId: receivable.id,
        amount: receivable.amount - 10000,
        method: 'TRANSFER',
      })
      .expect(201);

    const full = unwrapData<{
      receivable: { paidAmount: number; balance: number; status: string };
    }>(fullRes);
    expect(Number(full.receivable.paidAmount)).toBe(receivable.amount);
    expect(Number(full.receivable.balance)).toBe(0);
    expect(full.receivable.status).toBe('PAID');

    const statusRes = await api(app)
      .get(`/api/finance/receivables/warung/${warungId}/status`)
      .set(authHeader(adminToken))
      .expect(200);
    const status = unwrapData<{ currentDebt: number; availableCredit: number; isBlocked: boolean }>(statusRes);
    expect(Number(status.currentDebt)).toBe(0);
    expect(status.isBlocked).toBe(false);
  });

  it('fails when payment amount exceeds balance', async () => {
    const receivable = await createReceivableByConfirmedDelivery(5);

    const res = await api(app)
      .post('/api/finance/payments')
      .set(authHeader(adminToken))
      .send({
        receivableId: receivable.id,
        amount: receivable.amount + 1,
        method: 'CASH',
      })
      .expect(400);

    expect(getErrorMessage(res)).toContain('exceeds receivable balance');
  });

  it('fails to pay receivable that is already fully paid', async () => {
    const receivable = await createReceivableByConfirmedDelivery(4);

    await api(app)
      .post('/api/finance/payments')
      .set(authHeader(adminToken))
      .send({
        receivableId: receivable.id,
        amount: receivable.amount,
        method: 'TRANSFER',
      })
      .expect(201);

    const res = await api(app)
      .post('/api/finance/payments')
      .set(authHeader(adminToken))
      .send({
        receivableId: receivable.id,
        amount: 1000,
        method: 'CASH',
      })
      .expect(400);

    expect(getErrorMessage(res)).toContain('already paid');
  });

  it('refreshes overdue status and updates block status', async () => {
    const receivable = await createReceivableByConfirmedDelivery(8);

    const overdueDate = new Date();
    overdueDate.setDate(overdueDate.getDate() - 5);

    await prisma.receivable.update({
      where: { id: receivable.id },
      data: {
        dueDate: overdueDate,
        status: 'UNPAID',
      },
    });

    const refreshRes = await api(app)
      .post('/api/finance/receivables/refresh-overdue')
      .set(authHeader(adminToken))
      .expect(201);

    const refreshed = unwrapData<{ updatedOverdue: number; blockedWarungs: number }>(refreshRes);
    expect(refreshed.updatedOverdue).toBeGreaterThanOrEqual(1);
    expect(refreshed.blockedWarungs).toBeGreaterThanOrEqual(1);

    const agingRes = await api(app)
      .get('/api/finance/receivables/aging')
      .set(authHeader(adminToken))
      .expect(200);

    const aging = unwrapData<{ buckets: { overdue1to30: number } }>(agingRes);
    expect(Number(aging.buckets.overdue1to30)).toBeGreaterThan(0);

    const statusRes = await api(app)
      .get(`/api/finance/receivables/warung/${warungId}/status`)
      .set(authHeader(adminToken))
      .expect(200);
    const status = unwrapData<{ isBlocked: boolean; blockedReason: string | null }>(statusRes);
    expect(status.isBlocked).toBe(true);
    expect(status.blockedReason).toContain('Auto blocked');
  });

  it('enforces finance endpoint roles', async () => {
    const receivable = await createReceivableByConfirmedDelivery(3);

    await api(app)
      .get('/api/finance/receivables')
      .set(authHeader(warungToken))
      .expect(200);

    await api(app)
      .post('/api/finance/payments')
      .set(authHeader(warungToken))
      .send({
        receivableId: receivable.id,
        amount: 1000,
        method: 'CASH',
      })
      .expect(403);
  });
});