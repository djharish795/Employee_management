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
    // Enforce noeviction policy required by BullMQ for reliable queue operations.
    // This suppresses the "IMPORTANT! Eviction policy is volatile-lru" warning
    // and ensures queued jobs are never silently dropped due to memory pressure.
    if (this.client.status === "ready") {
      try {
        await this.client.config("SET", "maxmemory-policy", "noeviction");
      } catch {
        // AWS ElastiCache may not allow CONFIG SET — safe to ignore in managed environments.
      }
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

  async del(...keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await this.connect();
    await this.client.del(...keys);
  }

  async keys(pattern: string): Promise<string[]> {
    await this.connect();
    return this.client.keys(pattern);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
