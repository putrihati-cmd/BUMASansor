import { INestApplication } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  api,
  authHeader,
  closeTestApp,
  createTestApp,
  registerAndLogin,
  resetDatabase,
  unwrapData,
} from './e2e-utils';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    prisma = testApp.prisma;
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await closeTestApp(app, prisma);
  });

  it('registers a new user', async () => {
    const res = await api(app)
      .post('/api/auth/register')
      .send({
        email: 'auth.register@bumas.test',
        password: 'password123',
        name: 'Auth Register',
        role: Role.ADMIN,
      })
      .expect(201);

    const data = unwrapData<{
      id: string;
      email: string;
      role: Role;
      password?: string;
    }>(res);

    expect(data.id).toBeDefined();
    expect(data.email).toBe('auth.register@bumas.test');
    expect(data.role).toBe(Role.ADMIN);
    expect(data.password).toBeUndefined();
  });

  it('fails registration with invalid payload', async () => {
    await api(app)
      .post('/api/auth/register')
      .send({
        email: 'invalid-email',
        password: 'short',
        name: 'Auth Invalid',
        role: Role.ADMIN,
      })
      .expect(400);
  });

  it('fails registration when email already exists', async () => {
    await api(app)
      .post('/api/auth/register')
      .send({
        email: 'auth.duplicate@bumas.test',
        password: 'password123',
        name: 'Auth Duplicate',
        role: Role.ADMIN,
      })
      .expect(201);

    await api(app)
      .post('/api/auth/register')
      .send({
        email: 'auth.duplicate@bumas.test',
        password: 'password123',
        name: 'Auth Duplicate Two',
        role: Role.ADMIN,
      })
      .expect(400);
  });

  it('logs in and accesses protected endpoint', async () => {
    const user = await registerAndLogin(app, {
      email: 'auth.login@bumas.test',
      password: 'password123',
      name: 'Auth Login',
      role: Role.ADMIN,
    });

    const meRes = await api(app)
      .get('/api/auth/me')
      .set(authHeader(user.accessToken))
      .expect(200);

    const me = unwrapData<{ email: string; role: Role }>(meRes);
    expect(me.email).toBe('auth.login@bumas.test');
    expect(me.role).toBe(Role.ADMIN);
  });

  it('fails login with wrong password', async () => {
    await api(app)
      .post('/api/auth/register')
      .send({
        email: 'auth.wrongpass@bumas.test',
        password: 'password123',
        name: 'Auth Wrong Password',
        role: Role.ADMIN,
      })
      .expect(201);

    await api(app)
      .post('/api/auth/login')
      .send({
        email: 'auth.wrongpass@bumas.test',
        password: 'not-correct',
      })
      .expect(401);
  });

  it('refreshes token with a valid refresh token', async () => {
    const user = await registerAndLogin(app, {
      email: 'auth.refresh@bumas.test',
      password: 'password123',
      name: 'Auth Refresh',
      role: Role.ADMIN,
    });

    const refreshRes = await api(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: user.refreshToken })
      .expect(201);

    const refreshed = unwrapData<{ accessToken: string; refreshToken: string }>(refreshRes);
    expect(refreshed.accessToken).toBeDefined();
    expect(refreshed.refreshToken).toBeDefined();

    await api(app)
      .get('/api/auth/me')
      .set(authHeader(refreshed.accessToken))
      .expect(200);
  });

  it('fails refresh with invalid token', async () => {
    await api(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'invalid-token-value-for-refresh-test' })
      .expect(401);
  });

  it('revokes refresh token on logout', async () => {
    const user = await registerAndLogin(app, {
      email: 'auth.logout@bumas.test',
      password: 'password123',
      name: 'Auth Logout',
      role: Role.ADMIN,
    });

    await api(app)
      .post('/api/auth/logout')
      .set(authHeader(user.accessToken))
      .send({ refreshToken: user.refreshToken })
      .expect(201);

    await api(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: user.refreshToken })
      .expect(401);
  });
});