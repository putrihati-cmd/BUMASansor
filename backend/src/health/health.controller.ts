import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  async check() {
    const timestamp = new Date().toISOString();

    const dbUp = await this.prisma.$queryRaw`SELECT 1`.then(
      () => true,
      () => false,
    );

    let redis: 'disabled' | 'up' | 'down' = 'disabled';
    if (this.redisService.isEnabled()) {
      redis = await this.redisService.ping().then(
        () => 'up' as const,
        () => 'down' as const,
      );
    }

    const services = {
      database: dbUp ? 'up' : 'down',
      redis,
    };

    const ok = dbUp && redis !== 'down';
    const payload = {
      status: ok ? 'ok' : 'degraded',
      timestamp,
      services,
    };

    if (!ok) {
      throw new ServiceUnavailableException(payload);
    }

    return payload;
  }
}
