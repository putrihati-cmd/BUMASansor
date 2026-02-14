import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client?: Redis;
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('REDIS_URL');
    const host = this.configService.get<string>('REDIS_HOST');
    const port = this.configService.get<string | number>('REDIS_PORT');
    const password = this.configService.get<string>('REDIS_PASSWORD');

    this.enabled = Boolean(url || host || port);

    if (!this.enabled) {
      return;
    }

    if (url && url.trim().length > 0) {
      this.client = new Redis(url, {
        maxRetriesPerRequest: 1,
        lazyConnect: true,
      });
      return;
    }

    this.client = new Redis({
      host: host?.trim() || 'localhost',
      port: typeof port === 'string' ? Number(port) : (port ?? 6379),
      password: password?.trim() || undefined,
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async ping(): Promise<string> {
    if (!this.client) {
      throw new Error('Redis is disabled (missing REDIS_URL/REDIS_HOST/REDIS_PORT).');
    }

    // ioredis supports ping without manual connect; we still try connect once for deterministic errors.
    if (this.client.status === 'wait') {
      await this.client.connect();
    }

    return this.client.ping();
  }

  getClient(): Redis {
    if (!this.client) {
      throw new Error('Redis is disabled (missing REDIS_URL/REDIS_HOST/REDIS_PORT).');
    }
    return this.client;
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      await this.client.quit();
    } catch {
      // Best-effort shutdown: ignore errors when connection isn't established.
    }
  }
}
