import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '@naprocs/types';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

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

  @Get(':id/download')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @Permissions(Permission.READ_EMPLOYEES)
  async getDownloadUrl(@Param('id') id: string) {
    return this.reportsService.getDownloadUrl(id);
  }
}
