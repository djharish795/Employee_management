import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RbacRoles, RbacGroups } from '../../common/rbac/rbac.config';
import { resolveWorkflowRole, WorkflowRole } from '../../common/constants/workflow-roles.constants';
import { ApprovalQueueItem } from '../leaves/leaves.service';

@Injectable()
export class WfhService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) { }

  async getMyWfh(employeeId: string): Promise<unknown> {
    return this.prisma.workFromHomeRequest.findMany({
      where: { employeeId },
      orderBy: { date: 'desc' }
    });
  }

  async applyWfh(employeeId: string, date: string, reason: string): Promise<any> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { projectAssignments: true }
    });

    if (!employee) throw new NotFoundException('Employee not found');

    const targetDate = new Date(date);
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

    const wfhRequest = await this.prisma.$transaction(async (tx) => {
      // 1. Employee limit: Max 1 WFH per month
      const employeeWfhCount = await tx.workFromHomeRequest.count({
        where: {
          employeeId: employee.id,
          status: { in: ['APPROVED', 'PENDING'] },
          date: { gte: startOfMonth, lte: endOfMonth }
        }
      });

      if (employeeWfhCount >= 1) {
        throw new BadRequestException('You can only avail a maximum of 1 Work From Home day per month.');
      }

      // 2. Project limit: Max 3 WFH per team/project per month
      const projectIds = employee.projectAssignments.map(p => p.projectId);

      if (projectIds.length > 0) {
        const allProjectAssignments = await tx.projectAssignment.findMany({
          where: { projectId: { in: projectIds } },
          select: { projectId: true, employeeId: true }
        });

        const teamMembersByProject = new Map<string, string[]>();
        for (const pa of allProjectAssignments) {
          if (!teamMembersByProject.has(pa.projectId)) {
            teamMembersByProject.set(pa.projectId, []);
          }
          teamMembersByProject.get(pa.projectId)!.push(pa.employeeId);
        }

        await Promise.all(
          Array.from(teamMembersByProject.entries()).map(async ([pid, teamMemberIds]) => {
            const projectWfhCount = await tx.workFromHomeRequest.count({
              where: {
                employeeId: { in: teamMemberIds },
                status: { in: ['APPROVED', 'PENDING'] },
                date: { gte: startOfMonth, lte: endOfMonth }
              }
            });

            if (projectWfhCount >= 3) {
              throw new BadRequestException('Your project team has already reached the maximum of 3 Work From Home days this month.');
            }
          })
        );
      }

      // Check if WFH or Leave already exists for this date
      const existingWfh = await tx.workFromHomeRequest.findFirst({
          where: { employeeId: employee.id, date: targetDate, status: { not: 'REJECTED' } }
      });
      if (existingWfh) throw new BadRequestException('A WFH request already exists for this date.');

      const approvalQueue = [
        { role: RbacRoles.TR, status: 'PENDING' },
        { role: RbacRoles.HR, status: 'PENDING' }
      ];

      return tx.workFromHomeRequest.create({
        data: {
          employeeId: employee.id,
          date: targetDate,
          reason,
          status: 'PENDING',
          approvalQueue: approvalQueue as any,
          currentStep: 0
        }
      });
    });

    // TODO: Replace 'unknown' with authenticated userId once JWT is implemented
    this.auditService.logCreate({
      moduleName: 'WFH',
      entityId: wfhRequest.id,
      actorId: 'unknown',
      metadata: { date, reason }
    });

    return wfhRequest;
  }

  async getApprovals(approverId: string): Promise<unknown> {
    const approver = await this.prisma.employee.findUnique({
      where: { id: approverId },
      include: { department: true, designation: true }
    });
    
    if (!approver) throw new NotFoundException('Approver not found');
    
    // Resolve the approver's workflow role from centralized mappings
    const role = resolveWorkflowRole(approver);

    const requests = await this.prisma.workFromHomeRequest.findMany({
      where: { status: 'PENDING' },
      include: { employee: true }
    });

    return requests.filter(req => {
      const reqData = req as typeof req & { approvalQueue?: unknown, currentStep: number };
      if (!reqData.approvalQueue) return false;
      const queue = reqData.approvalQueue as unknown as ApprovalQueueItem[];
      const currentStep = queue[reqData.currentStep];
      if (!currentStep) return false;
      return currentStep.role === role && currentStep.status === 'PENDING';
    });
  }

  async approveWfh(wfhId: string, approverId: string): Promise<unknown> {
    const wfh = await this.prisma.workFromHomeRequest.findUnique({ where: { id: wfhId } });
    if (!wfh) throw new NotFoundException('WFH request not found');
    if (wfh.status !== 'PENDING') throw new BadRequestException('WFH is not pending');

    const approver = await this.prisma.employee.findUnique({
      where: { id: approverId },
      include: { department: true, designation: true }
    });
    if (!approver) throw new NotFoundException('Approver not found');

    // Resolve the approver's workflow role from centralized mappings
    const approverRole = resolveWorkflowRole(approver);

    const wfhData = wfh as typeof wfh & { approvalQueue?: unknown, currentStep: number };
    const queue = wfhData.approvalQueue as unknown as ApprovalQueueItem[];
    
    // OR override logic
    // TODO: Replace with permission-based check once RBAC guards are active
    if ((RbacGroups.APPROVAL_OVERRIDERS as readonly string[]).includes(approverRole)) {
      queue.forEach(q => {
        if (q.status === 'PENDING') {
          q.status = 'APPROVED';
          q.approverId = approverId;
          q.actedAt = new Date();
        }
      });
      
      await this.prisma.$transaction(async (tx) => {
        await tx.workFromHomeRequest.update({
          where: { id: wfhId },
          data: {
            status: 'APPROVED',
            approvedAt: new Date(),
            approverId,
            ...({ approvalQueue: queue as unknown as object, currentStep: queue.length })
          }
        });

        // Insert WFH into attendance record
        await tx.attendanceRecord.upsert({
            where: {
                employeeId_date: {
                    employeeId: wfh.employeeId,
                    date: wfh.date
                }
            },
            update: { status: 'WFH' },
            create: {
                employeeId: wfh.employeeId,
                date: wfh.date,
                status: 'WFH'
            }
        });
      });
      // TODO: Replace 'unknown' with authenticated userId once JWT is implemented
      this.auditService.logApprove({
        moduleName: 'WFH',
        entityId: wfhId,
        actorId: 'unknown',
        metadata: { approverId, override: true }
      });

      return { message: 'WFH Approved Successfully via Override' };
    }

    const currentStepIndex = wfhData.currentStep;
    const currentStep = queue[currentStepIndex];

    if (!currentStep) throw new BadRequestException('Queue is already completed.');
    if (currentStep.role !== approverRole) throw new BadRequestException(`You are not authorized for this step. Waiting for ${currentStep.role}`);

    currentStep.status = 'APPROVED';
    currentStep.approverId = approverId;
    currentStep.actedAt = new Date();

    const nextStepIndex = currentStepIndex + 1;
    const isFinished = nextStepIndex >= queue.length;

    await this.prisma.$transaction(async (tx) => {
      await tx.workFromHomeRequest.update({
        where: { id: wfhId },
        data: {
          status: isFinished ? 'APPROVED' : 'PENDING',
          approvedAt: isFinished ? new Date() : null,
          approverId: isFinished ? approverId : null,
          ...({ approvalQueue: queue as unknown as object, currentStep: nextStepIndex })
        }
      });

      if (isFinished) {
        await tx.attendanceRecord.upsert({
            where: {
                employeeId_date: {
                    employeeId: wfh.employeeId,
                    date: wfh.date
                }
            },
            update: { status: 'WFH' },
            create: {
                employeeId: wfh.employeeId,
                date: wfh.date,
                status: 'WFH'
            }
        });
      }
    });

    // TODO: Replace 'unknown' with authenticated userId once JWT is implemented
    this.auditService.logApprove({
      moduleName: 'WFH',
      entityId: wfhId,
      actorId: 'unknown',
      metadata: { approverId }
    });

    return { message: isFinished ? 'WFH Approved Successfully' : `WFH Approved by ${approverRole}, pending next step.` };
  }

  async rejectWfh(wfhId: string, approverId: string, reason: string): Promise<unknown> {
    const wfh = await this.prisma.workFromHomeRequest.findUnique({ where: { id: wfhId } });
    if (!wfh) throw new NotFoundException('WFH request not found');
    if (wfh.status !== 'PENDING') throw new BadRequestException('WFH is not pending');

    const approver = await this.prisma.employee.findUnique({
      where: { id: approverId },
      include: { department: true, designation: true }
    });
    if (!approver) throw new NotFoundException('Approver not found');

    // Resolve the approver's workflow role from centralized mappings
    const approverRole = resolveWorkflowRole(approver);

    const wfhData = wfh as typeof wfh & { approvalQueue?: unknown, currentStep: number };
    const queue = wfhData.approvalQueue as unknown as ApprovalQueueItem[];
    
    // TODO: Replace with permission-based check once RBAC guards are active
    if ((RbacGroups.APPROVAL_OVERRIDERS as readonly string[]).includes(approverRole)) {
      queue.forEach(q => {
        if (q.status === 'PENDING') {
          q.status = 'REJECTED';
          q.approverId = approverId;
          q.actedAt = new Date();
        }
      });
      await this.prisma.workFromHomeRequest.update({
        where: { id: wfhId },
        data: {
          status: 'REJECTED',
          ...({ approvalQueue: queue as unknown as object, currentStep: queue.length })
        }
      });
      // TODO: Replace 'unknown' with authenticated userId once JWT is implemented
      this.auditService.logReject({
        moduleName: 'WFH',
        entityId: wfhId,
        actorId: 'unknown',
        metadata: { approverId, reason, override: true }
      });

      return { message: 'WFH Rejected Successfully via Override' };
    }

    const currentStepIndex = wfhData.currentStep;
    const currentStep = queue[currentStepIndex];

    if (!currentStep) throw new BadRequestException('Queue is already completed.');
    if (currentStep.role !== approverRole) throw new BadRequestException(`You are not authorized for this step. Waiting for ${currentStep.role}`);

    currentStep.status = 'REJECTED';
    currentStep.approverId = approverId;
    currentStep.actedAt = new Date();

    await this.prisma.workFromHomeRequest.update({
      where: { id: wfhId },
      data: {
        status: 'REJECTED',
        ...({ approvalQueue: queue as unknown as object, currentStep: currentStepIndex + 1 })
      }
    });

    // TODO: Replace 'unknown' with authenticated userId once JWT is implemented
    this.auditService.logReject({
      moduleName: 'WFH',
      entityId: wfhId,
      actorId: 'unknown',
      metadata: { approverId, reason }
    });

    return { message: 'WFH Rejected Successfully' };
  }
}
