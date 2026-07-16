import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { TaskStatus, TaskPriority, Prisma } from "@naprocs/database";

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findTasksByEmployee(employeeId: string, isTrTs: boolean = false): Promise<any> {
    const where = isTrTs 
      ? { assigneeId: employeeId }
      : { OR: [{ assigneeId: employeeId }, { creatorId: employeeId }] };

    return this.prisma.task.findMany({
      where,
      distinct: ['id'],
      include: {
        assignee: true,
        creator: true,
        meetRequest: true,
        project: true,
        comments: { include: { author: true } },
        actions: { include: { actor: true } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }]
    });
  }

  async findTasksByProject(projectId: string): Promise<any> {
    return this.prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: true,
        reporter: true,
        sprint: true,
        project: true,
        comments: { include: { author: true } },
        actions: { include: { actor: true } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }]
    });
  }

  async createTask(creatorId: string, data: Prisma.TaskUncheckedCreateInput): Promise<any> {
    return this.prisma.task.create({
      data: { ...data, creatorId },
      include: { assignee: true, creator: true }
    });
  }

  async updateTask(id: string, data: Prisma.TaskUpdateInput): Promise<any> {
    return this.prisma.task.update({
      where: { id },
      data,
      include: { assignee: true, reporter: true, sprint: true, comments: { include: { author: true } }, actions: { include: { actor: true } } }
    });
  }

  async findTaskById(id: string): Promise<any> {
    return this.prisma.task.findUnique({
      where: { id },
      include: { assignee: true, creator: true, reporter: true, sprint: true, comments: { include: { author: true } }, actions: { include: { actor: true } } }
    });
  }

  async addComment(taskId: string, authorId: string, content: string, category: any = "COMMENT"): Promise<any> {
    return this.prisma.taskComment.create({
      data: { taskId, authorId, content, category },
      include: { author: true }
    });
  }

  async addAction(taskId: string, actorId: string, type: any, notes?: string): Promise<any> {
    return this.prisma.taskAction.create({
      data: { taskId, actorId, type, notes },
      include: { actor: true }
    });
  }

  async findById(id: string): Promise<any> {
    return this.prisma.task.findUnique({
      where: { id }
    });
  }

  async deleteTask(id: string): Promise<any> {
    return this.prisma.task.delete({
      where: { id }
    });
  }
}
