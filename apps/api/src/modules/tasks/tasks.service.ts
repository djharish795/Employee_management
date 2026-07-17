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

  private async validateTaskScreenAccess(user: any) {
    if (['SUPER_ADMIN', 'CEO', 'CTO'].includes(user.role)) return { isAllowed: true, isAssigner: true, title: user.role };
    
    const emp = await this.prisma.employee.findUnique({
      where: { id: user.employeeId },
      include: { 
        designation: true,
        department: true,
        projectAssignments: {
          where: { releasedAt: null }
        }
      }
    });
    
    if (!emp) throw new ForbiddenException("Employee not found");
    
    const isTechnicalDepartment = ['ENG', 'TECH', 'QA'].includes(emp.department?.code || '');
    const hasProjectAssignment = emp.projectAssignments.length > 0;
    
    if (!isTechnicalDepartment && !hasProjectAssignment && !['CEO', 'CTO', 'DM', 'SPM', 'PM', 'TL', 'OM'].includes(user.role)) {
      throw new ForbiddenException("You do not have access to the Tasks module. This module is restricted to Technical departments and active project members.");
    }
    
    // Check if they are an assigner either globally or via project role
    const GLOBAL_ASSIGNERS = ['CEO', 'CTO', 'DM', 'SPM', 'PM', 'TL', 'OM'];
    const hasGlobalAssignerRole = GLOBAL_ASSIGNERS.includes(user.role);
    
    const PROJECT_ASSIGNER_ROLES = ['DM', 'SPM', 'PM', 'TL'];
    const hasProjectAssignerRole = emp.projectAssignments.some(pa => PROJECT_ASSIGNER_ROLES.includes(pa.projectRole));
    
    const isAssigner = hasGlobalAssignerRole || hasProjectAssignerRole;
    
    return { isAllowed: true, isAssigner, title: emp.designation?.title || user.role };
  }

  async getMyTasks(user: any): Promise<any> {
    await this.validateTaskScreenAccess(user);
    const isTrTs = ['TR', 'TS', 'TRAINEE', 'TECHNICAL_SUPPORT'].includes(user.role);
    return this.tasksRepo.findTasksByEmployee(user.employeeId, isTrTs);
  }

  async getProjectTasks(projectId: string, user?: any): Promise<any> {
    if (user) {
      await this.validateTaskScreenAccess(user);
      const isManagerOrHigher = RbacGroups.MANAGER_OR_HIGHER.includes(user.role as any);
      if (!isManagerOrHigher) {
        const assignment = await this.prisma.projectAssignment.findFirst({
          where: { projectId, employeeId: user.employeeId, releasedAt: null }
        });
        if (!assignment) {
          throw new ForbiddenException("You do not have permission to view tasks for this project.");
        }
      }
    }
    return this.tasksRepo.findTasksByProject(projectId);
  }

  async createTask(user: any, dto: any): Promise<any> {
    const access = await this.validateTaskScreenAccess(user);
    this.logger.debug("Creating task...", { user, dto });
    const creatorId = user.employeeId;

    // RBAC Check: Only Team Leads, Managers, QA, and higher can create tasks
    const employee = await this.prisma.employee.findUnique({
      where: { id: creatorId },
      include: { department: true, designation: true }
    });
    
    const isQa = employee && (employee.department?.name === 'QA' || employee.designation?.title?.includes('QA'));
    const isLeadOrManager = RbacGroups.LEAD_OR_MANAGER.includes(user.role as any);
    const isCamOeOm = ['CEM', 'OE', 'OM'].includes(user.role as string);
    
    if (!isLeadOrManager && !isQa && !isCamOeOm) {
      throw new ForbiddenException("You do not have permission to create tasks. Standard members can only comment.");
    }

    const isManagerOrHigher = RbacGroups.MANAGER_OR_HIGHER.includes(user.role as any);

    // Team Leads can create any task type, so the previous restriction is removed.
    if (isQa && !isManagerOrHigher && user.role !== RbacRoles.TEAM_LEAD && dto.type !== 'BUG') {
      throw new ForbiddenException("QA Engineers can only create Bug tasks.");
    }

    let issueKey: string | null = null;

    if (dto.projectId) {
      if (dto.assigneeId && !isManagerOrHigher) {
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
    } else if (dto.assigneeId && dto.assigneeId !== creatorId) {
      if (!isManagerOrHigher) {
        if (user.role === RbacRoles.TEAM_LEAD) {
          const assigneeRecord = await this.prisma.employee.findUnique({ where: { id: dto.assigneeId } });
          if (assigneeRecord?.reportingManagerId !== creatorId) {
            throw new ForbiddenException("You can only assign generic tasks to yourself or your direct reports.");
          }
        } else {
          throw new ForbiddenException("You can only assign generic tasks to yourself.");
        }
      }
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
    
    this.auditService.logCreate({
      moduleName: 'Tasks',
      entityId: task.id,
      actorId: user.employeeId,
      metadata: { title: task.title, status: task.status }
    });

    return task;
  }

  async updateTask(taskId: string, user: any, dto: any): Promise<any> {
    const access = await this.validateTaskScreenAccess(user);
    const task = await this.getTask(taskId);

    const isManagerOrHigher = RbacGroups.MANAGER_OR_HIGHER.includes(user.role as any);

    if (!access.isAssigner && !isManagerOrHigher) {
      if (task.assigneeId !== user.employeeId) {
        throw new ForbiddenException("You can only participate in tasks assigned to you.");
      }
      
      const creator = await this.prisma.employee.findUnique({
        where: { id: task.creatorId },
        include: { 
          user: true,
          projectAssignments: {
            where: { releasedAt: null }
          }
        }
      });
      
      const GLOBAL_ASSIGNERS = ['CEO', 'CTO', 'DM', 'SPM', 'PM', 'TL', 'OM'];
      const hasGlobalAssignerRole = GLOBAL_ASSIGNERS.includes(creator?.user?.role as string);
      
      const PROJECT_ASSIGNER_ROLES = ['DM', 'SPM', 'PM', 'TL'];
      const hasProjectAssignerRole = creator?.projectAssignments?.some(pa => PROJECT_ASSIGNER_ROLES.includes(pa.projectRole)) || false;
      
      const isCreatorAssigner = hasGlobalAssignerRole || hasProjectAssignerRole;
      
      if (!isCreatorAssigner) {
        throw new ForbiddenException("You can only participate in tasks assigned by a Team Lead or higher manager.");
      }
    }

    // General update check
    const isCreator = user.employeeId === task.creatorId;
    const isAssignee = user.employeeId === task.assigneeId;

    if (!isManagerOrHigher && !isCreator && !isAssignee) {
      throw new ForbiddenException("You do not have permission to edit this task.");
    }

    // If changing status, we might want to restrict it further, but assignee/manager is already covered by the general check.
    // We just keep the existing explicit check for status if needed, but since we already block non-assignee/creator, 
    // let's ensure creators can't change status if they aren't the assignee (unless manager).
    if (dto.status && dto.status !== task.status) {
      if (!isAssignee && !isManagerOrHigher) {
        throw new ForbiddenException("Only the assigned employee or a Manager can change the status of this task.");
      }
    }

    const updatedTask = await this.tasksRepo.updateTask(taskId, dto);

    this.auditService.logUpdate({
      moduleName: 'Tasks',
      entityId: taskId,
      actorId: user.employeeId,
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
      actorId: 'SYSTEM',
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

  async addComment(taskId: string, user: any, content: string, category: string = "COMMENT"): Promise<any> {
    const task = await this.getTask(taskId);
    
    // RBAC check for comments IDOR
    const isManagerOrHigher = RbacGroups.MANAGER_OR_HIGHER.includes(user.role as any);
    const authorId = user.employeeId;
    if (!isManagerOrHigher && task.creatorId !== authorId && task.assigneeId !== authorId) {
      if (task.projectId) {
        const assignment = await this.prisma.projectAssignment.findFirst({
          where: { projectId: task.projectId, employeeId: authorId, releasedAt: null }
        });
        if (!assignment) {
          throw new ForbiddenException("You do not have permission to comment on this task.");
        }
      } else {
        throw new ForbiddenException("You do not have permission to comment on this task.");
      }
    }

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
    const comments = await (this.prisma as any).taskComment.findMany({
      where: {
        taskId,
        content: { contains: `@${email}`, mode: 'insensitive' }
      }
    });

    const commentsToUpdate = comments.filter((c: any) => !c.viewedBy.includes(employeeId));
    
    if (commentsToUpdate.length > 0) {
      await this.prisma.$transaction(
        commentsToUpdate.map((comment: any) => 
          (this.prisma as any).taskComment.update({
            where: { id: comment.id },
            data: { viewedBy: { push: employeeId } }
          })
        )
      );
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

  async deleteTask(taskId: string, user: any): Promise<any> {
    const task = await this.tasksRepo.findById(taskId);
    if (!task) throw new NotFoundException("Task not found");
    
    const isManagerOrHigher = RbacGroups.MANAGER_OR_HIGHER.includes(user.role as any);
    const hasOverride = user.role === 'SUPER_ADMIN' || user.role === 'IT' || isManagerOrHigher;
    
    if (task.creatorId !== user.employeeId && task.assigneeId !== user.employeeId && !hasOverride) {
      throw new NotFoundException("Task not found"); // Masking forbidden as not found
    }
    const result = await this.tasksRepo.deleteTask(taskId);
    
    this.auditService.logDelete({
      moduleName: 'Tasks',
      entityId: taskId,
      actorId: user.employeeId,
      metadata: { title: task.title }
    });

    return result;
  }
}
