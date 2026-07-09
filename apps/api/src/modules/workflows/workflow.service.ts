import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { WorkflowInstanceStatus, WorkflowType } from "@naprocs/database";

@Injectable()
export class WorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  async getConfigs(): Promise<any> {
    return this.prisma.workflow.findMany({
      orderBy: { type: "asc" }
    });
  }

  async updateConfig(type: WorkflowType, dto: any): Promise<any> {
    return this.prisma.workflow.upsert({
      where: { type },
      create: {
        type,
        name: dto.name,
        steps: dto.steps as any,
        isActive: true
      },
      update: {
        name: dto.name,
        steps: dto.steps as any,
        isActive: true
      }
    });
  }

  async getKanbanWorkflows(): Promise<any> {
    return this.prisma.workflowInstance.findMany({
      include: {
        workflow: true,
        initiatedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            personalEmail: true
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    });
  }

  async getMyApprovals(employeeId: string): Promise<any> {
    const userEmployee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { user: true }
    });

    if (!userEmployee || !userEmployee.user) {
      throw new NotFoundException("Employee not found");
    }

    const userRole = userEmployee.user.role;

    const instances = await this.prisma.workflowInstance.findMany({
      where: { status: "PENDING" },
      include: {
        workflow: true,
        initiatedBy: {
          include: { department: true }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    const filteredInstances = (instances as any[]).filter(instance => {
      const steps = instance.workflow.steps as any[];
      const currentStep = steps[instance.currentStepIndex];
      if (!currentStep) return false;

      const assigneeRole = currentStep.assigneeRole;

      if (assigneeRole === "MANAGER") {
        return (instance.initiatedBy as any).department?.headId === employeeId;
      }

      return assigneeRole === userRole;
    });

    return filteredInstances;
  }

  async updateStatus(id: string, status: WorkflowInstanceStatus) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id }
    });

    if (!instance) {
      throw new NotFoundException("Workflow instance not found");
    }

    return this.prisma.workflowInstance.update({
      where: { id },
      data: { status }
    });
  }
}
