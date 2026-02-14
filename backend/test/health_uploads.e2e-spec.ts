import { INestApplication } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { api, authHeader, closeTestApp, createTestApp, registerAndLogin, resetDatabase, unwrapData } from './e2e-utils';

describe('Health & Uploads (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let adminToken: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    prisma = testApp.prisma;

    await resetDatabase(prisma);

    const admin = await registerAndLogin(app, prisma, {
      email: 'admin@local.test',
      password: 'password123',
      name: 'Admin',
      role: Role.ADMIN,
    });
    adminToken = admin.accessToken;
  });

  afterAll(async () => {
    await closeTestApp(app, prisma);
  });

  it('GET /health returns ok', async () => {
    const res = await api(app).get('/health').expect(200);

    const data = unwrapData<{
      status: string;
      timestamp: string;
      services: { database: string; redis: string };
    }>(res);

    expect(data.status).toBe('ok');
    expect(data.services.database).toBe('up');
    expect(['disabled', 'up'].includes(data.services.redis)).toBe(true);
  });

  it('POST /api/uploads uploads an image and returns url', async () => {
    // 1x1 png
    const pngBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6Xb9ZcAAAAASUVORK5CYII=';
    const buffer = Buffer.from(pngBase64, 'base64');

    const res = await api(app)
      .post('/api/uploads')
      .set(authHeader(adminToken))
      .attach('file', buffer, { filename: 'test.png', contentType: 'image/png' })
      .expect(201);

    const data = unwrapData<{ filename: string; path: string; url: string }>(res);
    expect(data.filename).toMatch(/\.png$/);
    expect(data.path).toMatch(/^\/uploads\/.+\.png$/);
    expect(data.url).toContain('/uploads/');
  });
});
