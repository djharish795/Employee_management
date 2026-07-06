import { Controller, Get } from "@nestjs/common";
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
}
