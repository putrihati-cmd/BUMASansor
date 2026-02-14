import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { mkdirSync } from 'fs';
import { isAbsolute, join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

function resolveUploadDir(value: string | undefined): string {
  if (!value || value.trim().length === 0) {
    return join(process.cwd(), 'uploads');
  }
  if (isAbsolute(value)) {
    return value;
  }
  return join(process.cwd(), value);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  const corsOrigin = config.get<string>('CORS_ORIGIN');
  if (corsOrigin && corsOrigin.trim().length > 0) {
    const origins = corsOrigin
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    app.enableCors({
      origin: origins,
      credentials: true,
    });
  } else {
    // Dev-friendly default.
    app.enableCors();
  }
  // Keep /health outside the /api prefix for load-balancers and Docker health checks.
  app.setGlobalPrefix('api', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

  // Serve uploaded files (for Nginx-less deployments and local dev).
  const uploadDir = resolveUploadDir(config.get<string>('UPLOAD_DIR'));
  mkdirSync(uploadDir, { recursive: true });
  app.useStaticAssets(uploadDir, { prefix: '/uploads' });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('BUMAS Ansor API')
    .setDescription('Backend API for BUMAS Ansor platform')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
}

bootstrap();
