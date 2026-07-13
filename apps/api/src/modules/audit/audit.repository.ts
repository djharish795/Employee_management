import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

export interface CreateAuditLogData {
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
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAuditLogData) {
    return this.prisma.auditLog.create({
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
  }

  async getRecentEvents(limit: number, offset: number) {
    return this.prisma.auditLog.findMany({
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
  }

  async countEventsSince(date: Date, actionContains?: string) {
    return this.prisma.auditLog.count({
      where: {
        performedAt: { gte: date },
        ...(actionContains && { action: { contains: actionContains } }),
      },
    });
  }
}
