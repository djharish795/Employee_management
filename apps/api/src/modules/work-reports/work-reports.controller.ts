import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req, Res, Query } from '@nestjs/common';
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
    const role = req.user?.role;
    return this.workReportsService.create(employeeId, role, createWorkReportDto);
  }

  @Get('me')
  @Permissions(Permission.READ_OWN_PROFILE)
  async getMyReports(@Req() req: any) {
    const employeeId = req.user?.employeeId;
    return this.workReportsService.getMyReports(employeeId);
  }

  @Get('team')
  @Permissions(Permission.APPROVE_FIELD_REQUESTS, Permission.READ_EMPLOYEES)
  async getTeamReports(@Req() req: any) {
    const reviewerId = req.user?.employeeId;
    const role = req.user?.role;
    console.log("Fetching team reports for reviewerId:", reviewerId, "role:", role);
    const reports = await this.workReportsService.getTeamReports(reviewerId, role);
    return reports;
  }

  @Get('cto')
  @Permissions(Permission.READ_EMPLOYEES)
  async getCtoReports(@Req() req: any, @Query('team') team: string) {
    const reviewerId = req.user?.employeeId;
    const role = req.user?.role;
    return this.workReportsService.getCtoReports(reviewerId, role, team);
  }

  @Get('export')
  @Permissions(Permission.APPROVE_FIELD_REQUESTS)
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
  @Permissions(Permission.APPROVE_FIELD_REQUESTS)
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

  @Patch(':id')
  @Permissions(Permission.READ_OWN_PROFILE)
  async updateReport(
    @Param('id') id: string,
    @Body() updateDto: any,
    @Req() req: any
  ) {
    const employeeId = req.user?.employeeId;
    return this.workReportsService.updateReport(employeeId, id, updateDto);
  }

  @Delete(':id')
  @Permissions(Permission.READ_OWN_PROFILE)
  async deleteReport(
    @Param('id') id: string,
    @Req() req: any
  ) {
    const employeeId = req.user?.employeeId;
    return this.workReportsService.deleteReport(employeeId, id);
  }
}
