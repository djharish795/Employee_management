import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { EmailService } from "../notifications/email.service";
import { WorkflowType, WorkflowInstanceStatus } from "@naprocs/database";

@Injectable()
export class WorkflowEngineService {
  private readonly logger = new Logger(WorkflowEngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly emailService: EmailService
  ) { }

  async startWorkflow(type: WorkflowType, resourceId: string, initiatorId: string, payload?: any): Promise<any> {
    const workflow = await this.prisma.workflow.findUnique({
      where: { type }
    });

    if (!workflow || !workflow.isActive) {
      throw new BadRequestException(`No active workflow found for type ${type}`);
    }

    const steps = workflow.steps as any[];
    if (!steps || steps.length === 0) {
      throw new BadRequestException(`Workflow ${type} has no steps defined`);
    }

    const instance = await this.prisma.workflowInstance.create({
      data: {
        workflowId: workflow.id,
        resourceId,
        resourceType: type,
        initiatedById: initiatorId,
        currentStepIndex: 0,
        status: "PENDING",
        metadata: payload, // save payload as metadata
      }
    });

    await this.auditService.createLog({
      action: "WORKFLOW_STARTED",
      actorId: initiatorId,
      resource: "WorkflowInstance",
      resourceId: instance.id,
      newValue: { type, resourceId, currentStepIndex: 0, payload }
    });

    await this.notifyAssignee(instance.id, steps[0]);

    return instance;
  }

