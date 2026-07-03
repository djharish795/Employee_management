import { Injectable, NotFoundException } from "@nestjs/common";
import { TasksRepository } from "./tasks.repository";
import { TaskStatus, TaskPriority } from "@naprocs/database";

@Injectable()
export class TasksService {
  constructor(private readonly tasksRepo: TasksRepository) { }

  async getMyTasks(employeeId: string): Promise<any> {
    return this.tasksRepo.findTasksByEmployee(employeeId);
  }

  async createTask(creatorId: string, dto: any): Promise<any> {
    return this.tasksRepo.createTask(creatorId, {
      title: dto.title,
      description: dto.description,
      status: dto.status || TaskStatus.TODO,
      priority: dto.priority || TaskPriority.MEDIUM,
      creatorId: creatorId,
      assigneeId: dto.assigneeId || creatorId,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null
    });
  }

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<any> {
    return this.tasksRepo.updateTaskStatus(taskId, status);
  }
}
