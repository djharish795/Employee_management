import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

export interface CreateAuditLogDto {
  action: string;
  actorId?: string;
  deviceId?: string;
  ipAddress?: string;
  newValue?: any;
  oldValue?: any;
  requestId?: string;
  resource: string;
  resourceId?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createLog(data: CreateAuditLogDto): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: data.action,
          actorId: data.actorId,
          deviceId: data.deviceId,
          ipAddress: data.ipAddress,
          newValue: data.newValue ? data.newValue : undefined,
          oldValue: data.oldValue ? data.oldValue : undefined,
          requestId: data.requestId || "unknown",
          resource: data.resource,
          resourceId: data.resourceId || "N/A",
          userAgent: data.userAgent,
        },
      });
    } catch (error: any) {
      // Gracefully handle logging failures, never break business requests
      this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
    }
  }

  async getRecentEvents(limit: number = 50, offset: number = 0) {
    const events = await this.prisma.auditLog.findMany({
      take: limit,
      skip: offset,
      orderBy: { performedAt: "desc" },
      include: {
        actor: {
          select: {
            id: true,
            preferredName: true,
            personalEmail: true,
            designation: { select: { title: true } },
          },
        },
      },
    });

    return events.map((e) => ({
      id: e.id,
      timestamp: e.performedAt.toISOString(),
      actor: e.actor
        ? {
            id: e.actor.id,
            name: e.actor.preferredName || e.actor.personalEmail || "Unknown",
            email: e.actor.personalEmail,
            role: e.actor.designation?.title || "Employee",
          }
        : {
            id: e.actorId || "SYS",
            name: "System",
            email: "system@naprocs.com",
            role: "SYSTEM",
          },
      action: e.action,
      module: e.resource,
      target: { id: e.resourceId, name: e.resourceId, type: e.resource },
      status: e.action.includes("FAILED") || e.action.includes("ERROR") ? "FAILED" : "SUCCESS",
      ipAddress: e.ipAddress,
    }));
  }

  async getMetrics24h() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalEvents, failedLogins, dataExports, policyViolations] = await Promise.all([
      this.prisma.auditLog.count({
        where: { performedAt: { gte: oneDayAgo } },
      }),
      this.prisma.auditLog.count({
        where: { performedAt: { gte: oneDayAgo }, action: { contains: "LOGIN_FAILED" } },
      }),
      this.prisma.auditLog.count({
        where: { performedAt: { gte: oneDayAgo }, action: { contains: "DATA_EXPORTED" } },
      }),
      this.prisma.auditLog.count({
        where: { performedAt: { gte: oneDayAgo }, action: { contains: "VIOLATION" } },
      }),
    ]);

    return {
      totalEvents24h: totalEvents,
      failedLogins24h: failedLogins,
      dataExports24h: dataExports,
      criticalWarnings24h: policyViolations,
    };
  }
}
