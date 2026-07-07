import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors } from "@nestjs/common";
import { ConsentService } from "./consent.service";
import { ErasureService } from "./erasure.service";
import { GrievanceService } from "./grievance.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RbacGuard } from "../../common/guards/rbac.guard";
import { AuditInterceptor } from "../../common/interceptors/audit.interceptor";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { Permission } from "@naprocs/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PrismaService } from "../../prisma/prisma.service";
import { DataErasureRequest } from "@naprocs/database";

@Controller("compliance")
@UseGuards(JwtAuthGuard, RbacGuard)
@UseInterceptors(AuditInterceptor)
export class ComplianceController {
  constructor(
    private consentService: ConsentService,
    private erasureService: ErasureService,
    private grievanceService: GrievanceService,
    private prisma: PrismaService
  ) {}

  @Get("dashboard")
  @Permissions(Permission.READ_EMPLOYEES, Permission.READ_AUDIT)
  async getDashboardStats() {
    const totalDataVolume = "2.4 TB"; // Mock for now until S3 is fully sized
    const consentLogs = await this.consentService.getAllConsentLogs();
    const totalActiveEmployees = await this.prisma.employee.count({ where: { status: "ACTIVE" } });
    
    const activeConsents = consentLogs.filter(c => !c.revokedAt).length;
    const consentCoverage = totalActiveEmployees > 0 
      ? Math.round((activeConsents / totalActiveEmployees) * 100) 
      : 0;

    // Grievance officer info
    const officer = await this.prisma.user.findFirst({
      where: { role: "CHRO" },
      include: { employee: true }
    });

    return {
      totalDataVolume,
      consentCoverage,
      avgErasureTime: "2",
      encryptionStatus: "AES-256 Active",
      grievanceOfficer: officer?.employee ? {
        name: `${officer.employee.firstName} ${officer.employee.lastName}`,
        email: officer.employee.officialEmail,
        phone: officer.employee.phone || "Not Set"
      } : null
    };
  }

  @Get("consents")
  @Permissions(Permission.READ_EMPLOYEES, Permission.READ_AUDIT)
  getConsents() {
    return this.consentService.getAllConsentLogs();
  }

  @Post("consents")
  @Permissions(Permission.WRITE_EMPLOYEES)
  addConsent(@Body() body: { employeeId: string; purpose: string }, @CurrentUser() user: any) {
    // Collect IP if possible, default to internal for now
    return this.consentService.addConsentLog(body.employeeId, body.purpose, user.employeeId, "127.0.0.1");
  }

  @Get("erasures")
  @Permissions(Permission.READ_EMPLOYEES, Permission.READ_AUDIT)
  getErasures(): Promise<DataErasureRequest[]> {
    return this.erasureService.getAllErasureRequests();
  }

  @Post("erasures/:id/process")
  @Permissions(Permission.WRITE_EMPLOYEES)
  processErasure(@Param("id") id: string, @Body() body: { action: "APPROVE" | "REJECT" }, @CurrentUser() user: any): Promise<DataErasureRequest> {
    return this.erasureService.processErasureRequest(id, user.employeeId, body.action);
  }

  @Get("grievances")
  @Permissions(Permission.READ_EMPLOYEES, Permission.READ_AUDIT)
  getGrievances() {
    return this.grievanceService.getAllGrievanceCases();
  }
}
