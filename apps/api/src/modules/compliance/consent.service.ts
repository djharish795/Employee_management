import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { RbacGroups } from "../../common/rbac/rbac.config";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class ConsentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getAllConsentLogs() {
    return this.prisma.consentLog.findMany({
      orderBy: { consentedAt: "desc" },
      include: {
        employee: {
          select: { firstName: true, lastName: true },
        },
      },
    });
  }

  async addConsentLog(employeeId: string, purpose: string, collectedById: string, ipAddress: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException("Employee not found");

    const log = await this.prisma.consentLog.create({
      data: {
        employeeId,
        purpose,
        collectedById,
        ipAddress,
      },
    });

    // TODO: Replace 'unknown' with authenticated userId once JWT is implemented
    await this.auditService.logCreate({
      moduleName: 'Compliance',
      entityId: log.id,
      actorId: 'unknown',
      metadata: { employeeId, purpose }
    });

    return log;
  }

  async revokeConsent(id: string, employeeId: string, role?: string) {
    const consent = await this.prisma.consentLog.findUnique({ where: { id } });
    if (!consent) throw new NotFoundException("Consent log not found");
    
    const isAdmin = role && RbacGroups.COMPLIANCE_ADMINS.includes(role as any);
    
    if (consent.employeeId !== employeeId && !isAdmin) {
      throw new NotFoundException("Consent log not found or you don't have permission to revoke it");
    }

    if (consent.revokedAt) {
      return consent; // Already revoked
    }

    const updated = await this.prisma.consentLog.update({
      where: { id },
      data: { revokedAt: new Date() }
    });

    // TODO: Replace 'unknown' with authenticated userId once JWT is implemented
    await this.auditService.logUpdate({
      moduleName: 'Compliance',
      entityId: id,
      actorId: 'unknown',
      metadata: { action: 'REVOKED' }
    });

    return updated;
  }
}
