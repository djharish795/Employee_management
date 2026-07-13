import { Controller, Get, Patch, Put, Post, Param, Body, UseGuards } from "@nestjs/common";
import { WorkflowService } from "./workflow.service";
import { WorkflowEngineService } from "./workflow-engine.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RbacGuard } from "../../common/guards/rbac.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { Permission } from "@naprocs/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { WorkflowType, WorkflowInstanceStatus } from "@naprocs/database";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { deployWorkflowSchema } from "@naprocs/schemas";
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { RbacPermissions } from '../../common/rbac/rbac.config';

@Controller("hr/workflows")
@UseGuards(JwtAuthGuard, RbacGuard)
export class WorkflowsController {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly workflowEngineService: WorkflowEngineService
  ) {}

  @RequirePermissions(RbacPermissions.WORKFLOWS_READ)
  @Get("config")
  @Permissions(Permission.READ_EMPLOYEES) // Only HR or above
  async getConfig(): Promise<any> {
    return this.workflowService.getConfigs();
  }

  @Put("config/:type")
  @Permissions(Permission.WRITE_EMPLOYEES)
  async updateConfig(
    @Param("type") type: WorkflowType,
    @Body(new ZodValidationPipe(deployWorkflowSchema)) dto: any
  ): Promise<any> {
    return this.workflowService.updateConfig(type, dto);
  }

  @Get("kanban")
  @Permissions(Permission.READ_EMPLOYEES)
  async getKanbanWorkflows(@CurrentUser() user: any): Promise<any> {
    return this.workflowService.getKanbanWorkflows();
  }

  @Get("my-approvals")
  @Permissions(Permission.READ_OWN_PROFILE)
  async getMyApprovals(@CurrentUser() user: any): Promise<any> {
    return this.workflowService.getMyApprovals(user.employeeId);
  }

  @Patch(":id/status")
  @Permissions(Permission.WRITE_EMPLOYEES)
  async updateStatus(
    @Param("id") id: string,
    @Body("status") status: WorkflowInstanceStatus,
    @CurrentUser() user: any
  ): Promise<any> {
    return this.workflowEngineService.forceStatusUpdate(id, status, user?.employeeId);
  }

  @Post(":id/approve")
  @Permissions(Permission.WRITE_OWN_PROFILE)
  async approve(
    @Param("id") id: string,
    @CurrentUser() user: any,
    @Body("notes") notes?: string
  ): Promise<any> {
    return this.workflowEngineService.processApproval(id, "APPROVE", user?.employeeId, notes);
  }

  @Post(":id/reject")
  @Permissions(Permission.WRITE_OWN_PROFILE)
  async reject(
    @Param("id") id: string,
    @CurrentUser() user: any,
    @Body("notes") notes?: string
  ): Promise<any> {
    return this.workflowEngineService.processApproval(id, "REJECT", user?.employeeId, notes);
  }
}
