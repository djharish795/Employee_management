import { Controller, Get, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { DashboardService } from "./dashboard.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RbacGuard } from "../../common/guards/rbac.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { Permission } from "@naprocs/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { RbacPermissions } from '../../common/rbac/rbac.config';

@Controller("dashboard")
@UseGuards(JwtAuthGuard, RbacGuard)
@Permissions(Permission.READ_EMPLOYEES)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get("metrics")
  getMetrics() {
    return this.dashboardService.getMetrics();
  }

  @RequirePermissions(RbacPermissions.DASHBOARD_VIEW)
  @Get("hr-overview")
  getHrOverview() {
    return this.dashboardService.getHrOverview();
  }

  @RequirePermissions(RbacPermissions.DASHBOARD_VIEW)
  @Get("cto-overview")
  getCtoOverview() {
    return this.dashboardService.getCtoOverview();
  }

  @RequirePermissions(RbacPermissions.DASHBOARD_VIEW)
  @Get("export-report")
  async exportReport(@Res() res: Response) {
    const csvContent = await this.dashboardService.generateExportReport();
    res.header('Content-Type', 'text/csv');
    res.attachment(`organisation-report-${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csvContent);
  }

  @RequirePermissions(RbacPermissions.DASHBOARD_VIEW)
  @Get("cto-export")
  async ctoExport(@Res() res: Response) {
    const csvContent = await this.dashboardService.generateCtoExportReport();
    res.header('Content-Type', 'text/csv');
    res.attachment(`engineering-report-${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csvContent);
  }

  @Get("team-lead-overview")
  @Permissions(Permission.READ_TEAM_PROFILES)
  getTeamLeadOverview(@CurrentUser() user: any) {
    return this.dashboardService.getTeamLeadOverview(user);
  }
}
