import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AssetsService } from "./assets.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RbacGuard } from "../../common/guards/rbac.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { UserRole, Permission } from "@naprocs/types";
import { Permissions } from "../../common/decorators/permissions.decorator";

@Controller("assets/kpis")
@UseGuards(JwtAuthGuard, RbacGuard)
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) { }

    @Get("summary")
    async getSummary(@CurrentUser() user: any) {
        return this.assetsService.getSummaryKPIs(user.role as UserRole);
    }

    @Get("categories")
    async getCategories(@CurrentUser() user: any) {
        return this.assetsService.getCategoryBreakdown(user.role as UserRole);
    }

    @Get("financials")
    async getFinancials(@CurrentUser() user: any) {
        return this.assetsService.getFinancialSummary(user.role as UserRole);
    }

    @Get("trends")
    async getTrends(
        @CurrentUser() user: any,
        @Query("startDate") startDate?: string,
        @Query("endDate") endDate?: string,
        @Query("interval") interval?: string
    ) {
        return this.assetsService.getLifecycleTrends(
            user.role as UserRole,
            startDate,
            endDate,
            interval
        );
    }
}

@Controller("assets")
@UseGuards(JwtAuthGuard, RbacGuard)
export class CtoAssetsController {
    constructor(private readonly assetsService: AssetsService) { }

    @Get("cto")
    @Permissions(Permission.READ_EMPLOYEES)
    async getCtoAssets(@CurrentUser() user: any) {
        return this.assetsService.getCtoAssets(user.role as UserRole);
    }
}
