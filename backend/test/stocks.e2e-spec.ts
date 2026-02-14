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

describe('Stocks API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let adminToken: string;
  let gudangToken: string;
  let warungToken: string;

  let warehouseAId: string;
  let warehouseBId: string;
  let productId: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    prisma = testApp.prisma;
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
    await seedMasterData();
  });

  afterAll(async () => {
    await closeTestApp(app, prisma);
  });

  async function seedMasterData() {
    const admin = await registerAndLogin(app, {
      email: 'admin.stocks@bumas.test',
      password: 'password123',
      name: 'Admin Stocks',
      role: Role.ADMIN,
    });
    adminToken = admin.accessToken;

    const gudang = await registerAndLogin(app, {
      email: 'gudang.stocks@bumas.test',
      password: 'password123',
      name: 'Gudang Stocks',
      role: Role.GUDANG,
    });
    gudangToken = gudang.accessToken;

    const warehouseARes = await api(app)
      .post('/api/warehouses')
      .set(authHeader(adminToken))
      .send({
        name: 'Warehouse A Stocks',
        location: 'Banyumas',
      })
      .expect(201);
    warehouseAId = unwrapData<{ id: string }>(warehouseARes).id;

    const warehouseBRes = await api(app)
      .post('/api/warehouses')
      .set(authHeader(adminToken))
      .send({
        name: 'Warehouse B Stocks',
        location: 'Cilacap',
      })
      .expect(201);
    warehouseBId = unwrapData<{ id: string }>(warehouseBRes).id;

    const categoryRes = await api(app)
      .post('/api/categories')
      .set(authHeader(adminToken))
      .send({ name: 'Kategori Stock' })
      .expect(201);
    const categoryId = unwrapData<{ id: string }>(categoryRes).id;

    const productRes = await api(app)
      .post('/api/products')
      .set(authHeader(adminToken))
      .send({
        name: 'Produk Stock',
        barcode: 'STK-001',
        categoryId,
        buyPrice: 5000,
        sellPrice: 7000,
        unit: 'pcs',
      })
      .expect(201);
    productId = unwrapData<{ id: string }>(productRes).id;

    const warungRes = await api(app)
      .post('/api/warungs')
      .set(authHeader(adminToken))
      .send({
        name: 'Warung Stocks',
        ownerName: 'Bu Stocks',
        creditLimit: 200000,
        creditDays: 14,
      })
      .expect(201);
    const warungId = unwrapData<{ id: string }>(warungRes).id;

    const warung = await registerAndLogin(app, {
      email: 'warung.stocks@bumas.test',
      password: 'password123',
      name: 'Warung Stocks User',
      role: Role.WARUNG,
      warungId,
    });
    warungToken = warung.accessToken;
  }

  it('handles stock in, transfer, out, opname, history, and valuation', async () => {
    await api(app)
      .post('/api/stocks/movement')
      .set(authHeader(gudangToken))
      .send({
        movementType: 'IN',
        productId,
        quantity: 50,
        toWarehouseId: warehouseAId,
        notes: 'Initial stock',
      })
      .expect(201);

    const stockA1Res = await api(app)
      .get(`/api/stocks/${warehouseAId}/${productId}`)
      .set(authHeader(adminToken))
      .expect(200);
    expect(unwrapData<{ quantity: number }>(stockA1Res).quantity).toBe(50);

    await api(app)
      .post('/api/stocks/movement')
      .set(authHeader(gudangToken))
      .send({
        movementType: 'TRANSFER',
        productId,
        quantity: 20,
        fromWarehouseId: warehouseAId,
        toWarehouseId: warehouseBId,
      })
      .expect(201);

    const stockA2Res = await api(app)
      .get(`/api/stocks/${warehouseAId}/${productId}`)
      .set(authHeader(adminToken))
      .expect(200);
    expect(unwrapData<{ quantity: number }>(stockA2Res).quantity).toBe(30);

    const stockB1Res = await api(app)
      .get(`/api/stocks/${warehouseBId}/${productId}`)
      .set(authHeader(adminToken))
      .expect(200);
    expect(unwrapData<{ quantity: number }>(stockB1Res).quantity).toBe(20);

    await api(app)
      .post('/api/stocks/movement')
      .set(authHeader(gudangToken))
      .send({
        movementType: 'OUT',
        productId,
        quantity: 5,
        fromWarehouseId: warehouseBId,
      })
      .expect(201);

    await api(app)
      .post('/api/stocks/opname')
      .set(authHeader(gudangToken))
      .send({
        warehouseId: warehouseBId,
        productId,
        actualQty: 10,
        reason: 'Broken items adjustment',
      })
      .expect(201);

    const stockB2Res = await api(app)
      .get(`/api/stocks/${warehouseBId}/${productId}`)
      .set(authHeader(adminToken))
      .expect(200);
    expect(unwrapData<{ quantity: number }>(stockB2Res).quantity).toBe(10);

    const historyRes = await api(app)
      .get(`/api/stocks/movements/history?productId=${productId}`)
      .set(authHeader(adminToken))
      .expect(200);
    const history = unwrapData<Array<{ movementType: string }>>(historyRes);
    expect(history.length).toBeGreaterThanOrEqual(4);
    expect(history.some((row) => row.movementType === 'TRANSFER')).toBe(true);
    expect(history.some((row) => row.movementType === 'ADJUSTMENT')).toBe(true);

    const valuationRes = await api(app)
      .get('/api/stocks/valuation/total')
      .set(authHeader(adminToken))
      .expect(200);
    const valuation = unwrapData<{ totalValue: number; items: Array<{ warehouseId: string; value: number }> }>(
      valuationRes,
    );
    expect(valuation.items).toHaveLength(2);
    expect(Number(valuation.totalValue)).toBe(200000);
  });

  it('returns low-stock alert data', async () => {
    await api(app)
      .post('/api/stocks/movement')
      .set(authHeader(gudangToken))
      .send({
        movementType: 'IN',
        productId,
        quantity: 8,
        toWarehouseId: warehouseAId,
      })
      .expect(201);

    const alertsRes = await api(app)
      .get('/api/stocks/alerts/low-stock')
      .set(authHeader(adminToken))
      .expect(200);
    const alerts = unwrapData<Array<{ productId: string; warehouseId: string; quantity: number; minStock: number }>>(
      alertsRes,
    );

    expect(alerts).toHaveLength(1);
    expect(alerts[0].productId).toBe(productId);
    expect(alerts[0].warehouseId).toBe(warehouseAId);
    expect(alerts[0].quantity).toBeLessThan(alerts[0].minStock);
  });

  it('validates stock movement error scenarios', async () => {
    const missingWarehouseRes = await api(app)
      .post('/api/stocks/movement')
      .set(authHeader(gudangToken))
      .send({
        movementType: 'IN',
        productId,
        quantity: 10,
      })
      .expect(400);
    expect(getErrorMessage(missingWarehouseRes)).toContain('toWarehouseId is required');

    const sameWarehouseTransferRes = await api(app)
      .post('/api/stocks/movement')
      .set(authHeader(gudangToken))
      .send({
        movementType: 'TRANSFER',
        productId,
        quantity: 1,
        fromWarehouseId: warehouseAId,
        toWarehouseId: warehouseAId,
      })
      .expect(400);
    expect(getErrorMessage(sameWarehouseTransferRes)).toContain('cannot be the same');

    const insufficientRes = await api(app)
      .post('/api/stocks/movement')
      .set(authHeader(gudangToken))
      .send({
        movementType: 'OUT',
        productId,
        quantity: 100,
        fromWarehouseId: warehouseAId,
      })
      .expect(400);
    expect(getErrorMessage(insufficientRes)).toContain('Insufficient stock');
  });

  it('forbids WARUNG role from listing stocks', async () => {
    await api(app).get('/api/stocks').set(authHeader(warungToken)).expect(403);
  });
});