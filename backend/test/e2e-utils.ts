import { INestApplication, RequestMethod, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { PrismaService } from '../src/prisma/prisma.service';

type RegisterUserInput = {
  email: string;
  password: string;
  name: string;
  role: Role;
  warungId?: string;
};

type LoginResponseData = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    warungId: string | null;
  };
};

export async function createTestApp(): Promise<{
  app: INestApplication;
  prisma: PrismaService;
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.init();

  return {
    app,
    prisma: app.get(PrismaService),
  };
}

export async function closeTestApp(app: INestApplication, prisma: PrismaService) {
  await prisma.$disconnect();
  await app.close();
}

export async function resetDatabase(prisma: PrismaService) {
  await prisma.payment.deleteMany();
  await prisma.receivable.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.dOItem.deleteMany();
  await prisma.deliveryOrder.deleteMany();
  await prisma.pOItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.stockOpname.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.warung.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
}

export function api(app: INestApplication) {
  return request(app.getHttpServer());
}

export function unwrapData<T>(res: request.Response): T {
  expect(res.body.success).toBe(true);
  return res.body.data as T;
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function getErrorMessage(res: request.Response): string {
  const err = res.body?.error;
  if (typeof err === 'string') {
    return err;
  }

  const message = err?.message;
  if (Array.isArray(message)) {
    return message.join(' | ');
  }
  if (typeof message === 'string') {
    return message;
  }

  return JSON.stringify(err ?? '');
}

export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatLocalMonth(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export async function registerAndLogin(
  app: INestApplication,
  payload: RegisterUserInput,
): Promise<{ accessToken: string; refreshToken: string; user: LoginResponseData['user'] }> {
  await api(app).post('/api/auth/register').send(payload).expect(201);

  const login = await api(app)
    .post('/api/auth/login')
    .send({
      email: payload.email,
      password: payload.password,
    })
    .expect(201);

  const data = unwrapData<LoginResponseData>(login);
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: data.user,
  };
}
