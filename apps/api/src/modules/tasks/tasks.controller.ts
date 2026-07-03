import { Controller, Get, Post, Patch, Body, Param, Req, UseGuards } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { Request } from "express";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RbacGuard } from "../../common/guards/rbac.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { Permission } from "@naprocs/types";
import { TaskStatus } from "@naprocs/database";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("tasks")
@UseGuards(JwtAuthGuard, RbacGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

  @Get()
  @Permissions(Permission.READ_OWN_PROFILE)
  async getMyTasks(@CurrentUser() user: any): Promise<any> {
    const employeeId = user.employeeId;
    return this.tasksService.getMyTasks(employeeId);
  }

  @Post()
  @Permissions(Permission.WRITE_OWN_PROFILE)
  async createTask(@CurrentUser() user: any, @Body() dto: any): Promise<any> {
    const employeeId = user.employeeId;
    return this.tasksService.createTask(employeeId, dto);
  }

  @Patch(":id/status")
  @Permissions(Permission.WRITE_OWN_PROFILE)
  async updateStatus(@Param("id") id: string, @Body("status") status: TaskStatus): Promise<any> {
    return this.tasksService.updateTaskStatus(id, status);
  }
}
