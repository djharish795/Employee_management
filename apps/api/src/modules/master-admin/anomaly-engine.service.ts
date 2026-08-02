import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SecurityAlertService } from './security-alert.service';

const ANOMALY_IP_TRACKER_PREFIX = 'ems:anomaly:ip_track:';

export interface AnomalyEventParams {
  employeeId: string;
  userId: string;
  page: string;
  internetIp: string;
  deviceData: any;
}

@Injectable()
export class AnomalyEngineService {
  private readonly logger = new Logger(AnomalyEngineService.name);

  // Restricted namespaces that only specific high-level roles should access
  private readonly RESTRICTED_NAMESPACES = ['/cto', '/admin', '/executive', '/ceo', '/hr', '/finance'];

  constructor(
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
    private readonly securityAlert: SecurityAlertService
  ) {}

  /**
   * Evaluates telemetry payload instantly in memory to catch malicious behavior.
   */
  async evaluate(params: AnomalyEventParams, userRole: string) {
    try {
      await Promise.all([
        this.checkUrlTampering(params.page, userRole, params.employeeId),
        this.checkCredentialSharing(params.employeeId, params.internetIp, params.deviceData)
      ]);
    } catch (e) {
      this.logger.error('Failed anomaly evaluation', e);
    }
  }

  private async checkUrlTampering(page: string, role: string, employeeId: string) {
    // Basic check: if an EMPLOYEE is trying to hit /ceo or /admin routes
    const roleUpper = role.toUpperCase();
    for (const ns of this.RESTRICTED_NAMESPACES) {
      if (page.startsWith(ns)) {
        if (roleUpper === 'EMPLOYEE' || roleUpper === 'MANAGER') {
          // Trigger anomaly
          await this.triggerAnomaly(
            employeeId,
            'URL_TAMPERING',
            'HIGH',
            { route: page, currentRole: role }
          );
          
          await this.securityAlert.createAlert({
            employeeId,
            type: 'URL_TAMPERING',
            severity: 'HIGH',
            details: {
              message: `User attempted to access restricted namespace: ${ns}`,
              module: 'Routing',
              ipAddress: 'N/A'
            }
          });
        }
      }
    }
  }

  private async checkCredentialSharing(employeeId: string, internetIp: string, deviceData: any) {
    if (!internetIp || internetIp === 'unknown' || internetIp === '127.0.0.1') return;

    const client = this.redis.getClient();
    const trackerKey = `${ANOMALY_IP_TRACKER_PREFIX}${employeeId}`;
    
    // Store the last 3 unique IPs used in the last 15 minutes
    await client.zadd(trackerKey, Date.now(), internetIp);
    await client.zremrangebyscore(trackerKey, '-inf', Date.now() - 15 * 60 * 1000); // 15 min TTL

    const activeIps = await client.zcard(trackerKey);
    
    // If we see 3 distinct public IPs jumping within 15 minutes, it's credential sharing
    if (activeIps >= 3) {
      await this.triggerAnomaly(
        employeeId,
        'CREDENTIAL_SHARE',
        'CRITICAL',
        { detectedIps: activeIps, latestIp: internetIp }
      );
    }
  }

  private async triggerAnomaly(employeeId: string, type: string, severity: string, details: any) {
    // Rate limit to prevent DB flood if they spam F5
    const limitKey = `ems:anomaly:ratelimit:${employeeId}:${type}`;
    const client = this.redis.getClient();
    const isRateLimited = await client.get(limitKey);
    if (isRateLimited) return;

    await client.set(limitKey, '1', 'EX', 300); // 5 minutes cool-off

    await (this.prisma as any).anomalyEvent.create({
      data: {
        employeeId,
        type,
        severity,
        details,
      }
    });
    
    this.logger.warn(`Anomaly Detected: [${type}] for ${employeeId}`);
  }
}
