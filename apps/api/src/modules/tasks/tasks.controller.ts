import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { Request } from "express";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RbacGuard } from "../../common/guards/rbac.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { Permission } from "@naprocs/types";
import { TaskStatus } from "@naprocs/database";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { RbacPermissions } from '../../common/rbac/rbac.config';

@Controller("tasks")
@UseGuards(JwtAuthGuard, RbacGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

  @RequirePermissions(RbacPermissions.TASKS_READ)
  @Get()
  @Permissions(Permission.READ_OWN_PROFILE)
  async getMyTasks(@CurrentUser() user: any): Promise<any> {
    const employeeId = user.employeeId;
    const tasks = await this.tasksService.getMyTasks(user);
    
    // Attach isMentioned flag based on mentions in comments
    const userEmail = user.email;
    return tasks.map((task: any) => {
      const isMentioned = task.comments?.some((comment: any) => 
        comment.content?.toLowerCase().includes(`@${userEmail.toLowerCase()}`) && !(comment.viewedBy || []).includes(employeeId)
      ) || false;
      return { ...task, isMentioned };
    });
  }

  @Get("project/:projectId")
  @Permissions(Permission.READ_OWN_PROFILE)
  async getProjectTasks(@Param("projectId") projectId: string, @CurrentUser() user: any): Promise<any> {
    const tasks = await this.tasksService.getProjectTasks(projectId);
    
    // Attach isMentioned flag
    const userEmail = user.email;
    return tasks.map((task: any) => {
      const isMentioned = task.comments?.some((comment: any) => 
        comment.content?.toLowerCase().includes(`@${userEmail.toLowerCase()}`) && !(comment.viewedBy || []).includes(user.employeeId)
      ) || false;
      return { ...task, isMentioned };
    });
  }

  @Post()
  @Permissions(Permission.WRITE_OWN_PROFILE)
  async createTask(@CurrentUser() user: any, @Body() dto: any): Promise<any> {
    return this.tasksService.createTask(user, dto);
  }

  @Patch(":id")
  @Permissions(Permission.WRITE_OWN_PROFILE)
  async updateTask(
    @Param("id") id: string,
    @CurrentUser() user: any,
    @Body() dto: any
  ): Promise<any> {
    return this.tasksService.updateTask(id, user, dto);
  }

  @Post(":id/comments")
  @Permissions(Permission.READ_OWN_PROFILE)
  async addComment(
    @Param("id") id: string,
    @CurrentUser() user: any,
    @Body() dto: { content: string, category?: string }
  ): Promise<any> {
    return this.tasksService.addComment(id, user.employeeId, dto.content, dto.category);
  }

  @Post(":id/mentions/read")
  @Permissions(Permission.READ_OWN_PROFILE)
  async markMentionsAsRead(
    @Param("id") id: string,
    @CurrentUser() user: any
  ): Promise<void> {
    return this.tasksService.markMentionsAsRead(id, user.employeeId, user.email);
  }

  @Post(":id/actions")
  @Permissions(Permission.MANAGE_PROJECTS)
  async addAction(
    @Param("id") id: string,
    @CurrentUser() user: any,
    @Body() dto: { type: string; notes?: string }
  ): Promise<any> {
    return this.tasksService.addAction(id, user.employeeId, dto.type, dto.notes);
  }

  @Patch(":id/status")
  @Permissions(Permission.WRITE_OWN_PROFILE)
  async updateStatus(
    @Param("id") id: string,
    @CurrentUser() user: any,
    @Body() dto: { status: TaskStatus }
  ): Promise<any> {
    return this.tasksService.updateTask(id, user, { status: dto.status });
  }

  @Delete(":id")
  @Permissions(Permission.WRITE_OWN_PROFILE)
  async deleteTask(@CurrentUser() user: any, @Param("id") id: string): Promise<any> {
    return this.tasksService.deleteTask(id, user);
  }
}