  private async notifyAssignee(instanceId: string, step: any) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: instanceId },
      include: { 
        initiatedBy: {
          include: { department: { include: { head: true } } }
        } 
      }
    });
    if (!instance) return;

    const role = step.assigneeRole;
    let recipientEmail = 'hr@naprocs.in'; // fallback

    if (role === 'MANAGER') {
      const manager = (instance.initiatedBy as any).department?.head;
      if (manager && manager.officialEmail) {
        recipientEmail = manager.officialEmail;
      }
    } else {
      const potentialAssignee = await this.prisma.user.findFirst({
        where: { role: role },
        include: { employee: true }
      });
      if (potentialAssignee?.employee?.officialEmail) {
        recipientEmail = potentialAssignee.employee.officialEmail;
      }
    }

    await this.emailService.sendEmail(
      recipientEmail,
      `Action Required: New ${instance.resourceType} Request`,
      "workflow_assignment",
      {
        workflowId: instance.id,
        type: instance.resourceType,
        initiator: `${instance.initiatedBy.firstName} ${instance.initiatedBy.lastName}`,
        stepTitle: step.title
      }
    );
  }

  async processApproval(instanceId: string, action: "APPROVE" | "REJECT", actorId: string, notes?: string): Promise<any> {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: instanceId },
      include: {
        workflow: true,
        initiatedBy: {
          include: { department: true }
        }
      }
    });

    if (!instance) {
      throw new NotFoundException("Workflow instance not found");
    }

    if (instance.status !== "PENDING") {
      throw new BadRequestException(`Workflow instance is already ${instance.status}`);
    }

    const steps = instance.workflow.steps as any[];
    const currentStep = steps[instance.currentStepIndex];

    // Authorization Check
    if (actorId !== "SYSTEM") {
      const actorEmployee = await this.prisma.employee.findUnique({
        where: { id: actorId },
        include: { user: true }
      });
      if (!actorEmployee || !actorEmployee.user) {
        throw new ForbiddenException("Invalid actor");
      }

      const assigneeRole = currentStep.assigneeRole;
      let isAuthorized = false;

      if (assigneeRole === "MANAGER") {
        isAuthorized = (instance.initiatedBy as any).department?.headId === actorId;
      } else {
        isAuthorized = actorEmployee.user.role === assigneeRole;
      }

      // HR can always override or approve
      if (actorEmployee.user.role === "HR" || actorEmployee.user.role === "SUPER_ADMIN") {
        isAuthorized = true;
      }

      if (!isAuthorized) {
        throw new ForbiddenException(`You are not authorized to ${action.toLowerCase()} this step. Required: ${assigneeRole}`);
      }
    }

    if (action === "REJECT") {
      const updated = await this.prisma.workflowInstance.update({
        where: { id: instanceId },
        data: { status: "REJECTED" }
      });
      await this.auditService.createLog({
        action: "WORKFLOW_REJECTED",
        actorId,
        resource: "WorkflowInstance",
        resourceId: instanceId,
        newValue: { stepIndex: instance.currentStepIndex, stepTitle: currentStep.title, notes }
      });

      await this.executeRejectionHook(instance, notes);

      return updated;
    }

    // Action is APPROVE
    const nextStepIndex = instance.currentStepIndex + 1;
    const isFinalStep = nextStepIndex >= steps.length;

    const updated = await this.prisma.workflowInstance.update({
      where: { id: instanceId },
      data: {
        currentStepIndex: isFinalStep ? instance.currentStepIndex : nextStepIndex,
        status: isFinalStep ? "APPROVED" : "PENDING"
      }
    });

    await this.auditService.createLog({
      action: "WORKFLOW_APPROVED",
      actorId,
      resource: "WorkflowInstance",
      resourceId: instanceId,
      newValue: { stepIndex: instance.currentStepIndex, stepTitle: currentStep.title, notes }
    });

    if (isFinalStep) {
      await this.auditService.createLog({
        action: "WORKFLOW_COMPLETED",
        actorId: "SYSTEM",
        resource: "WorkflowInstance",
        resourceId: instanceId,
        newValue: { status: "APPROVED" }
      });
      await this.executeFinalApprovalHook(instance);
    } else {
      await this.notifyAssignee(instanceId, steps[nextStepIndex]);
    }

    return updated;
  }

  async forceStatusUpdate(instanceId: string, status: WorkflowInstanceStatus, actorId: string): Promise<any> {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: instanceId },
      include: { workflow: true }
    });

    if (!instance) throw new NotFoundException("Workflow instance not found");

    // Only act if status actually changes
    if (instance.status === status) return instance;

    const updated = await this.prisma.workflowInstance.update({
      where: { id: instanceId },
      data: { status }
    });

    await this.auditService.createLog({
      action: "WORKFLOW_FORCE_UPDATED",
      actorId,
      resource: "WorkflowInstance",
      resourceId: instanceId,
      newValue: { previousStatus: instance.status, newStatus: status }
    });

    // Execute hooks based on forced status
    if (status === "APPROVED" || status === ("COMPLETED" as any)) {
      await this.executeFinalApprovalHook(instance);
    } else if (status === "REJECTED" || status === "CANCELLED") {
      await this.executeRejectionHook(instance, "Forced via HR Kanban Board");
    }

    return updated;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async processTimeouts() {
    this.logger.log("Checking for expired workflow steps...");

    const pendingInstances = await this.prisma.workflowInstance.findMany({
      where: { status: "PENDING" },
      include: { workflow: true }
    });

    const now = new Date();

    for (const instance of pendingInstances) {
      const steps = instance.workflow.steps as any[];
      const currentStep = steps[instance.currentStepIndex];

      if (!currentStep.timeoutHours) continue;

      const lastUpdate = instance.updatedAt;
      const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

      if (hoursSinceUpdate >= currentStep.timeoutHours) {
        this.logger.log(`Workflow ${instance.id} step ${instance.currentStepIndex} timed out.`);

        if (currentStep.onTimeout === "AUTO_APPROVE") {
          await this.processApproval(instance.id, "APPROVE", "SYSTEM", "Auto-approved due to timeout");
        } else if (currentStep.onTimeout === "REJECT") {
          await this.processApproval(instance.id, "REJECT", "SYSTEM", "Rejected due to timeout");
        } else if (currentStep.onTimeout === "ESCALATE_HR") {
          await this.auditService.createLog({
            action: "WORKFLOW_ESCALATED",
            actorId: "SYSTEM",
            resource: "WorkflowInstance",
            resourceId: instance.id,
            newValue: { reason: "Timeout reached", escalatedTo: "HR" }
          });
          // Notify HR
          const hrUsers = await this.prisma.user.findMany({
            where: { role: "HR" },
            include: { employee: true }
          });
          const hrEmails = hrUsers.map(u => u.employee?.officialEmail).filter(Boolean);
          if (hrEmails.length > 0) {
            await this.emailService.sendEmail(hrEmails[0] as string, `Workflow Escalated: ${instance.resourceType}`, 'workflow_escalation', { workflowId: instance.id });
          }
        }
      }
    }
  }

  private async executeRejectionHook(instance: any, reason?: string) {
    if (instance.resourceType === "LEAVE") {
      await this.prisma.$transaction(async (tx) => {
        const leave = await tx.leaveRequest.update({
          where: { id: instance.resourceId },
          data: { status: "REJECTED", rejectionReason: reason }
        });

        const currentYear = new Date(leave.startDate).getFullYear();
        const balance = await tx.leaveBalance.findUnique({
          where: {
            employeeId_leaveTypeId_year: {
              employeeId: leave.employeeId,
              leaveTypeId: leave.leaveTypeId,
              year: currentYear
            }
          }
        });

        if (balance) {
          await tx.leaveBalance.update({
            where: { id: balance.id },
            data: {
              pending: { decrement: leave.totalDays }
            }
          });
        }
      });
    }
  }

  private async executeFinalApprovalHook(instance: any) {
    if (instance.resourceType === "LEAVE") {
      await this.prisma.$transaction(async (tx) => {
        const leave = await tx.leaveRequest.update({
          where: { id: instance.resourceId },
          data: { status: "APPROVED", approvedAt: new Date() }
        });

        const currentYear = new Date(leave.startDate).getFullYear();
        const balance = await tx.leaveBalance.findUnique({
          where: {
            employeeId_leaveTypeId_year: {
              employeeId: leave.employeeId,
              leaveTypeId: leave.leaveTypeId,
              year: currentYear
            }
          }
        });

        if (balance) {
          await tx.leaveBalance.update({
            where: { id: balance.id },
            data: {
              pending: { decrement: leave.totalDays },
              used: { increment: leave.totalDays }
            }
          });
        }
      });
    } else if (instance.resourceType === "ASSET_REQUEST") {
      // Logic for granting asset request can go here
      this.logger.log(`Asset Request ${instance.resourceId} approved.`);
    }
  }
}
