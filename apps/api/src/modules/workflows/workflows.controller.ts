import { Controller, Get, Patch, Param, Body, UseGuards } from "@nestjs/common";
import { WorkflowService } from "./workflow.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RbacGuard } from "../../common/guards/rbac.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { Permission, UserRole } from "@naprocs/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { WorkflowInstanceStatus } from "@naprocs/database";

@Controller("hr/workflows")
@UseGuards(JwtAuthGuard, RbacGuard)
export class WorkflowsController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get("kanban")
  @Permissions(Permission.READ_EMPLOYEES) // Only HR or above
  async getKanbanWorkflows(@CurrentUser() user: any): Promise<any> {
    return this.workflowService.getKanbanWorkflows();
  }

  @Patch(":id/status")
  @Permissions(Permission.WRITE_EMPLOYEES) // Only HR or above can move it
  async updateStatus(
    @Param("id") id: string,
    @Body("status") status: WorkflowInstanceStatus
  ) {
    return this.workflowService.updateStatus(id, status);
  }
}
