import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AssetsService } from "./assets.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RbacGuard } from "../../common/guards/rbac.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { UserRole, Permission } from "@naprocs/types";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { AssetStatus, AssetCategory } from "@naprocs/database";
import { CreateAssetDto } from "./dto/create-asset.dto";
import { UpdateAssetDto } from "./dto/update-asset.dto";
import { AssignAssetDto } from "./dto/assign-asset.dto";
import { CreateAssetRequestDto, RespondAssetRequestDto } from "./dto/asset-request-actions.dto";

// ─── KPI Controller ────────────────────────────────────────────────────────

@Controller("assets/kpis")
@UseGuards(JwtAuthGuard, RbacGuard)
export class AssetsKpiController {
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

// ─── Main Assets CRUD Controller ──────────────────────────────────────────

@Controller("assets")
@UseGuards(JwtAuthGuard, RbacGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) { }

  // My active assets
  @Get("my")
  @Permissions(Permission.READ_OWN_PROFILE)
  async findMyAssets(@CurrentUser() user: any) {
    return this.assetsService.findAll(user.role as UserRole, user.employeeId, {
      status: "ASSIGNED" as any
    });
  }

  // Inventory list
  @Get()
  @Permissions(Permission.READ_EMPLOYEES)
  async findAll(
    @CurrentUser() user: any,
    @Query("status") status?: AssetStatus,
    @Query("category") category?: AssetCategory,
    @Query("search") search?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    return this.assetsService.findAll(user.role as UserRole, user.employeeId, {
      status,
      category,
      search,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  // Recent Activity
  @Get("activity")
  @Permissions(Permission.READ_OWN_PROFILE)
  async getActivity(@CurrentUser() user: any) {
    return this.assetsService.getRecentActivity(user.role as UserRole, user.employeeId);
  }

  // Single asset detail
  @Get(":id")
  @Permissions(Permission.READ_EMPLOYEES)
  async findOne(@CurrentUser() user: any, @Param("id") id: string) {
    return this.assetsService.findById(user.role as UserRole, user.employeeId, id);
  }

  // Create new asset (IT Admin / Super Admin only)
  @Post()
  async create(@CurrentUser() user: any, @Body() dto: CreateAssetDto) {
    return this.assetsService.create(user.role as UserRole, dto);
  }

  // Update asset
  @Patch(":id")
  async update(
    @CurrentUser() user: any,
    @Param("id") id: string,
    @Body() dto: UpdateAssetDto
  ) {
    return this.assetsService.update(user.role as UserRole, id, dto);
  }

  // Delete asset
  @Delete(":id")
  async remove(@CurrentUser() user: any, @Param("id") id: string) {
    return this.assetsService.remove(user.role as UserRole, id);
  }

  // Assign asset to employee
  @Post(":id/assign")
  async assign(
    @CurrentUser() user: any,
    @Param("id") assetId: string,
    @Body() dto: AssignAssetDto
  ) {
    dto.assignedById = user.employeeId || "system";
    return this.assetsService.assign(user.role as UserRole, assetId, dto);
  }

  // Return asset
  @Post(":id/return")
  async returnAsset(
    @CurrentUser() user: any,
    @Param("id") assetId: string,
    @Body("returnedCondition") returnedCondition?: string
  ) {
    return this.assetsService.returnAsset(user.role as UserRole, assetId, returnedCondition);
  }

  // CTO view (tech asset overview)
  @Get("cto/overview")
  @Permissions(Permission.READ_EMPLOYEES)
  async getCtoAssets(@CurrentUser() user: any) {
    return this.assetsService.getCtoAssets(user.role as UserRole);
  }
}

// ─── Asset Requests Controller ────────────────────────────────────────────

@Controller("assets/requests")
@UseGuards(JwtAuthGuard, RbacGuard)
export class AssetRequestsController {
  constructor(private readonly assetsService: AssetsService) { }

  @Get()
  async findRequests(
    @CurrentUser() user: any,
    @Query("status") status?: string
  ) {
    return this.assetsService.findRequests(user.role as UserRole, user.employeeId, status);
  }

  @Post()
  async createRequest(
    @CurrentUser() user: any,
    @Body() dto: CreateAssetRequestDto
  ) {
    return this.assetsService.createRequest(user.employeeId, dto);
  }

  @Patch(":id/respond")
  async respondToRequest(
    @CurrentUser() user: any,
    @Param("id") id: string,
    @Body() dto: RespondAssetRequestDto
  ) {
    return this.assetsService.respondToRequest(user.role as UserRole, id, user.employeeId, dto);
  }
}

// ─── CTO Controller (kept for backwards compat with cto.ts API client) ────
// Triggers restart again
// Triggers restart

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