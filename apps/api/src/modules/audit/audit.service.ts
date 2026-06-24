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
}
