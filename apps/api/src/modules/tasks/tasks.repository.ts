import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { TaskStatus, TaskPriority, Prisma } from "@naprocs/database";

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findTasksByEmployee(employeeId: string): Promise<any> {
    return this.prisma.task.findMany({
      where: {
        OR: [
          { assigneeId: employeeId },
          { creatorId: employeeId }
        ]
      },
      include: {
        assignee: true,
        creator: true,
        meetRequest: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createTask(creatorId: string, data: Prisma.TaskUncheckedCreateInput): Promise<any> {
    return this.prisma.task.create({
      data: { ...data, creatorId },
      include: { assignee: true, creator: true }
    });
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<any> {
    return this.prisma.task.update({
      where: { id },
      data: { status },
      include: { assignee: true, creator: true }
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
