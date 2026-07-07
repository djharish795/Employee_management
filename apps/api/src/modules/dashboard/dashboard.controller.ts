import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";
import { DashboardService } from "./dashboard.service";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("metrics")
  getMetrics() {
    return this.dashboardService.getMetrics();
  }

  @Get("hr-overview")
  getHrOverview() {
    return this.dashboardService.getHrOverview();
  }

  @Get("cto-overview")
  getCtoOverview() {
    return this.dashboardService.getCtoOverview();
  }

  @Get("export-report")
  async exportReport(@Res() res: Response) {
    const csvContent = await this.dashboardService.generateExportReport();
    res.header('Content-Type', 'text/csv');
    res.attachment(`organisation-report-${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csvContent);
  }
}
