import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { PrismaClient } from "@naprocs/database";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    // We intentionally DO NOT call this.$connect() here.
    // By relying on Prisma's lazy connection, we ensure that if the VPN is down during startup,
    // Prisma won't enter a permanently failed state. It will simply try to connect when the first query is made.
    this.logger.log('PrismaService initialized (lazy connection enabled).');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
