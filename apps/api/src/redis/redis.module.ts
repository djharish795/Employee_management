import { Global, Module, OnModuleInit } from "@nestjs/common";
import { RedisService } from "./redis.service";

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule implements OnModuleInit {
  constructor(private readonly redis: RedisService) {}

  async onModuleInit() {
    // Connect eagerly and set maxmemory-policy to noeviction.
    // BullMQ checks this policy on startup; setting it here ensures
    // the warning "IMPORTANT! Eviction policy is volatile-lru" never appears.
    try {
      // Don't await the connection indefinitely during startup.
      // If it fails, ioredis will keep retrying in the background automatically.
      await Promise.race([
        this.redis.connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis startup connection timeout')), 3000))
      ]);
    } catch (e) {
      console.warn('Redis eager connection timed out (will keep retrying in background)');
    }
  }
}
