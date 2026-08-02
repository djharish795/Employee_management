import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RedisService } from '../../redis/redis.service';
import { PrismaService } from '../../prisma/prisma.service';
import { MasterAdminGateway } from './master-admin.gateway';

const TELEMETRY_QUEUE_KEY = 'ems:telemetry:ingest_queue';

export interface TelemetryEvent {
  employeeId: string;
  userId: string;
  page: string;
  ipAddress: string;
  internetIp: string;
  deviceData: any;
  timestamp: number;
}

@Injectable()
export class TelemetryBufferService {
  private readonly logger = new Logger(TelemetryBufferService.name);

  constructor(
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
    private readonly gateway: MasterAdminGateway
  ) {}

  /**
   * Pushes a telemetry event into the Redis memory buffer with zero latency.
   * This ensures the database is never hit during high-traffic bursts.
   */
  async ingestEvent(event: TelemetryEvent) {
    try {
      const client = this.redis.getClient();
      
      // OOM CIRCUIT BREAKER: Protect Redis from crashing if DB is offline
      const currentLength = await client.llen(TELEMETRY_QUEUE_KEY);
      if (currentLength > 50000) {
        this.logger.warn('TELEMETRY CIRCUIT BREAKER TRIPPED: Queue exceeded 50,000 items. Discarding event to prevent Redis OOM crash.');
        return;
      }
      
      await client.rpush(TELEMETRY_QUEUE_KEY, JSON.stringify(event));
      
      // We can also emit a live stream update to connected Master Admins if needed,
      // but ActivityService handles the 'online now' status already.
    } catch (e) {
      this.logger.error('Failed to ingest telemetry event to Redis', e);
    }
  }

  /**
   * Background worker that runs every 30 seconds to flush the Redis buffer
   * into the persistent PostgreSQL data lake.
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async flushBufferToDatabase() {
    try {
      const client = this.redis.getClient();
      
      // Atomic pop of all current items
      const length = await client.llen(TELEMETRY_QUEUE_KEY);
      if (length === 0) return;

      // Fetch items from Redis but DO NOT delete them yet
      const items = await client.lrange(TELEMETRY_QUEUE_KEY, 0, length - 1);
      if (!items || items.length === 0) return;

      const records = items.map(i => JSON.parse(i) as TelemetryEvent);
      
      // Transform records for Prisma
      const dbRecords = records.map(r => ({
        employeeId: r.employeeId,
        userId: r.userId,
        page: r.page,
        ipAddress: r.ipAddress,
        internetIp: r.internetIp,
        deviceData: r.deviceData,
        timestamp: new Date(r.timestamp),
        action: 'VIEW', // Can be extended for CLICKs later
        // timeSpentMs is calculated historically by looking at previous logs, we'll leave it null for now
      }));

      await (this.prisma as any).telemetryLog.createMany({
        data: dbRecords,
        skipDuplicates: true,
      });

      // ONLY IF database insert succeeds, safely delete those specific items
      await client.ltrim(TELEMETRY_QUEUE_KEY, length, -1);

      this.logger.log(`Successfully flushed ${dbRecords.length} telemetry logs to persistent storage.`);
    } catch (error) {
      this.logger.error('Failed to flush telemetry buffer to database', error);
    }
  }
}
