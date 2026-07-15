import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { RbacGroups, RbacRoles } from '../../common/rbac/rbac.config';
import { TasksRepository } from "./tasks.repository";
import { TaskStatus, TaskPriority, NotificationType } from "@naprocs/database";
import { PrismaService } from "../../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly tasksRepo: TasksRepository,
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly auditService: AuditService,
  ) { }

  async getMyTasks(employeeId: string): Promise<any> {
    return this.tasksRepo.findTasksByEmployee(employeeId);
  }

  async getProjectTasks(projectId: string): Promise<any> {
    return this.tasksRepo.findTasksByProject(projectId);
  }

  async createTask(user: any, dto: any): Promise<any> {
    this.logger.debug("Creating task...", { user, dto });
    const creatorId = user.employeeId;

    // RBAC Check: Only Team Leads, Managers, QA, and higher can create tasks
    const employee = await this.prisma.employee.findUnique({
      where: { id: creatorId },
      include: { department: true, designation: true }
    });
    
    const isQa = employee && (employee.department?.name === 'QA' || employee.designation?.title?.includes('QA'));
    const isLeadOrManager = RbacGroups.LEAD_OR_MANAGER.includes(user.role as any);
    
    if (!isLeadOrManager && !isQa) {
      throw new ForbiddenException("You do not have permission to create tasks. Standard members can only comment.");
    }

    const isManagerOrHigher = RbacGroups.MANAGER_OR_HIGHER.includes(user.role as any);

    if (user.role === RbacRoles.TEAM_LEAD && !isManagerOrHigher && !['DAILY_TASK', 'WEEKLY_TASK_SHEET'].includes(dto.type)) {
      throw new ForbiddenException("Team Leads can only create Daily Tasks and Weekly Task Sheets.");
    }

    if (isQa && !isManagerOrHigher && user.role !== RbacRoles.TEAM_LEAD && dto.type !== 'BUG') {
      throw new ForbiddenException("QA Engineers can only create Bug tasks.");
    }

    let issueKey: string | null = null;

    if (dto.projectId) {
      if (dto.assigneeId) {
        // Validate assignee is in project
        const assignment = await this.prisma.projectAssignment.findUnique({
          where: {
            projectId_employeeId: {
              projectId: dto.projectId,
              employeeId: dto.assigneeId
            }
          }
        });
        if (!assignment || assignment.releasedAt) {
          throw new BadRequestException("Assignee must be an active member of the project.");
        }
      }

      // Generate issueKey
      const project = await this.prisma.project.update({
        where: { id: dto.projectId },
        data: { issueCounter: { increment: 1 } }
      });
      issueKey = `${project.key || 'TASK'}-${project.issueCounter}`;
    }

    const task = await this.tasksRepo.createTask(creatorId, {
      title: dto.title,
      description: dto.description,
      status: dto.status || "TODO",
      priority: dto.priority || "MEDIUM",
      type: dto.type || "TASK",
      creatorId: creatorId,
      assigneeId: dto.assigneeId || creatorId,
      reporterId: dto.reporterId || creatorId,
      projectId: dto.projectId,
      sprintId: dto.sprintId,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      issueKey: issueKey
    });

    if (task.assigneeId && task.assigneeId !== creatorId) {
      // Notify assignee
      await this.notificationsService.createNotification(
        task.assigneeId,
        "New Task Assigned",
        `You have been assigned a new ${task.type.toLowerCase()}: ${task.title}`,
        NotificationType.SYSTEM_ALERT
      );
    }
    
    // TODO: Replace 'unknown' with authenticated userId once JWT is implemented
    this.auditService.logCreate({
      moduleName: 'Tasks',
      entityId: task.id,
      actorId: 'unknown',
      metadata: { title: task.title, status: task.status }
    });

    return task;
  }

  async updateTask(taskId: string, user: any, dto: any): Promise<any> {
    const task = await this.getTask(taskId);

    // If changing status, only allow Assignee
    if (dto.status && dto.status !== task.status) {
      if (user.employeeId !== task.assigneeId) {
        throw new ForbiddenException("Only the assigned employee can change the status of this task.");
      }
    }

    const updatedTask = await this.tasksRepo.updateTask(taskId, dto);

    // TODO: Replace 'unknown' with authenticated userId once JWT is implemented
    this.auditService.logUpdate({
      moduleName: 'Tasks',
      entityId: taskId,
      actorId: 'unknown',
      oldValue: { status: task.status },
      newValue: dto
    });

    return updatedTask;
  }

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<any> {
    const task = await this.getTask(taskId);
    const updatedTask = await this.tasksRepo.updateTask(taskId, { status });
    this.auditService.logUpdate({
      moduleName: 'Tasks',
      entityId: taskId,
      actorId: 'unknown',
      oldValue: { status: task.status },
      newValue: { status }
    });
    return updatedTask;
  }

  async getTask(taskId: string): Promise<any> {
    const task = await this.tasksRepo.findTaskById(taskId);
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async addComment(taskId: string, authorId: string, content: string, category: string = "COMMENT"): Promise<any> {
    const task = await this.getTask(taskId);
    // Use proper typing but default to COMMENT
    const validCategory = ["QUESTION", "COMMENT", "BUG", "IMPROVEMENT"].includes(category) ? category as any : "COMMENT";
    
    // We need to pass the category to the repository method. Wait, let me modify repository first.
    // I'll just pass it down and modify the repo method next.
    const comment = await this.tasksRepo.addComment(taskId, authorId, content, validCategory);
    
    // Notify assignee if someone else commented
    if (task.assigneeId && task.assigneeId !== authorId) {
      await this.notificationsService.createNotification(
        task.assigneeId,
        "New Comment on Task",
        `A new comment was added to your task: ${task.title}`,
        NotificationType.SYSTEM_ALERT
      );
    }

    // Parse @mentions (e.g. @john.doe@naprocs.in)
    const mentionRegex = /@([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;
    const matches = [...content.matchAll(mentionRegex)];
    if (matches.length > 0) {
      const emails = matches.map(m => m[1].toLowerCase());
      const mentionedEmployees = await this.prisma.employee.findMany({
        where: { officialEmail: { in: emails } }
      });

      for (const emp of mentionedEmployees) {
        if (emp.id !== authorId && emp.id !== task.assigneeId) {
          await this.notificationsService.createNotification(
            emp.id,
            "You were mentioned in a task",
            `You were mentioned in a comment on task: ${task.title}`,
            NotificationType.SYSTEM_ALERT
          );
        }
      }
    }

    return comment;
  }

  async markMentionsAsRead(taskId: string, employeeId: string, email: string): Promise<void> {
    // Only update comments that mention this user and haven't been viewed by them yet
    // Since updateMany doesn't easily filter by "not in array", we fetch then update, or just push.
    // Pushing an existing value might duplicate it, but it's fine for a simple viewedBy array,
    // or we can just fetch and update.
    const comments = await (this.prisma as any).taskComment.findMany({
      where: {
        taskId,
        content: { contains: `@${email}`, mode: 'insensitive' }
      }
    });

    for (const comment of comments) {
      if (!comment.viewedBy.includes(employeeId)) {
        await (this.prisma as any).taskComment.update({
          where: { id: comment.id },
          data: { viewedBy: { push: employeeId } }
        });
      }
    }
  }

  async addAction(taskId: string, actorId: string, type: string, notes?: string): Promise<any> {
    const task = await this.getTask(taskId);
    const action = await this.tasksRepo.addAction(taskId, actorId, type, notes);
    
    if (task.assigneeId) {
      await this.notificationsService.createNotification(
        task.assigneeId,
        `Task Action: ${type}`,
        `Management action taken on task: ${task.title}`,
        NotificationType.SECURITY_ALERT
      );
    }

    return action;
  }

  async deleteTask(taskId: string, employeeId: string): Promise<any> {
    const task = await this.tasksRepo.findById(taskId);
    if (!task) throw new NotFoundException("Task not found");
    if (task.creatorId !== employeeId && task.assigneeId !== employeeId) {
      throw new NotFoundException("Task not found"); // Masking forbidden as not found
    }
    const result = await this.tasksRepo.deleteTask(taskId);
    
    // TODO: Replace 'unknown' with authenticated userId once JWT is implemented
    this.auditService.logDelete({
      moduleName: 'Tasks',
      entityId: taskId,
      actorId: 'unknown',
      metadata: { title: task.title }
    });

    return result;
  }
}
