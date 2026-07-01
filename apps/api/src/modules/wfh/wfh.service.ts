import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApprovalQueueItem } from '../leaves/leaves.service';

@Injectable()
export class WfhService {
  constructor(private prisma: PrismaService) { }

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

    // 1. Employee limit: Max 1 WFH per month
    const employeeWfhCount = await this.prisma.workFromHomeRequest.count({
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
      for (const pid of projectIds) {
        const projectAssignments = await this.prisma.projectAssignment.findMany({
          where: { projectId: pid },
          select: { employeeId: true }
        });

        const teamMemberIds = projectAssignments.map(pa => pa.employeeId);

        const projectWfhCount = await this.prisma.workFromHomeRequest.count({
          where: {
            employeeId: { in: teamMemberIds },
            status: { in: ['APPROVED', 'PENDING'] },
            date: { gte: startOfMonth, lte: endOfMonth }
          }
        });

        if (projectWfhCount >= 3) {
          throw new BadRequestException('Your project team has already reached the maximum of 3 Work From Home days this month.');
        }
      }
    }

    // Check if WFH or Leave already exists for this date
    const existingWfh = await this.prisma.workFromHomeRequest.findFirst({
        where: { employeeId: employee.id, date: targetDate, status: { not: 'REJECTED' } }
    });
    if (existingWfh) throw new BadRequestException('A WFH request already exists for this date.');

    const approvalQueue = [
      { role: 'TR', status: 'PENDING' },
      { role: 'HR', status: 'PENDING' }
    ];

    return this.prisma.workFromHomeRequest.create({
      data: {
        employeeId: employee.id,
        date: targetDate,
        reason,
        status: 'PENDING',
        approvalQueue: approvalQueue as any,
        currentStep: 0
      }
    });
  }

  async getApprovals(approverId: string): Promise<unknown> {
    const approver = await this.prisma.employee.findUnique({
      where: { id: approverId },
      include: { department: true, designation: true }
    });
    
    if (!approver) throw new NotFoundException('Approver not found');
    
    // Quick role determine
    const deptCode = approver.department?.code || '';
    const designTitle = approver.designation?.title || '';
    const empId = approver.employeeId || '';
    let role = 'EMPLOYEE';
    if (deptCode === 'HR' || empId.includes('/HR/')) role = 'HR';
    else if (deptCode === 'OR' || deptCode === 'OPS' || empId.includes('/OR/')) role = 'OR';
    else if (deptCode === 'AR' || deptCode === 'ADMIN' || empId.includes('/AR/')) role = 'AR';
    else if (designTitle === 'CTO') role = 'CTO';
    else if (designTitle === 'CEO') role = 'CEO';
    else if (designTitle.includes('Lead') || designTitle.includes('Manager') || designTitle === 'TR' || empId.includes('/TR/')) role = 'TR';

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

    const deptCode = approver.department?.code || '';
    const designTitle = approver.designation?.title || '';
    const empId = approver.employeeId || '';
    let approverRole = 'EMPLOYEE';
    if (deptCode === 'HR' || empId.includes('/HR/')) approverRole = 'HR';
    else if (deptCode === 'OR' || deptCode === 'OPS' || empId.includes('/OR/')) approverRole = 'OR';
    else if (deptCode === 'AR' || deptCode === 'ADMIN' || empId.includes('/AR/')) approverRole = 'AR';
    else if (designTitle === 'CTO') approverRole = 'CTO';
    else if (designTitle === 'CEO') approverRole = 'CEO';
    else if (designTitle.includes('Lead') || designTitle.includes('Manager') || designTitle === 'TR' || empId.includes('/TR/')) approverRole = 'TR';

    const wfhData = wfh as typeof wfh & { approvalQueue?: unknown, currentStep: number };
    const queue = wfhData.approvalQueue as unknown as ApprovalQueueItem[];
    
    // OR override logic
    if (approverRole === 'OR' || approverRole === 'CEO') {
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

    const deptCode = approver.department?.code || '';
    const designTitle = approver.designation?.title || '';
    const empId = approver.employeeId || '';
    let approverRole = 'EMPLOYEE';
    if (deptCode === 'HR' || empId.includes('/HR/')) approverRole = 'HR';
    else if (deptCode === 'OR' || deptCode === 'OPS' || empId.includes('/OR/')) approverRole = 'OR';
    else if (deptCode === 'AR' || deptCode === 'ADMIN' || empId.includes('/AR/')) approverRole = 'AR';
    else if (designTitle === 'CTO') approverRole = 'CTO';
    else if (designTitle === 'CEO') approverRole = 'CEO';
    else if (designTitle.includes('Lead') || designTitle.includes('Manager') || designTitle === 'TR' || empId.includes('/TR/')) approverRole = 'TR';

    const wfhData = wfh as typeof wfh & { approvalQueue?: unknown, currentStep: number };
    const queue = wfhData.approvalQueue as unknown as ApprovalQueueItem[];
    
    if (approverRole === 'OR' || approverRole === 'CEO') {
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

    return { message: 'WFH Rejected Successfully' };
  }
}
