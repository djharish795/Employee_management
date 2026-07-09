import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ConsentService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.consentLog.create({
      data: {
        employeeId,
        purpose,
        collectedById,
        ipAddress,
      },
    });
  }

  async revokeConsent(id: string, employeeId: string, role?: string) {
    const consent = await this.prisma.consentLog.findUnique({ where: { id } });
    if (!consent) throw new NotFoundException("Consent log not found");
    
    const isAdmin = role && ["SUPER_ADMIN", "CEO", "HR", "COMPLIANCE_OFFICER", "LEGAL"].includes(role);
    
    if (consent.employeeId !== employeeId && !isAdmin) {
      throw new NotFoundException("Consent log not found or you don't have permission to revoke it");
    }

    if (consent.revokedAt) {
      return consent; // Already revoked
    }

    return this.prisma.consentLog.update({
      where: { id },
      data: { revokedAt: new Date() }
    });
  }
}
