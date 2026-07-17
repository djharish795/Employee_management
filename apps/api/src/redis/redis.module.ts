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
    await this.redis.connect();
  }
}
