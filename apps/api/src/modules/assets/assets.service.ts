import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { AssetsRepository } from "./assets.repository";
import { UserRole } from "@naprocs/types";
import { AssetStatus, AssetCategory } from "@naprocs/database";
import { CreateAssetDto } from "./dto/create-asset.dto";
import { UpdateAssetDto } from "./dto/update-asset.dto";
import { AssignAssetDto } from "./dto/assign-asset.dto";
import { CreateAssetRequestDto, RespondAssetRequestDto } from "./dto/asset-request-actions.dto";
import { WorkflowEngineService } from "../workflows/workflow-engine.service";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class AssetsService {
  constructor(
    private readonly assetsRepository: AssetsRepository,
    private readonly workflowEngine: WorkflowEngineService,
    private readonly auditService: AuditService
  ) {}

  // ─── Role guards ─────────────────────────────────────────────────────────

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

  private validateWriteRole(role: UserRole) {
    const allowedRoles = [UserRole.SUPER_ADMIN, UserRole.IT, UserRole.HR];
    if (!allowedRoles.includes(role)) {
      throw new ForbiddenException("Only IT Admin, Super Admin, or HR can manage assets");
    }
  }

  // ─── Inventory CRUD ────────────────────────────────────────────────────────

  async findAll(
    role: UserRole,
    userId: string,
    filters: {
      status?: AssetStatus;
      category?: AssetCategory;
      search?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<any> {
    return this.assetsRepository.findAll(role, userId, filters);
  }

  async findById(role: UserRole, userId: string, id: string): Promise<any> {
    const asset = await this.assetsRepository.findById(id);
    if (!asset) throw new NotFoundException(`Asset ${id} not found`);
    return asset;
  }

  async create(role: UserRole, dto: CreateAssetDto): Promise<any> {
    this.validateWriteRole(role);
    const asset = await this.assetsRepository.create(dto);
    await this.auditService.createLog({
      action: "ASSET_CREATED",
      resource: "Asset",
      resourceId: asset.id,
      newValue: dto,
    });
    return asset;
  }

  async update(role: UserRole, id: string, dto: UpdateAssetDto): Promise<any> {
    this.validateWriteRole(role);
    const asset = await this.assetsRepository.findById(id);
    if (!asset) throw new NotFoundException(`Asset ${id} not found`);
    const updated = await this.assetsRepository.update(id, dto);
    await this.auditService.createLog({
      action: "ASSET_UPDATED",
      resource: "Asset",
      resourceId: id,
      oldValue: asset,
      newValue: dto,
    });
    return updated;
  }

  async remove(role: UserRole, id: string): Promise<any> {
    this.validateWriteRole(role);
    const asset = await this.assetsRepository.findById(id);
    if (!asset) throw new NotFoundException(`Asset ${id} not found`);
    if (asset.status === AssetStatus.ASSIGNED) {
      throw new BadRequestException("Cannot delete an asset that is currently assigned");
    }
    const result = await this.assetsRepository.delete(id);
    await this.auditService.createLog({
      action: "ASSET_DELETED",
      resource: "Asset",
      resourceId: id,
      oldValue: asset,
    });
    return result;
  }

  async assign(role: UserRole, assetId: string, dto: AssignAssetDto) {
    this.validateWriteRole(role);
    const asset = await this.assetsRepository.findById(assetId);
    if (!asset) throw new NotFoundException(`Asset ${assetId} not found`);
    if (asset.status === AssetStatus.ASSIGNED) {
      throw new BadRequestException("Asset is already assigned — return it first");
    }
    if (asset.status === AssetStatus.RETIRED || asset.status === AssetStatus.LOST) {
      throw new BadRequestException(`Cannot assign an asset with status ${asset.status}`);
    }
    const result = await this.assetsRepository.assign(assetId, dto.employeeId, dto.assignedById, dto.notes);
    await this.auditService.createLog({
      action: "ASSET_ASSIGNED",
      actorId: dto.assignedById,
      resource: "Asset",
      resourceId: assetId,
      newValue: { employeeId: dto.employeeId, notes: dto.notes },
    });
    return result;
  }

  async returnAsset(role: UserRole, assetId: string, returnedCondition?: string) {
    this.validateWriteRole(role);
    const asset = await this.assetsRepository.findById(assetId);
    if (!asset) throw new NotFoundException(`Asset ${assetId} not found`);
    if (asset.status !== AssetStatus.ASSIGNED) {
      throw new BadRequestException("Asset is not currently assigned");
    }
    const result = await this.assetsRepository.returnAsset(assetId, returnedCondition);
    await this.auditService.createLog({
      action: "ASSET_RETURNED",
      resource: "Asset",
      resourceId: assetId,
      newValue: { returnedCondition },
    });
    return result;
  }

  // ─── Asset Requests ────────────────────────────────────────────────────────

  async findRequests(role: UserRole, employeeId: string, statusFilter?: string): Promise<any> {
    // Employees see only their own requests; IT/Admins see all
    const isPrivileged = [UserRole.SUPER_ADMIN, UserRole.IT, UserRole.HR, UserRole.CHRO, UserRole.CEO].includes(role);
    const resolvedEmployeeId = isPrivileged ? undefined : employeeId;
    return this.assetsRepository.findRequests({ status: statusFilter, employeeId: resolvedEmployeeId });
  }

  async createRequest(employeeId: string, dto: CreateAssetRequestDto): Promise<any> {
    const resourceId = `asset-req-${Date.now()}`;
    return this.workflowEngine.startWorkflow(
      "ASSET_REQUEST",
      resourceId,
      employeeId,
      {
        category: dto.category,
        description: dto.description,
        justification: dto.justification,
        priority: dto.priority,
        targetEmployeeId: dto.targetEmployeeId,
      }
    );
  }

  async respondToRequest(role: UserRole, instanceId: string, respondedById: string, dto: RespondAssetRequestDto): Promise<any> {
    const allowedRoles = [UserRole.SUPER_ADMIN, UserRole.IT];
    if (!allowedRoles.includes(role)) {
      throw new ForbiddenException("Only IT Admin can approve or reject asset requests");
    }
    // Using WorkflowEngineService processApproval which expects "APPROVE" | "REJECT" and notes
    const action = dto.status === "APPROVED" ? "APPROVE" : "REJECT";
    return this.workflowEngine.processApproval(instanceId, action, respondedById, dto.notes);
  }

  // ─── KPIs (existing) ──────────────────────────────────────────────────────

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
      if (isNaN(startDate.getTime())) throw new BadRequestException("Invalid startDate format. Use YYYY-MM-DD");
    }
    if (endDateStr) {
      endDate = new Date(endDateStr);
      if (isNaN(endDate.getTime())) throw new BadRequestException("Invalid endDate format. Use YYYY-MM-DD");
    }
    if (startDate > endDate) throw new BadRequestException("startDate must be before or equal to endDate");

    const interval = (intervalStr === "QUARTER" ? "QUARTER" : "MONTH") as "MONTH" | "QUARTER";
    return this.assetsRepository.getLifecycleTrends(startDate, endDate, interval);
  }

  async getCtoAssets(role: UserRole): Promise<any> {
    this.validateKPIRole(role);
    return this.assetsRepository.getCtoAssets();
  }
}
