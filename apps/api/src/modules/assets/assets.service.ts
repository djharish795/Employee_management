import { Injectable, ForbiddenException, BadRequestException } from "@nestjs/common";
import { AssetsRepository } from "./assets.repository";
import { UserRole } from "@naprocs/types";

@Injectable()
export class AssetsService {
  constructor(private readonly assetsRepository: AssetsRepository) {}

  private validateKPIRole(role: UserRole) {
    const allowedRoles = [
      UserRole.SUPER_ADMIN,
      UserRole.CEO,
      UserRole.CTO,
      UserRole.CHRO,
      UserRole.HR,
      UserRole.IT,
    ];
    if (!allowedRoles.includes(role)) {
      throw new ForbiddenException("Insufficient permissions to view assets KPIs");
    }
  }

  private validateFinancialRole(role: UserRole) {
    const allowedRoles = [
      UserRole.SUPER_ADMIN,
      UserRole.CEO,
      UserRole.CFO,
      UserRole.FINANCE,
      UserRole.IT,
    ];
    if (!allowedRoles.includes(role)) {
      throw new ForbiddenException("Insufficient permissions to view assets financial KPIs");
    }
  }

  async getSummaryKPIs(role: UserRole): Promise<any> {
    this.validateKPIRole(role);
    return this.assetsRepository.getSummaryKPIs();
  }

  async getCategoryBreakdown(role: UserRole): Promise<any> {
    this.validateKPIRole(role);
    return this.assetsRepository.getCategoryBreakdown();
  }

  async getFinancialSummary(role: UserRole): Promise<any> {
    this.validateFinancialRole(role);
    return this.assetsRepository.getFinancialSummary();
  }

  async getLifecycleTrends(
    role: UserRole,
    startDateStr?: string,
    endDateStr?: string,
    intervalStr?: string
  ): Promise<any> {
    this.validateKPIRole(role);

    let startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    let endDate = new Date();

    if (startDateStr) {
      startDate = new Date(startDateStr);
      if (isNaN(startDate.getTime())) {
        throw new BadRequestException("Invalid startDate format. Use YYYY-MM-DD");
      }
    }

    if (endDateStr) {
      endDate = new Date(endDateStr);
      if (isNaN(endDate.getTime())) {
        throw new BadRequestException("Invalid endDate format. Use YYYY-MM-DD");
      }
    }

    if (startDate > endDate) {
      throw new BadRequestException("startDate must be before or equal to endDate");
    }

    const interval = (intervalStr === "QUARTER" ? "QUARTER" : "MONTH") as "MONTH" | "QUARTER";

    return this.assetsRepository.getLifecycleTrends(startDate, endDate, interval);
  }

  async getCtoAssets(role: UserRole): Promise<any> {
    this.validateKPIRole(role); // Using KPIRole validation for CTO
    return this.assetsRepository.getCtoAssets();
  }
}
