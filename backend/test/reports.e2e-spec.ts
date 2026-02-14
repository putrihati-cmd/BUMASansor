import { INestApplication } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  api,
  authHeader,
  closeTestApp,
  createTestApp,
  formatLocalDate,
  formatLocalMonth,
  registerAndLogin,
  resetDatabase,
  unwrapData,
} from './e2e-utils';

describe('Reports API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let adminToken: string;
  let gudangToken: string;
  let kurirToken: string;
  let warungToken: string;

  let warungId: string;
  let warehouseId: string;
  let productAId: string;
  let productBId: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    prisma = testApp.prisma;
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
    await seedReportData();
  });

  afterAll(async () => {
    await closeTestApp(app, prisma);
  });

  async function seedReportData() {
    const admin = await registerAndLogin(app, prisma, {
      email: 'admin.reports@bumas.test',
      password: 'password123',
      name: 'Admin Reports',
      role: Role.ADMIN,
    });
    adminToken = admin.accessToken;

    const gudang = await registerAndLogin(app, prisma, {
      email: 'gudang.reports@bumas.test',
      password: 'password123',
      name: 'Gudang Reports',
      role: Role.GUDANG,
    });
    gudangToken = gudang.accessToken;

    const kurir = await registerAndLogin(app, prisma, {
      email: 'kurir.reports@bumas.test',
      password: 'password123',
      name: 'Kurir Reports',
      role: Role.KURIR,
    });
    kurirToken = kurir.accessToken;

    const warehouseRes = await api(app)
      .post('/api/warehouses')
      .set(authHeader(adminToken))
      .send({
        name: 'Warehouse Reports',
        location: 'Banyumas',
      })
      .expect(201);
    warehouseId = unwrapData<{ id: string }>(warehouseRes).id;

    const categoryRes = await api(app)
      .post('/api/categories')
      .set(authHeader(adminToken))
      .send({ name: 'Kategori Reports' })
      .expect(201);
    const categoryId = unwrapData<{ id: string }>(categoryRes).id;

    const productARes = await api(app)
      .post('/api/products')
      .set(authHeader(adminToken))
      .send({
        name: 'Produk Report A',
        barcode: 'RPT-A',
        categoryId,
        buyPrice: 2000,
        sellPrice: 3000,
        unit: 'pcs',
      })
      .expect(201);
    productAId = unwrapData<{ id: string }>(productARes).id;

    const productBRes = await api(app)
      .post('/api/products')
      .set(authHeader(adminToken))
      .send({
        name: 'Produk Report B',
        barcode: 'RPT-B',
        categoryId,
        buyPrice: 5000,
        sellPrice: 7000,
        unit: 'pcs',
      })
      .expect(201);
    productBId = unwrapData<{ id: string }>(productBRes).id;

    const warungRes = await api(app)
      .post('/api/warungs')
      .set(authHeader(adminToken))
      .send({
        name: 'Warung Reports',
        ownerName: 'Bu Reports',
        creditLimit: 1500000,
        creditDays: 14,
      })
      .expect(201);
    warungId = unwrapData<{ id: string }>(warungRes).id;

    const warung = await registerAndLogin(app, prisma, {
      email: 'warung.reports@bumas.test',
      password: 'password123',
      name: 'Warung Reports User',
      role: Role.WARUNG,
      warungId,
    });
    warungToken = warung.accessToken;

    await api(app)
      .post('/api/stocks/movement')
      .set(authHeader(gudangToken))
      .send({
        movementType: 'IN',
        productId: productAId,
        quantity: 200,
        toWarehouseId: warehouseId,
      })
      .expect(201);

    await api(app)
      .post('/api/stocks/movement')
      .set(authHeader(gudangToken))
      .send({
        movementType: 'IN',
        productId: productBId,
        quantity: 120,
        toWarehouseId: warehouseId,
      })
      .expect(201);

    await api(app)
      .post('/api/sales')
      .set(authHeader(warungToken))
      .send({
        warungId,
        warehouseId,
        paymentMethod: 'CASH',
        items: [
          {
            productId: productAId,
            quantity: 10,
            price: 3000,
          },
        ],
      })
      .expect(201);

    const creditSaleRes = await api(app)
      .post('/api/sales')
      .set(authHeader(warungToken))
      .send({
        warungId,
        warehouseId,
        paymentMethod: 'CREDIT',
        paidAmount: 5000,
        items: [
          {
            productId: productBId,
            quantity: 5,
            price: 7000,
          },
        ],
      })
      .expect(201);
    const creditSale = unwrapData<{ id: string }>(creditSaleRes);

    const receivable = await prisma.receivable.findFirst({
      where: {
        saleId: creditSale.id,
      },
    });

    if (!receivable) {
      throw new Error('Expected receivable to be generated from credit sale');
    }

    await api(app)
      .post('/api/finance/payments')
      .set(authHeader(adminToken))
      .send({
        receivableId: receivable.id,
        amount: 10000,
        method: 'TRANSFER',
      })
      .expect(201);
  }

  it('returns dashboard report data with aggregates', async () => {
    const res = await api(app)
      .get('/api/reports/dashboard')
      .set(authHeader(adminToken))
      .expect(200);

    const data = unwrapData<{
      today: { transactions: number; omzet: number; cashIn: number };
      receivables: { outstanding: number };
      warungs: { active: number; blocked: number };
      topProducts: Array<{ productId: string; quantitySold: number }>;
    }>(res);

    expect(data.today.transactions).toBeGreaterThanOrEqual(2);
    expect(Number(data.today.omzet)).toBeGreaterThan(0);
    expect(Number(data.today.cashIn)).toBeGreaterThan(0);
    expect(Number(data.receivables.outstanding)).toBeGreaterThan(0);
    expect(data.warungs.active).toBeGreaterThanOrEqual(1);
    expect(data.topProducts.length).toBeGreaterThan(0);
  });

  it('returns daily report for selected date', async () => {
    const today = formatLocalDate(new Date());

    const res = await api(app)
      .get(`/api/reports/daily?date=${today}`)
      .set(authHeader(gudangToken))
      .expect(200);

    const data = unwrapData<{
      date: string;
      sales: { transactions: number; omzet: number };
      payments: { count: number; collected: number };
    }>(res);

    expect(data.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(data.sales.transactions).toBeGreaterThanOrEqual(2);
    expect(Number(data.sales.omzet)).toBeGreaterThan(0);
    expect(data.payments.count).toBeGreaterThanOrEqual(1);
  });

  it('returns monthly report for admin', async () => {
    const month = formatLocalMonth(new Date());

    const res = await api(app)
      .get(`/api/reports/monthly?month=${month}`)
      .set(authHeader(adminToken))
      .expect(200);

    const data = unwrapData<{
      period: string;
      sales: { transactions: number; omzet: number; paid: number };
      receivables: { created: number; outstanding: number };
      collections: { amount: number };
    }>(res);

    expect(data.period).toBe(month);
    expect(data.sales.transactions).toBeGreaterThanOrEqual(2);
    expect(Number(data.sales.omzet)).toBeGreaterThan(0);
    expect(Number(data.receivables.created)).toBeGreaterThan(0);
    expect(Number(data.collections.amount)).toBeGreaterThan(0);
  });

  it('returns top product ranking and warung performance', async () => {
    const topRes = await api(app)
      .get('/api/reports/top-products?days=30&top=5')
      .set(authHeader(gudangToken))
      .expect(200);

    const top = unwrapData<
      Array<{ rank: number; productId: string; productName: string; quantitySold: number; revenue: number }>
    >(topRes);

    expect(top.length).toBeGreaterThan(0);
    expect(top[0].rank).toBe(1);
    expect(top[0].quantitySold).toBeGreaterThan(0);

    const warungRes = await api(app)
      .get('/api/reports/warungs?period=monthly')
      .set(authHeader(adminToken))
      .expect(200);

    const warung = unwrapData<{
      period: string;
      warungs: Array<{ warungId: string; totalOrders: number; totalPurchase: number }>;
    }>(warungRes);

    expect(warung.period).toBe('monthly');
    expect(warung.warungs.length).toBeGreaterThan(0);
    expect(warung.warungs[0].totalOrders).toBeGreaterThanOrEqual(1);
    expect(Number(warung.warungs[0].totalPurchase)).toBeGreaterThan(0);
  });

  it('enforces report role access restrictions', async () => {
    await api(app).get('/api/reports/dashboard').set(authHeader(kurirToken)).expect(200);

    await api(app).get('/api/reports/monthly').set(authHeader(gudangToken)).expect(403);
    await api(app).get('/api/reports/warungs').set(authHeader(gudangToken)).expect(403);
    await api(app).get('/api/reports/dashboard').set(authHeader(warungToken)).expect(403);
  });
});
