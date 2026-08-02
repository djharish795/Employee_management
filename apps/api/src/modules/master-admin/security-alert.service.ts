import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';
import { resolveGeoInfo } from './geo-device.util';

@Injectable()
export class SecurityAlertService {
  private readonly logger = new Logger(SecurityAlertService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Called on every check-in. Compares check-in IP vs. the user's most recent login IP.
   * If they are on different subnets, raises an IP_MISMATCH alert.
   */
  async checkIpMismatch(employeeId: string, userId: string, checkinIp: string) {
    try {
      const lastSession = await this.prisma.session.findFirst({
        where: { userId, isActive: true },
        orderBy: { createdAt: 'desc' },
      });
      if (!lastSession) return;

      const loginIp = lastSession.ipAddress;
      if (!loginIp || loginIp === checkinIp) return;

      const loginSubnet = loginIp.split('.').slice(0, 3).join('.');
      const checkinSubnet = checkinIp.split('.').slice(0, 3).join('.');
      if (loginSubnet === checkinSubnet) return;

      const isPrivate = (ip: string) =>
        ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.') || ip === '::1';
      if (isPrivate(loginIp) || isPrivate(checkinIp)) return;

      const loginGeo = resolveGeoInfo(loginIp);
      const checkinGeo = resolveGeoInfo(checkinIp);

      await this.createAlert({
        employeeId,
        userId,
        type: 'IP_MISMATCH',
        severity: 'HIGH',
        loginIp,
        checkinIp,
        loginCity: loginGeo.city,
        checkinCity: checkinGeo.city,
        details: { loginGeo, checkinGeo, message: 'Login IP and Check-In IP are on different networks.' },
      });
    } catch (err) {
      this.logger.error('Failed to run IP mismatch check', err);
    }
  }

  /**
   * Called on every login. Detects if there is already an active session from a different IP.
   */
  async checkConcurrentSession(userId: string, newIp: string) {
    try {
      const existingSessions = await this.prisma.session.findMany({
        where: { userId, isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      for (const session of existingSessions) {
        if (session.ipAddress && session.ipAddress !== newIp) {
          const existingSubnet = session.ipAddress.split('.').slice(0, 3).join('.');
          const newSubnet = newIp.split('.').slice(0, 3).join('.');
          if (existingSubnet !== newSubnet) {
            await this.createAlert({
              userId,
              type: 'CONCURRENT_SESSION',
              severity: 'CRITICAL',
              loginIp: newIp,
              details: {
                existingIp: session.ipAddress,
                newIp,
                message: 'Simultaneous login detected from different networks.',
              },
            });
            break;
          }
        }
      }
    } catch (err) {
      this.logger.error('Failed to check concurrent sessions', err);
    }
  }

  async createAlert(data: {
    employeeId?: string;
    userId?: string;
    type: string;
    severity: string;
    loginIp?: string;
    checkinIp?: string;
    loginCity?: string;
    checkinCity?: string;
    details?: any;
  }) {
    const alert = await (this.prisma as any).securityAlert.create({ data });
    this.logger.warn(`Security Alert [${data.severity}] ${data.type} for ${data.employeeId || data.userId}`);

    const adminEmail = process.env.MASTER_ADMIN_EMAIL;
    if (adminEmail) {
      this.emailService.sendEmail(
        adminEmail,
        `[${data.severity}] Security Alert: ${data.type}`,
        'mfa_otp',
        {
          otp: `ALERT: ${data.type}`,
          expiresInMinutes: 0,
          ipAddress: data.loginIp || 'Unknown',
        },
      ).catch((e: Error) => this.logger.error('Failed to send security alert email', e));
    }

    return alert;
  }

  async getAlerts(page: number, limit: number, unresolved: boolean) {
    const skip = (page - 1) * limit;
    const where = unresolved ? { resolvedAt: null } : {};
    const [data, total] = await Promise.all([
      (this.prisma as any).securityAlert.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      (this.prisma as any).securityAlert.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async resolveAlert(alertId: string, resolvedBy: string) {
    return (this.prisma as any).securityAlert.update({
      where: { id: alertId },
      data: { resolvedAt: new Date(), resolvedBy },
    });
  }
}
