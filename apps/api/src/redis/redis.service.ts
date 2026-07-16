import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>("REDIS_HOST");
    if (!host) throw new Error("REDIS_HOST is not defined in environment");
    const port = Number(this.config.get<string>("REDIS_PORT", "6379"));
    const password = this.config.get<string>("REDIS_PASSWORD") || undefined;
    const tlsEnabled = this.config.get<string>("REDIS_TLS", "false") === "true";

    this.client = new Redis({
      host,
      port,
      password,
      tls: tlsEnabled ? {} : undefined,
      maxRetriesPerRequest: null,
      enableOfflineQueue: true,
      lazyConnect: true,
      retryStrategy: (times) => {
        // Exponential backoff: 500ms, 1s, 1.5s..., maxing out at 5 seconds.
        return Math.min(times * 500, 5000);
      },
    });

    this.client.on("error", (error) => {
      this.logger.warn(`Redis error: ${error.message}`);
    });
  }

  async connect(): Promise<void> {
    if (this.client.status === "wait") {
      await this.client.connect();
    }
  }

  getClient(): Redis {
    return this.client;
  }

  async setJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    await this.connect();
    await this.client.set(key, JSON.stringify(value), "EX", ttlSeconds);
  }

  async getJson<T>(key: string): Promise<T | null> {
    await this.connect();
    const raw = await this.client.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  }

  async del(key: string): Promise<void> {
    await this.connect();
    await this.client.del(key);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
