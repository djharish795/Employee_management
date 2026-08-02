import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { resolveGeoInfo, parseDeviceInfo } from './geo-device.util';

const DWELL_KEY_PREFIX = 'dwell:';
const ONLINE_KEY_PREFIX = 'online:';
const ONLINE_TTL_SECONDS = 120;

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async trackActivity(events: any[], ipAddress: string, userAgent: string) {
    if (!events || events.length === 0) return;
    const geo = resolveGeoInfo(ipAddress);
    const device = parseDeviceInfo(userAgent);
    const data = events.map((event) => ({
      employeeId: event.employeeId || null,
      userId: event.userId || null,
      page: event.page || '/',
      action: event.action || 'PAGE_VIEW',
      ipAddress,
      userAgent,
      deviceType: device.deviceType,
      browser: device.browser,
      os: device.os,
      city: geo.city,
      country: geo.country,
      isp: geo.isp,
      sessionId: event.sessionId || null,
      timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
    }));
    await (this.prisma as any).activityLog.createMany({ data });
  }

  async handleHeartbeat(
    employeeId: string,
    userId: string,
    page: string,
    sessionId: string,
    ipAddress: string,
    internetIp: string = 'unknown',
    deviceData: any = {},
    userAgent: string = '',
    idleTimeMs: number = 0,
    isTabFocused: boolean = true
  ) {
    const now = Date.now();
    const dwellKey = `${DWELL_KEY_PREFIX}${employeeId}:${sessionId}:${page}`;
    const client = this.redis.getClient();

    const existing = await client.get(dwellKey);
    if (!existing) {
      await client.set(dwellKey, JSON.stringify({ employeeId, userId, page, sessionId, startTime: now, lastSeen: now }), 'EX', 3600);
    } else {
      const parsed = JSON.parse(existing);
      parsed.lastSeen = now;
      await client.set(dwellKey, JSON.stringify(parsed), 'EX', 3600);
    }

    const onlineKey = `${ONLINE_KEY_PREFIX}${employeeId}`;
    
    // Parse device if not provided
    if (!deviceData || Object.keys(deviceData).length === 0) {
      deviceData = parseDeviceInfo(userAgent);
    }
    
    const payload = { 
      employeeId, 
      userId, 
      page, 
      ipAddress, 
      internetIp, 
      deviceData,
      idleTimeMs,
      isTabFocused,
      lastSeen: now 
    };
    await client.set(onlineKey, JSON.stringify(payload), 'EX', ONLINE_TTL_SECONDS);
  }

  async getOnlineNow(): Promise<any[]> {
    const client = this.redis.getClient();
    let cursor = '0';
    const keys: string[] = [];

    do {
      // Use SCAN to prevent blocking the Redis event loop
      const result = await client.scan(cursor, 'MATCH', `${ONLINE_KEY_PREFIX}*`, 'COUNT', 100);
      cursor = result[0];
      keys.push(...result[1]);
    } while (cursor !== '0');

    if (keys.length === 0) return [];
    
    const values = await client.mget(...keys);
    const activeSessions = values
      .filter(Boolean)
      .map((v) => { try { return JSON.parse(v!); } catch { return null; } })
      .filter(Boolean);
      
    if (activeSessions.length === 0) return [];
    
    // Fetch enriched data from DB
    const employeeIds = activeSessions.map(s => s.employeeId);
    const employees = await this.prisma.employee.findMany({
      where: { id: { in: employeeIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        officialEmail: true,
        department: { select: { name: true } },
        designation: { select: { title: true } },
        user: { select: { role: true } }
      }
    });
    
    const employeeMap = new Map(employees.map(e => [e.id, e]));
    
    return activeSessions.map(session => ({
      ...session,
      employee: employeeMap.get(session.employeeId) || null
    }));
  }

  @Cron('*/5 * * * *')
  async flushDwellTimeToDB() {
    this.logger.log('Flushing dwell time data from Redis to PostgreSQL...');
    const client = this.redis.getClient();
    const keys = await client.keys(`${DWELL_KEY_PREFIX}*`);
    if (keys.length === 0) return;

    const values = await client.mget(...keys);
    const updates: any[] = [];

    for (let i = 0; i < keys.length; i++) {
      const val = values[i];
      if (!val) continue;
      try {
        const parsed = JSON.parse(val);
        const durationMs = parsed.lastSeen - parsed.startTime;
        if (durationMs > 5000) {
          updates.push({
            employeeId: parsed.employeeId,
            userId: parsed.userId,
            page: parsed.page,
            action: 'PAGE_DWELL',
            sessionId: parsed.sessionId,
            durationMs,
            timestamp: new Date(parsed.startTime),
          });
        }
      } catch { /* Skip malformed entries */ }
    }

    if (updates.length > 0) {
      await (this.prisma as any).activityLog.createMany({ data: updates });
    }
    const pipeline = client.pipeline();
    keys.forEach((k) => pipeline.del(k));
    await pipeline.exec();
    this.logger.log(`Flushed ${updates.length} dwell records to DB.`);
  }
}
