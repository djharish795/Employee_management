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
}
