import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityService } from './activity.service';
import { SecurityAlertService } from './security-alert.service';
import { RedisService } from '../../redis/redis.service';

const MAINTENANCE_MODE_KEY = 'EMS_MAINTENANCE_MODE';

@Injectable()
export class ObservatoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
    private readonly securityAlertService: SecurityAlertService,
    private readonly redis: RedisService,
  ) {}

  async getEmployeeTimeline(employeeId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      (this.prisma as any).activityLog.findMany({
        where: { employeeId },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      (this.prisma as any).activityLog.count({ where: { employeeId } }),
    ]);
    return { data, total, page, limit };
  }

  async getPageAnalytics(days: number) {
    const since = new Date(Date.now() - days * 86400000);
    const results = await (this.prisma as any).activityLog.groupBy({
      by: ['page'],
      where: { timestamp: { gte: since }, action: 'PAGE_DWELL' },
      _sum: { durationMs: true },
      _count: { id: true },
      orderBy: { _sum: { durationMs: 'desc' } },
      take: 20,
    });
    return results.map((r: any) => ({
      page: r.page,
      totalDurationMs: r._sum.durationMs || 0,
      totalDurationMinutes: Math.round((r._sum.durationMs || 0) / 60000),
      visits: r._count.id,
    }));
  }

  async getIpReport(days: number) {
    const since = new Date(Date.now() - days * 86400000);
    const loginEvents = await (this.prisma as any).activityLog.findMany({
      where: { action: 'LOGIN', timestamp: { gte: since } },
      select: { employeeId: true, ipAddress: true, city: true, country: true, timestamp: true },
      orderBy: { timestamp: 'desc' },
    });
    const checkinEvents = await (this.prisma as any).activityLog.findMany({
      where: { action: 'ATTENDANCE_CHECKIN', timestamp: { gte: since } },
      select: { employeeId: true, ipAddress: true, city: true, country: true, timestamp: true },
      orderBy: { timestamp: 'desc' },
    });
    return { loginEvents, checkinEvents };
  }

  async getDeviceReport(days: number) {
    const since = new Date(Date.now() - days * 86400000);
    const [deviceTypes, browsers, osList] = await Promise.all([
      (this.prisma as any).activityLog.groupBy({
        by: ['deviceType'],
        where: { timestamp: { gte: since }, deviceType: { not: null } },
        _count: { id: true },
      }),
      (this.prisma as any).activityLog.groupBy({
        by: ['browser'],
        where: { timestamp: { gte: since }, browser: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      (this.prisma as any).activityLog.groupBy({
        by: ['os'],
        where: { timestamp: { gte: since }, os: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ]);
    return { deviceTypes, browsers, osList };
  }

  async forceLogoutUser(userId: string) {
    await this.prisma.session.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false, revokedAt: new Date() },
    });
    return { success: true, message: `All sessions for user ${userId} have been terminated.` };
  }

  async blockUser(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'SUSPENDED' },
    });
    await this.prisma.session.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false, revokedAt: new Date() },
    });
    return { success: true, message: `User ${userId} has been suspended and all sessions terminated.` };
  }

  async getAllEmployeeSummary() {
    const employees = await this.prisma.employee.findMany({
      where: { status: { in: ['ACTIVE', 'ONBOARDING'] } },
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        officialEmail: true,
        user: { select: { id: true, role: true, status: true, lastLoginAt: true } },
        department: { select: { name: true } },
        designation: { select: { title: true } },
      },
    });
    return employees;
  }

  async getDeepAuditLogs(page: number, limit: number, filters: { action?: string; employeeId?: string; startDate?: string; endDate?: string } = {}) {
    const skip = (page - 1) * limit;
    
    const where: any = {
      action: { in: ['LOGIN', 'LOGOUT', 'ATTENDANCE_CHECKIN', 'ATTENDANCE_CHECKOUT', 'PAGE_DWELL'] }
    };
    
    if (filters.action) where.action = filters.action;
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.startDate && filters.endDate) {
      where.timestamp = { gte: new Date(filters.startDate), lte: new Date(filters.endDate) };
    }

    const [data, total] = await Promise.all([
      (this.prisma as any).activityLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      (this.prisma as any).activityLog.count({ where }),
    ]);
    
    return { data, total, page, limit };
  }

  async forcePasswordReset(userId: string) {
    // Generate a temporary strong password, or flag for reset
    // For this implementation, we will invalidate the password by setting a flag or hashing a random string
    const crypto = require('crypto');
    const bcrypt = require('bcrypt');
    const tempPass = crypto.randomBytes(8).toString('hex');
    const hash = await bcrypt.hash(tempPass, 10);
    
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hash }, // User will have to use "Forgot Password" or IT provides this temp pass
    });
    
    await this.forceLogoutUser(userId);
    return { success: true, message: `Password reset. All sessions terminated.` };
  }

  async forceMfaReset(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { totpSecret: null },
    });
    return { success: true, message: `MFA configuration has been wiped for user.` };
  }

  async overrideUserRole(userId: string, role: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
    });
    return { success: true, message: `User role has been forcefully overridden to ${role}.` };
  }

  async getAuditLogs() {
    return this.prisma.auditLog.findMany({
      orderBy: { performedAt: 'desc' },
      take: 1000
    });
  }

  async getTelemetryHistory() {
    return (this.prisma as any).telemetryLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 2000,
      include: {
        employee: {
          select: { firstName: true, lastName: true, officialEmail: true, department: { select: { name: true } } }
        }
      }
    });
  }

  async getAnomalies() {
    return (this.prisma as any).anomalyEvent.findMany({
      orderBy: { timestamp: 'desc' },
      take: 500
    });
  }

  async getSystemHealth() {
    const os = require('os');
    const v8 = require('v8');
    
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const cpuLoad = os.loadavg()[0]; // 1 minute load average
    const cpus = os.cpus().length;
    const cpuUsagePercent = (cpuLoad / cpus) * 100;
    
    const heapStats = v8.getHeapStatistics();
    const processMemory = process.memoryUsage();

    let dbMetrics: any = null;
    try {
      const metricsData = await (this.prisma as any).$metrics.json();
      dbMetrics = {
        activeConnections: metricsData.counters.find((c: any) => c.name === 'prisma_pool_connections_busy')?.value || 0,
        idleConnections: metricsData.counters.find((c: any) => c.name === 'prisma_pool_connections_idle')?.value || 0,
        totalConnections: metricsData.counters.find((c: any) => c.name === 'prisma_pool_connections_open')?.value || 0,
        queryWaitTime: metricsData.histograms.find((h: any) => h.name === 'prisma_client_queries_wait_histogram')?.sum || 0,
        activeQueries: metricsData.counters.find((c: any) => c.name === 'prisma_client_queries_active')?.value || 0,
      };
    } catch (e) {
      console.warn('Prisma metrics not available or not enabled.', e);
    }

    return {
      os: {
        platform: os.platform(),
        release: os.release(),
        uptime: os.uptime(), // Host OS uptime
      },
      process: {
        uptime: process.uptime(), // Node.js Process uptime
        activeHandles: (process as any)._getActiveHandles ? (process as any)._getActiveHandles().length : 0,
        activeRequests: (process as any)._getActiveRequests ? (process as any)._getActiveRequests().length : 0,
      },
      memory: {
        systemTotal: totalMem,
        systemUsed: usedMem,
        systemFree: freeMem,
        systemUsedPercent: (usedMem / totalMem) * 100,
        processRss: processMemory.rss,
        heapTotal: heapStats.total_heap_size,
        heapUsed: heapStats.used_heap_size,
        heapLimit: heapStats.heap_size_limit,
      },
      cpu: {
        cores: cpus,
        loadAvg: os.loadavg(),
        estimatedUsagePercent: Math.min(cpuUsagePercent, 100),
      },
      database: dbMetrics
    };
  }

  async toggleMaintenanceMode(enable: boolean) {
    const client = this.redis.getClient();
    if (enable) {
      await client.set(MAINTENANCE_MODE_KEY, 'true');
    } else {
      await client.del(MAINTENANCE_MODE_KEY);
    }
    return { success: true, enabled: enable };
  }

  async getMaintenanceStatus() {
    const client = this.redis.getClient();
    const status = await client.get(MAINTENANCE_MODE_KEY);
    return { enabled: status === 'true' };
  }
}
