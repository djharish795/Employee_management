import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class GrievanceService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService
  ) {}

  async getAllGrievanceCases() {
    return this.prisma.grievanceCase.findMany({
      orderBy: { openedAt: "desc" },
      include: {
        employee: {
          select: { firstName: true, lastName: true },
        },
      },
    });
  }

  async getMyGrievances(employeeId: string) {
    return this.prisma.grievanceCase.findMany({
      where: { employeeId },
      orderBy: { openedAt: "desc" },
    });
  }

  async createGrievance(employeeId: string, description: string) {
    const grievance = await this.prisma.grievanceCase.create({
      data: {
        employeeId,
        description,
        status: "OPEN",
      }
    });

    await this.auditService.logCreate({
      moduleName: 'Compliance',
      entityId: grievance.id,
      actorId: employeeId,
      metadata: { action: 'CREATED_GRIEVANCE' }
    });

    return grievance;
  }

  async resolveGrievance(id: string, resolution: string, resolverId: string) {
    const grievance = await this.prisma.grievanceCase.findUnique({ where: { id } });
    if (!grievance) throw new NotFoundException("Grievance not found");
    if (grievance.status === "RESOLVED") throw new BadRequestException("Grievance is already resolved");

    const updated = await this.prisma.grievanceCase.update({
      where: { id },
      data: {
        status: "RESOLVED",
        resolution,
        resolvedAt: new Date(),
        officerId: resolverId
      }
    });

    await this.auditService.logUpdate({
      moduleName: 'Compliance',
      entityId: id,
      actorId: resolverId,
      metadata: { action: 'RESOLVED_GRIEVANCE' }
    });

    return updated;
  }
}
