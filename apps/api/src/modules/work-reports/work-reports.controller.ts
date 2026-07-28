import { Controller, Get, Post, Body, Param, Patch, UseGuards, Req, Res } from '@nestjs/common';
import { WorkReportsService, ReportStatus } from './work-reports.service';
import { CreateWorkReportDto } from './dto/create-work-report.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '@naprocs/types';

@Controller('work-reports')
@UseGuards(JwtAuthGuard, RbacGuard)
export class WorkReportsController {
  constructor(private readonly workReportsService: WorkReportsService) {}

  @Post()
  @Permissions(Permission.READ_OWN_PROFILE)
  async create(@Body() createWorkReportDto: CreateWorkReportDto, @Req() req: any) {
    const employeeId = req.user?.employeeId;
    return this.workReportsService.create(employeeId, createWorkReportDto);
  }

  @Get('me')
  @Permissions(Permission.READ_OWN_PROFILE)
  async getMyReports(@Req() req: any) {
    const employeeId = req.user?.employeeId;
    return this.workReportsService.getMyReports(employeeId);
  }

  @Get('team')
  // Coarse gate only (everyone passes) — real authorization is enforced in
  // the service via WORK_REPORT_ADMIN_ROLES / reviewerId scoping. Gating on
  // APPROVE_FIELD_REQUESTS/ACCESS_CEM here let OE/CRM through (over-broad)
  // while incorrectly locking out HR/CHRO, who hold neither permission but
  // are legitimate admins per WORK_REPORT_ADMIN_ROLES.
  @Permissions(Permission.READ_OWN_PROFILE)
  async getTeamReports(@Req() req: any) {
    const reviewerId = req.user?.employeeId;
    const role = req.user?.role;
    const reports = await this.workReportsService.getTeamReports(reviewerId, role);
    return reports;
  }

  @Get('export')
  @Permissions(Permission.READ_OWN_PROFILE)
  async exportTeamCsv(@Req() req: any, @Res() res: any) {
    const reviewerId = req.user?.employeeId;
    const role = req.user?.role;
    const csv = await this.workReportsService.exportTeamCsv(reviewerId, role);
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=Team_Work_Reports_${new Date().toISOString().split('T')[0]}.csv`,
    });
    res.end(csv);
  }

  @Get(':id')
  @Permissions(Permission.READ_OWN_PROFILE)
  async getReportById(@Param('id') id: string, @Req() req: any) {
    const employeeId = req.user?.employeeId;
    const role = req.user?.role;
    return this.workReportsService.getReportById(id, employeeId, role);
  }

  @Patch(':id/review')
  @Permissions(Permission.READ_OWN_PROFILE)
  async reviewReport(
    @Param('id') id: string,
    @Body('status') status: ReportStatus,
    @Body('rejectionReason') rejectionReason: string,
    @Req() req: any
  ) {
    const reviewerId = req.user?.employeeId;
    const role = req.user?.role;
    return this.workReportsService.reviewReport(reviewerId, role, id, status, rejectionReason);
  }
}
