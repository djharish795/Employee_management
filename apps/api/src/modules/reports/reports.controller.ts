import { Controller, Get, Post, Body, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '@naprocs/types';
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { RequiresPhase } from '../../common/decorators/requires-phase.decorator';
import { RbacPermissions } from '../../common/rbac/rbac.config';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @RequiresPhase(2)
  @RequirePermissions(RbacPermissions.REPORTS_GENERATE)
  @Post('generate')

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Permissions(Permission.READ_EMPLOYEES)
  async generateReport(
    @Body('type') type: string,
    @Body('format') format: string,
    @Req() req: any
  ) {
    const employeeId = req.user?.employeeId || null;
    return this.reportsService.generateReport(type, format, employeeId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RbacGuard)
  @Permissions(Permission.READ_EMPLOYEES)
  async getRecentReports(@Req() req: any) {
    const employeeId = req.user?.employeeId;
    return this.reportsService.getRecentReports(employeeId);
  }

  @Get('oe-metrics')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @Permissions(Permission.READ_EMPLOYEES)
  async getOeMetrics() {
    return this.reportsService.getOeMetrics();
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @Permissions(Permission.READ_EMPLOYEES)
  async getDownloadUrl(@Param('id') id: string) {
    return this.reportsService.getDownloadUrl(id);
  }

  @Post('vdr/generate')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @Permissions(Permission.READ_EMPLOYEES)
  async generateVdr(
    @Body('payload') payload: any,
    @Body('expiresInHours') expiresInHours: number,
    @Req() req: any
  ) {
    if (req.user?.role !== 'CEO' && req.user?.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException("Only CEO or Super Admin can generate VDRs");
    }
    const employeeId = req.user?.employeeId;
    return this.reportsService.generateVdr(payload, expiresInHours, employeeId);
  }

  @Get('vdr/:token')
  async getVdr(
    @Param('token') token: string,
    @Req() req: any
  ) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.reportsService.getVdr(token, ip as string, userAgent);
  }
  @Get('vdr-audit')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @Permissions(Permission.READ_AUDIT)
  async getVdrAudits(@Req() req: any) {
    if (req.user?.role !== 'CEO' && req.user?.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException("Only CEO or Super Admin can view VDR audits");
    }
    return this.reportsService.getVdrAudits();
  }

  @Get('vdr-audit/:token')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @Permissions(Permission.READ_AUDIT)
  async getVdrAuditDetails(@Param('token') token: string, @Req() req: any) {
    if (req.user?.role !== 'CEO' && req.user?.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException("Only CEO or Super Admin can view VDR audits");
    }
    return this.reportsService.getVdrAuditDetails(token);
  }

  @Post('vdr-audit/:token/revoke')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @Permissions(Permission.READ_AUDIT)
  async revokeVdr(@Param('token') token: string, @Req() req: any) {
    if (req.user?.role !== 'CEO' && req.user?.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException("Only CEO or Super Admin can revoke VDRs");
    }
    return this.reportsService.revokeVdr(token);
  }
}

