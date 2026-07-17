import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors, Patch, Ip } from "@nestjs/common";
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
import { DataErasureRequest, ConsentLog, GrievanceCase } from "@naprocs/database";
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { RbacPermissions } from '../../common/rbac/rbac.config';

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

  @RequirePermissions(RbacPermissions.COMPLIANCE_READ)
  @Get("dashboard")
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

  @RequirePermissions(RbacPermissions.COMPLIANCE_READ)
  @Get("consents")
  getConsents() {
    return this.consentService.getAllConsentLogs();
  }

  @RequirePermissions(RbacPermissions.COMPLIANCE_READ)
  @Get("consents/me/status")
  async getMyConsentStatus(@CurrentUser() user: any) {
    const logs = await this.prisma.consentLog.findMany({
      where: { 
        employeeId: user.employeeId, 
        revokedAt: null,
        purpose: "ONBOARDING_PII_DATA_PROCESSING"
      }
    });
    return { hasConsented: logs.length > 0 };
  }

  @RequirePermissions(RbacPermissions.COMPLIANCE_MANAGE)
  @Post("consents/me")
  async addMyConsent(@Body() body: { purpose: string }, @CurrentUser() user: any, @Ip() ip: string) {
    const clientIp = ip || "127.0.0.1";
    return this.consentService.addConsentLog(user.employeeId, body.purpose, user.employeeId, clientIp);
  }

  @RequirePermissions(RbacPermissions.COMPLIANCE_MANAGE)
  @Post("consents")
  addConsent(@Body() body: { employeeId: string; purpose: string }, @CurrentUser() user: any, @Ip() ip: string) {
    const clientIp = ip || "127.0.0.1";
    return this.consentService.addConsentLog(body.employeeId, body.purpose, user.employeeId, clientIp);
  }

  @RequirePermissions(RbacPermissions.COMPLIANCE_READ)
  @Get("erasures")
  getErasures(): Promise<DataErasureRequest[]> {
    return this.erasureService.getAllErasureRequests();
  }

  @RequirePermissions(RbacPermissions.COMPLIANCE_MANAGE)
  @Post("erasures/:id/process")
  processErasure(@Param("id") id: string, @Body() body: { action: "APPROVE" | "REJECT" }, @CurrentUser() user: any): Promise<DataErasureRequest> {
    return this.erasureService.processErasureRequest(id, user.employeeId, body.action);
  }

  @RequirePermissions(RbacPermissions.COMPLIANCE_READ)
  @Get("grievances")
  getGrievances() {
    return this.grievanceService.getAllGrievanceCases();
  }

  @RequirePermissions(RbacPermissions.COMPLIANCE_READ)
  @Get("grievances/me")
  getMyGrievances(@CurrentUser() user: any) {
    return this.grievanceService.getMyGrievances(user.employeeId);
  }

  @RequirePermissions(RbacPermissions.COMPLIANCE_MANAGE)
  @Patch("grievances/:id/resolve")
  resolveGrievance(@Param("id") id: string, @Body() body: { resolution: string }, @CurrentUser() user: any) {
    return this.grievanceService.resolveGrievance(id, body.resolution, user.employeeId);
  }

  @RequirePermissions(RbacPermissions.COMPLIANCE_MANAGE)
  @Post("erasures")
  createErasureRequest(@Body() body: { notes?: string }, @CurrentUser() user: any): Promise<DataErasureRequest> {
    return this.erasureService.createErasureRequest(user.employeeId, body.notes);
  }

  @RequirePermissions(RbacPermissions.COMPLIANCE_MANAGE)
  @Patch("consents/:id/revoke")
  revokeConsent(@Param("id") id: string, @CurrentUser() user: any): Promise<ConsentLog> {
    return this.consentService.revokeConsent(id, user.employeeId, user.role);
  }

  @RequirePermissions(RbacPermissions.COMPLIANCE_MANAGE)
  @Post("grievances")
  createGrievance(@Body() body: { description: string }, @CurrentUser() user: any): Promise<GrievanceCase> {
    return this.grievanceService.createGrievance(user.employeeId, body.description);
  }

  @RequirePermissions(RbacPermissions.COMPLIANCE_READ)
  @Get("policies")
  getPolicies() {
    return [
      { id: "1", title: "Data Protection Policy", url: `${process.env.FRONTEND_URL}/policies/data-protection`, updated: "2024-01-01" },
      { id: "2", title: "Code of Conduct", url: `${process.env.FRONTEND_URL}/policies/code-of-conduct`, updated: "2024-01-15" }
    ];
  }

  @RequirePermissions(RbacPermissions.COMPLIANCE_READ)
  @Get("reports")
  getReports() {
    return [
      { id: "1", title: "Q1 Compliance Audit", date: "2024-03-31", url: "#" },
      { id: "2", title: "Q2 DPDPA Assessment", date: "2024-06-30", url: "#" }
    ];
  }
}
