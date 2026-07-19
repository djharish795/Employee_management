import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { RbacGroups, RbacRoles } from "../../common/rbac/rbac.config";
import { AssetsRepository } from "./assets.repository";
import { UserRole } from "@naprocs/types";
import { AssetStatus, AssetCategory, NotificationType } from "@naprocs/database";
import { CreateAssetDto } from "./dto/create-asset.dto";
import { UpdateAssetDto } from "./dto/update-asset.dto";
import { AssignAssetDto } from "./dto/assign-asset.dto";
import { CreateAssetRequestDto, RespondAssetRequestDto, OmSelectAssetRequestDto } from "./dto/asset-request-actions.dto";
import { WorkflowEngineService } from "../workflows/workflow-engine.service";
import { AuditService } from "../audit/audit.service";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class AssetsService {
  constructor(
    private readonly assetsRepository: AssetsRepository,
    private readonly workflowEngine: WorkflowEngineService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService
  ) {}

  // ─── Role guards ─────────────────────────────────────────────────────────

  private validateKPIRole(role: UserRole) {
    if (!RbacGroups.ASSET_VIEWERS.includes(role as any)) {
      throw new ForbiddenException("Insufficient permissions to view assets KPIs");
    }
  }

  private validateFinancialRole(role: UserRole) {
    if (!RbacGroups.ASSET_FINANCIAL_VIEWERS.includes(role as any)) {
      throw new ForbiddenException("Insufficient permissions to view assets financial KPIs");
    }
  }

  private validateWriteRole(role: UserRole) {
    if (!RbacGroups.ASSET_WRITERS.includes(role as any)) {
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
    
    // RBAC Check for IDOR
    if (!RbacGroups.ASSET_PRIVILEGED.includes(role as any)) {
      if (RbacGroups.ASSET_MANAGERS.includes(role as any)) {
        const holder = asset.currentHolder as any;
        if (asset.currentHolderId !== userId && holder?.reportingManagerId !== userId) {
          throw new ForbiddenException("You do not have permission to view this asset");
        }
      } else {
        if (asset.currentHolderId !== userId) {
          throw new ForbiddenException("You do not have permission to view this asset");
        }
      }
    }
    
    return asset;
  }

  async create(role: UserRole, actorId: string, dto: CreateAssetDto): Promise<any> {
    this.validateWriteRole(role);
    const asset = await this.assetsRepository.create(dto);
    await this.auditService.logCreate({
      moduleName: "Asset",
      entityId: asset.id,
      actorId: actorId,
      metadata: dto,
    });
    return asset;
  }

  async update(role: UserRole, actorId: string, id: string, dto: UpdateAssetDto): Promise<any> {
    this.validateWriteRole(role);
    const asset = await this.assetsRepository.findById(id);
    if (!asset) throw new NotFoundException(`Asset ${id} not found`);
    const updated = await this.assetsRepository.update(id, dto);
    await this.auditService.logUpdate({
      moduleName: "Asset",
      entityId: id,
      actorId: actorId,
      oldValue: asset,
      newValue: dto,
    });
    return updated;
  }

  async remove(role: UserRole, actorId: string, id: string): Promise<any> {
    this.validateWriteRole(role);
    const asset = await this.assetsRepository.findById(id);
    if (!asset) throw new NotFoundException(`Asset ${id} not found`);
    if (asset.status === AssetStatus.ASSIGNED) {
      throw new BadRequestException("Cannot delete an asset that is currently assigned");
    }
    const result = await this.assetsRepository.delete(id);
    await this.auditService.logDelete({
      moduleName: "Asset",
      entityId: id,
      actorId: actorId,
      metadata: asset,
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

    // Auto-close any lingering active assignments for this asset
    await this.assetsRepository.closeActiveAssignments(assetId);

    const result = await this.assetsRepository.assign(assetId, dto.employeeId, dto.assignedById, dto.notes);
    // TODO: Replace dto.assignedById with authenticated userId once JWT is implemented
    await this.auditService.logUpdate({
      moduleName: "Asset",
      entityId: assetId,
      actorId: dto.assignedById,
      metadata: { action: 'ASSIGNED', employeeId: dto.employeeId, notes: dto.notes },
    });
    return result;
  }

  async returnAsset(role: UserRole, actorId: string, assetId: string, returnedCondition?: string, notes?: string) {
    this.validateWriteRole(role);
    const asset = await this.assetsRepository.findById(assetId);
    if (!asset) throw new NotFoundException(`Asset ${assetId} not found`);
    if (asset.status !== AssetStatus.ASSIGNED) {
      throw new BadRequestException("Asset is not currently assigned");
    }
    
    // Save holder ID before return clears it
    const holderId = asset.currentHolderId;
    
    const result = await this.assetsRepository.returnAsset(assetId, returnedCondition);
    await this.auditService.logUpdate({
      moduleName: "Asset",
      entityId: assetId,
      actorId: actorId,
      metadata: { action: 'RETURNED', returnedCondition, notes },
    });

    // Notify HR and resolve the offboarding request if there was a holder
    if (holderId) {
      // Find the pending OFFBOARDING asset request for this employee
      const requests = await this.assetsRepository.findRequests({ employeeId: holderId });
      const pendingOffboardingReq = requests.find((r: any) => r.type === 'OFFBOARDING' && (r.status === 'PENDING_OM_SELECTION' || r.status === 'PENDING_CEO_APPROVAL'));
      
      if (pendingOffboardingReq) {
        // Mark the request as APPROVED to complete the loop
        await this.assetsRepository.updateAssetRequest(pendingOffboardingReq.id, { 
          status: 'APPROVED', 
          omApproverId: actorId 
        });

        if (pendingOffboardingReq.requesterId) {
          await this.notificationsService.createNotification(
            pendingOffboardingReq.requesterId,
            "Asset Returned by OM",
            `The asset (${asset.name}) assigned to ${holderId} has been collected and the retrieval request is complete.`,
            NotificationType.ASSET_STATUS
          );
        }
      }
    }

    return result;
  }

  // ─── Asset Requests ────────────────────────────────────────────────────────

  async findRequests(role: UserRole, employeeId: string, statusFilter?: string, scope?: string): Promise<any> {
    const isPrivileged = RbacGroups.ASSET_PRIVILEGED.includes(role as any);
    const resolvedEmployeeId = (isPrivileged && scope !== 'my') ? undefined : employeeId;
    return this.assetsRepository.findRequests({ status: statusFilter, employeeId: resolvedEmployeeId });
  }

  async createRequest(employeeId: string, dto: CreateAssetRequestDto): Promise<any> {
    const request = await this.assetsRepository.createAssetRequest({
      employeeId: dto.employeeId,
      requesterId: employeeId,
      type: dto.type,
      requestedItems: dto.requestedItems,
      reason: dto.reason,
    });

    await this.notificationsService.notifyRole(
      'OM', 
      'New Asset Request', 
      `An employee has initiated a new asset request (${dto.type}).`, 
      'ASSET_STATUS', 
      request.id
    );

    return request;
  }

  async omSelectAsset(role: UserRole, omId: string, requestId: string, dto: OmSelectAssetRequestDto): Promise<any> {
    const req = await this.assetsRepository.getAssetRequestById(requestId);
    if (!req) throw new NotFoundException("Asset request not found");
    if (req.status !== "PENDING_OM_SELECTION") throw new BadRequestException("Request is not waiting for OM selection");
    
    console.log(`[OM_SELECT] Updating request ${requestId} with assets ${dto.assetIds}`);
    const updated = await this.assetsRepository.updateAssetRequest(requestId, {
      selectedAssetIds: dto.assetIds,
      omApproverId: omId,
      status: "PENDING_CEO_APPROVAL"
    });

    await this.auditService.logUpdate({
      moduleName: "Asset",
      entityId: requestId,
      actorId: omId,
      metadata: { action: "OM_APPROVED", notes: "Sent to CEO" },
    });

    await this.notificationsService.notifyRole(
      'CEO', 
      'Asset Approval Required', 
      `The Operations Manager has processed an asset request and it awaits your final approval.`, 
      'APPROVAL_ALERT', 
      requestId
    );

    return updated;
  }

  async ceoApproveAsset(role: UserRole, ceoId: string, requestId: string, dto: RespondAssetRequestDto): Promise<any> {
    const req = await this.assetsRepository.getAssetRequestById(requestId);
    if (!req) throw new NotFoundException("Asset request not found");
    if (req.status !== "PENDING_CEO_APPROVAL") throw new BadRequestException("Request is not waiting for CEO approval");
    
    console.log(`[CEO_APPROVE] Approving request ${requestId} with status ${dto.status}`);
    if (dto.status === "APPROVED") {
      // Assign the selected assets
      for (const assetId of req.selectedAssetIds) {
        await this.assetsRepository.assign(assetId, req.employeeId, ceoId, "Assigned via Asset Request: " + dto.notes);
      }
      const updated = await this.assetsRepository.updateAssetRequest(requestId, {
        ceoApproverId: ceoId,
        status: "APPROVED"
      });
      await this.auditService.logUpdate({
        moduleName: "Asset",
        entityId: requestId,
        actorId: ceoId,
        metadata: { action: "APPROVED", notes: dto.notes },
      });

      // Notify Requester (HR)
      if (req.requesterId) {
        await this.notificationsService.createNotification(
          req.requesterId,
          "Asset Request Approved",
          `CEO has approved the asset request for ${updated.type}.`,
          NotificationType.ASSET_STATUS
        );
      }

      return updated;
    } else {
      const updated = await this.assetsRepository.updateAssetRequest(requestId, {
        ceoApproverId: ceoId,
        status: "REJECTED"
      });
      await this.auditService.logUpdate({
        moduleName: "Asset",
        entityId: requestId,
        actorId: ceoId,
        metadata: { action: "REJECTED", notes: dto.notes },
      });

      // Notify Requester (HR)
      if (req.requesterId) {
        await this.notificationsService.createNotification(
          req.requesterId,
          "Asset Request Rejected",
          `CEO has rejected the asset request for ${updated.type}.`,
          NotificationType.ASSET_STATUS
        );
      }

      return updated;
    }
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

  async getDepartmentBreakdown(role: UserRole): Promise<any> {
    this.validateKPIRole(role);
    return this.assetsRepository.getDepartmentBreakdown();
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

  async getRecentActivity(role: UserRole, employeeId: string, scope?: string): Promise<any> {
    const isPrivileged = RbacGroups.ASSET_PRIVILEGED.includes(role as any);
    const resolvedEmployeeId = (!isPrivileged || scope === "MINE") ? employeeId : undefined;
    return this.assetsRepository.getRecentActivity(15, resolvedEmployeeId, isPrivileged);
  }
}
