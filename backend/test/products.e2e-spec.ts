import { randomUUID } from 'crypto';
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

describe('Products API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let adminToken: string;
  let warungToken: string;
  let categoryId: string;

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
    const admin = await registerAndLogin(app, prisma, {
      email: 'admin.products@bumas.test',
      password: 'password123',
      name: 'Admin Products',
      role: Role.ADMIN,
    });
    adminToken = admin.accessToken;

    const warungRes = await api(app)
      .post('/api/warungs')
      .set(authHeader(adminToken))
      .send({
        name: 'Warung Produk',
        ownerName: 'Bu Produk',
        creditLimit: 500000,
        creditDays: 14,
      })
      .expect(201);
    const warungId = unwrapData<{ id: string }>(warungRes).id;

    const warung = await registerAndLogin(app, prisma, {
      email: 'warung.products@bumas.test',
      password: 'password123',
      name: 'Warung Products',
      role: Role.WARUNG,
      warungId,
    });
    warungToken = warung.accessToken;

    const categoryRes = await api(app)
      .post('/api/categories')
      .set(authHeader(adminToken))
      .send({ name: 'Produk Kategori' })
      .expect(201);
    categoryId = unwrapData<{ id: string }>(categoryRes).id;
  }

  it('supports full admin CRUD flow for products', async () => {
    const createdRes = await api(app)
      .post('/api/products')
      .set(authHeader(adminToken))
      .send({
        name: 'Minyak Goreng Premium',
        barcode: 'PROD-001',
        categoryId,
        buyPrice: 14000,
        sellPrice: 16500,
        unit: 'liter',
      })
      .expect(201);

    const created = unwrapData<{
      id: string;
      name: string;
      barcode: string;
      margin: number;
      isActive: boolean;
    }>(createdRes);
    expect(created.id).toBeDefined();
    expect(created.name).toBe('Minyak Goreng Premium');
    expect(created.barcode).toBe('PROD-001');
    expect(Number(created.margin)).toBeCloseTo(17.86, 2);
    expect(created.isActive).toBe(true);

    const listRes = await api(app)
      .get('/api/products?search=minyak&page=1&limit=10')
      .set(authHeader(adminToken))
      .expect(200);
    const listed = unwrapData<{
      items: Array<{ id: string; name: string }>;
      meta: { total: number; page: number; totalPages: number };
    }>(listRes);
    expect(listed.items).toHaveLength(1);
    expect(listed.items[0].id).toBe(created.id);
    expect(listed.meta.total).toBe(1);
    expect(listed.meta.page).toBe(1);
    expect(listed.meta.totalPages).toBe(1);

    const byIdRes = await api(app)
      .get(`/api/products/${created.id}`)
      .set(authHeader(adminToken))
      .expect(200);
    const byId = unwrapData<{ id: string; name: string }>(byIdRes);
    expect(byId.id).toBe(created.id);

    const byBarcodeRes = await api(app)
      .get('/api/products/barcode/PROD-001')
      .set(authHeader(adminToken))
      .expect(200);
    const byBarcode = unwrapData<{ id: string; barcode: string }>(byBarcodeRes);
    expect(byBarcode.id).toBe(created.id);
    expect(byBarcode.barcode).toBe('PROD-001');

    const updatedRes = await api(app)
      .put(`/api/products/${created.id}`)
      .set(authHeader(adminToken))
      .send({
        sellPrice: 17000,
        isActive: false,
      })
      .expect(200);
    const updated = unwrapData<{ margin: number; isActive: boolean }>(updatedRes);
    expect(Number(updated.margin)).toBeCloseTo(21.43, 2);
    expect(updated.isActive).toBe(false);

    await api(app).delete(`/api/products/${created.id}`).set(authHeader(adminToken)).expect(200);

    await api(app).get(`/api/products/${created.id}`).set(authHeader(adminToken)).expect(404);
  });

  it('forbids WARUNG role to create products', async () => {
    await api(app)
      .post('/api/products')
      .set(authHeader(warungToken))
      .send({
        name: 'Produk Forbidden',
        categoryId,
        buyPrice: 1000,
        sellPrice: 1200,
        unit: 'pcs',
      })
      .expect(403);
  });

  it('returns validation error when category does not exist', async () => {
    const res = await api(app)
      .post('/api/products')
      .set(authHeader(adminToken))
      .send({
        name: 'Produk Invalid Category',
        barcode: 'PROD-404',
        categoryId: randomUUID(),
        buyPrice: 1000,
        sellPrice: 1500,
        unit: 'pcs',
      })
      .expect(400);

    expect(getErrorMessage(res)).toContain('Category not found');
  });

  it('supports bulk import endpoint', async () => {
    const res = await api(app)
      .post('/api/products/bulk-import')
      .set(authHeader(adminToken))
      .send([
        {
          name: 'Produk Bulk A',
          barcode: 'BULK-A',
          categoryId,
          buyPrice: 1000,
          sellPrice: 1500,
          unit: 'pcs',
        },
        {
          name: 'Produk Bulk B',
          barcode: 'BULK-B',
          categoryId,
          buyPrice: 2000,
          sellPrice: 3000,
          unit: 'pcs',
        },
      ])
      .expect(201);

    const data = unwrapData<{ total: number; items: Array<{ id: string }> }>(res);
    expect(data.total).toBe(2);
    expect(data.items).toHaveLength(2);
  });
});
