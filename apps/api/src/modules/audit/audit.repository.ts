import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import * as crypto from "crypto";

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
  constructor(private readonly prisma: PrismaService) { }

  async create(data: CreateAuditLogData) {
    const actorId = data.actorId === "SYSTEM" || data.actorId === "unknown" ? undefined : data.actorId;
    
    const lastLog = await this.prisma.auditLog.findFirst({
      orderBy: { performedAt: 'desc' }
    });
    const previousHash = (lastLog as any)?.hash || "GENESIS_HASH";
    
    const payloadString = JSON.stringify({
      action: data.action,
      actorId,
      resource: data.resource,
      resourceId: data.resourceId || "N/A",
      newValue: data.newValue,
      oldValue: data.oldValue,
      nonce: crypto.randomUUID()
    });
    
    const hash = crypto.createHash('sha256').update(previousHash + payloadString).digest('hex');

    return this.prisma.auditLog.create({
      data: {
        action: data.action,
        actorId,
        deviceId: data.deviceId,
        ipAddress: data.ipAddress,
        newValue: data.newValue ? data.newValue : undefined,
        oldValue: data.oldValue ? data.oldValue : undefined,
        requestId: data.requestId || "unknown",
        resource: data.resource,
        resourceId: data.resourceId || "N/A",
        userAgent: data.userAgent,
        hash,
        previousHash,
      } as any,
    });
  }

  async getRecentEvents(limit: number, offset: number, filters?: { module?: string; status?: string; actorId?: string; search?: string }) {
    const where: any = {};
    if (filters?.module) where.resource = filters.module;
    if (filters?.actorId) where.actorId = filters.actorId;
    
    if (filters?.status === "FAILED") {
      where.OR = [
        { action: { contains: "FAILED" } },
        { action: { contains: "ERROR" } }
      ];
    } else if (filters?.status === "SUCCESS") {
      where.AND = [
        { action: { not: { contains: "FAILED" } } },
        { action: { not: { contains: "ERROR" } } },
        { action: { not: { contains: "WARNING" } } }
      ];
    } else if (filters?.status === "WARNING") {
      where.action = { contains: "WARNING" };
    }

    if (filters?.search) {
      where.OR = [
        ...(where.OR || []),
        { action: { contains: filters.search, mode: "insensitive" } },
        { resourceId: { contains: filters.search, mode: "insensitive" } },
        { actor: { preferredName: { contains: filters.search, mode: "insensitive" } } },
        { actor: { personalEmail: { contains: filters.search, mode: "insensitive" } } }
      ];
    }

    return this.prisma.auditLog.findMany({
      where,
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
