import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { WorkflowInstanceStatus } from "@naprocs/database";

@Injectable()
export class WorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  async getKanbanWorkflows(): Promise<any> {
    return this.prisma.workflowInstance.findMany({
      include: {
        workflow: true,
        initiatedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            officialEmail: true,
            photoUrl: true
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    });
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
