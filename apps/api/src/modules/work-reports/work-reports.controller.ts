import { Controller, Get, Post, Body, Param, Patch, UseGuards, Req, Res } from '@nestjs/common';
import { WorkReportsService, ReportStatus } from './work-reports.service';
import { CreateWorkReportDto } from './dto/create-work-report.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '@naprocs/types';

@Controller('work-reports')
@UseGuards(JwtAuthGuard, RbacGuard)
@Permissions(Permission.ACCESS_CEM, Permission.APPROVE_FIELD_REQUESTS)
export class WorkReportsController {
  constructor(private readonly workReportsService: WorkReportsService) {}

  @Post()
  async create(@Body() createWorkReportDto: CreateWorkReportDto, @Req() req: any) {
    const employeeId = req.user?.employeeId;
    return this.workReportsService.create(employeeId, createWorkReportDto);
  }

  @Get('me')
  async getMyReports(@Req() req: any) {
    const employeeId = req.user?.employeeId;
    return this.workReportsService.getMyReports(employeeId);
  }

  @Get('team')
  async getTeamReports(@Req() req: any) {
    const reviewerId = req.user?.employeeId;
    console.log("Fetching team reports for reviewerId:", reviewerId);
    console.log("req.user object:", req.user);
    const reports = await this.workReportsService.getTeamReports(reviewerId);
    console.log("Found reports:", reports.length);
    console.log("Reports array:", JSON.stringify(reports));
    return reports;
  }

  @Get('export')
  async exportTeamCsv(@Req() req: any, @Res() res: any) {
    const reviewerId = req.user?.employeeId;
    const csv = await this.workReportsService.exportTeamCsv(reviewerId);
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=Team_Work_Reports_${new Date().toISOString().split('T')[0]}.csv`,
    });
    res.end(csv);
  }

  @Get(':id')
  async getReportById(@Param('id') id: string, @Req() req: any) {
    const employeeId = req.user?.employeeId;
    return this.workReportsService.getReportById(id, employeeId);
  }

  @Patch(':id/review')
  async reviewReport(
    @Param('id') id: string,
    @Body('status') status: ReportStatus,
    @Body('rejectionReason') rejectionReason: string,
    @Req() req: any
  ) {
    const reviewerId = req.user?.employeeId;
    return this.workReportsService.reviewReport(reviewerId, id, status, rejectionReason);
  }
}
