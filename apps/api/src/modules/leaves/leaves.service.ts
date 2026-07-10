import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApplyLeaveDto } from './dto/apply-leave.dto';
import { WorkflowEngineService } from '../workflows/workflow-engine.service';

export interface ApprovalQueueItem {
  role: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approverId?: string;
  actedAt?: Date;
}

@Injectable()
export class LeavesService {
  private readonly logger = new Logger(LeavesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowEngine: WorkflowEngineService
  ) {}

  async getLeavesKPI(employeeId: string): Promise<unknown> {
    const currentYear = new Date().getFullYear();
    const balances = await this.prisma.leaveBalance.findMany({
      where: { employeeId, year: currentYear },
      include: { leaveType: true }
    });

    let totalAllocated = 0;
    let totalUsed = 0;
    let totalPending = 0;

    balances.forEach(b => {
      totalAllocated += Number(b.allocated) + Number(b.carriedOver);
      totalUsed += Number(b.used);
      totalPending += Number(b.pending);
    });

    return {
      totalLeaves: totalAllocated,
      usedLeaves: totalUsed,
      pendingLeaves: totalPending,
      availableLeaves: totalAllocated - totalUsed - totalPending,
      details: balances
    };
  }

  async getApprovals(approverId: string): Promise<unknown> {
    const approver = await this.prisma.employee.findUnique({
      where: { id: approverId },
      include: { department: true, designation: true }
    });
    
    if (!approver) throw new NotFoundException('Approver not found');
    
    const role = this.getRoleForEmployee(approver);
    
    const requests = await this.prisma.leaveRequest.findMany({
      where: { status: 'PENDING' },
      include: { employee: true, leaveType: true }
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

  private getRoleForEmployee(employee: { department?: { code?: string } | null, designation?: { title?: string } | null, employeeId?: string }): string {
    const deptCode = employee.department?.code || '';
    const designTitle = employee.designation?.title || '';
    const empId = employee.employeeId || '';
    
    if (deptCode === 'HR' || empId.includes('/HR/')) return 'HR';
    if (deptCode === 'OR' || deptCode === 'OPS' || empId.includes('/OR/')) return 'OR';
    if (deptCode === 'AR' || deptCode === 'ADMIN' || empId.includes('/AR/')) return 'AR';
    if (designTitle === 'CTO') return 'CTO';
    if (designTitle === 'CEO') return 'CEO';
    if (designTitle.includes('Lead') || designTitle.includes('Manager') || designTitle === 'TR' || empId.includes('/TR/')) return 'TR';
    
    return 'EMPLOYEE';
  }

  private determineQueue(employee: { department?: { code?: string } | null, designation?: { title?: string } | null, employeeId?: string }): ApprovalQueueItem[] {
    const role = this.getRoleForEmployee(employee);
    let queueRoles: string[] = [];

    switch(role) {
      case 'EMPLOYEE':
        queueRoles = ['TR', 'HR', 'OR'];
        break;
      case 'TR':
        queueRoles = ['TR', 'HR', 'OR'];
        break;
      case 'HR':
        queueRoles = ['HR', 'OR'];
        break;
      case 'OR':
        queueRoles = ['OR', 'AR'];
        break;
      case 'CTO':
        queueRoles = ['CEO'];
        break;
      default:
        queueRoles = ['TR', 'HR', 'OR'];
    }

    return queueRoles.map(r => ({
      role: r,
      status: 'PENDING'
    }));
  }

  async applyLeave(data: ApplyLeaveDto): Promise<unknown> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: data.employeeId },
      include: { department: true, designation: true }
    });

    if (!employee) throw new NotFoundException('Employee not found');

    const leaveType = await this.prisma.leaveType.findUnique({
      where: { code: data.leaveTypeId }
    });

    if (!leaveType) throw new NotFoundException('Leave type not found');

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    let totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1;
    
    if (data.isHalfDay) {
        if (totalDays > 1) throw new BadRequestException('Half day leave can only be applied for a single date');
        totalDays = 0.5;
    }
    
    if (totalDays > 2 && !data.attachmentUrl) {
        throw new BadRequestException('Continuous leaves for more than 2 days require an attachment/document.');
    }

    if (leaveType.code === 'MATERNITY') {
        if (employee.gender !== 'FEMALE' || employee.maritalStatus !== 'MARRIED') {
            throw new BadRequestException('Maternity leave is only applicable for married female employees.');
        }
    }

    const noticeHours = (startDate.getTime() - Date.now()) / (1000 * 60 * 60);
    let isEmergency = false;
    
    if (leaveType.code.startsWith('CL') && noticeHours < 24) {
        isEmergency = true;
    } else if (leaveType.code === 'OPTIONAL' && noticeHours < (7 * 24)) {
        throw new BadRequestException('Optional holidays require at least 7 days prior notice.');
    }

    const currentYear = startDate.getFullYear();

    const balance = await this.prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId: employee.id,
          leaveTypeId: leaveType.id,
          year: currentYear
        }
      }
    });

    if (!balance) {
      throw new BadRequestException('No leave balance allocated for this type for the current year');
    }

    const available = Number(balance.allocated) + Number(balance.carriedOver) - Number(balance.used) - Number(balance.pending);
    if (available < totalDays) {
      throw new BadRequestException(`Insufficient leave balance. You have ${available} days available.`);
    }

    let approvalQueue = this.determineQueue(employee);
    if (isEmergency) {
        approvalQueue = [
            { role: 'CTO', status: 'PENDING' },
            { role: 'CEO', status: 'PENDING' }
        ];
    }

    const leave = await this.prisma.$transaction(async (tx) => {
      const newLeave = await tx.leaveRequest.create({
        data: {
          employeeId: employee.id,
          leaveTypeId: leaveType.id,
          startDate,
          endDate,
          reason: data.reason,
          totalDays,
          status: 'PENDING',
          attachmentUrl: data.attachmentUrl,
          isHalfDay: data.isHalfDay || false,
          isEmergency,
          ...({ approvalQueue: approvalQueue as unknown as object, currentStep: 0 })
        }
      });

      await tx.leaveBalance.update({
        where: { id: balance.id },
        data: { pending: { increment: totalDays } }
      });

      return newLeave;
    });

    try {
      await this.workflowEngine.startWorkflow('LEAVE', leave.id, employee.id, {
        leaveTypeId: leaveType.id,
        totalDays,
        isEmergency
      });
    } catch (err) {
      this.logger.warn(`Workflow Engine failed to start for Leave ${leave.id}. Fallback to traditional queue. Error: ${(err as Error).message}`);
    }

    return { message: 'Leave Applied Successfully', data: leave };
  }

  async approveLeave(leaveId: string, approverId: string): Promise<unknown> {
    const leave = await this.prisma.leaveRequest.findUnique({ where: { id: leaveId } });
    if (!leave) throw new NotFoundException('Leave not found');
    if (leave.status !== 'PENDING') throw new BadRequestException('Leave is not pending');

    const approver = await this.prisma.employee.findUnique({
      where: { id: approverId },
      include: { department: true, designation: true }
    });
    if (!approver) throw new NotFoundException('Approver not found');

    const approverRole = this.getRoleForEmployee(approver);
    const leaveData = leave as typeof leave & { approvalQueue?: unknown, currentStep: number };
    const queue = leaveData.approvalQueue as unknown as ApprovalQueueItem[];
    
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
        await tx.leaveRequest.update({
          where: { id: leaveId },
          data: {
            status: 'APPROVED',
            approvedAt: new Date(),
            approverId,
            ...({ approvalQueue: queue as unknown as object, currentStep: queue.length })
          }
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
      
      return { message: 'Leave Approved Successfully via Override' };
    }

    const currentStepIndex = leaveData.currentStep;
    const currentStep = queue[currentStepIndex];

    if (!currentStep) {
        throw new BadRequestException('Queue is already completed.');
    }

    if (currentStep.role !== approverRole) {
      throw new BadRequestException(`You are not authorized for this step. Waiting for ${currentStep.role}`);
    }

    currentStep.status = 'APPROVED';
    currentStep.approverId = approverId;
    currentStep.actedAt = new Date();

    const nextStepIndex = currentStepIndex + 1;
    const isFinished = nextStepIndex >= queue.length;

    await this.prisma.$transaction(async (tx) => {
      await tx.leaveRequest.update({
        where: { id: leaveId },
        data: {
          status: isFinished ? 'APPROVED' : 'PENDING',
          approvedAt: isFinished ? new Date() : null,
          approverId: isFinished ? approverId : null,
          ...({ approvalQueue: queue as unknown as object, currentStep: nextStepIndex })
        }
      });

      if (isFinished) {
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
      }
    });

    return { message: isFinished ? 'Leave Approved Successfully' : `Leave Approved by ${approverRole}, pending next step.` };
  }

  async rejectLeave(leaveId: string, approverId: string, reason: string): Promise<unknown> {
    const leave = await this.prisma.leaveRequest.findUnique({ where: { id: leaveId } });
    if (!leave) throw new NotFoundException('Leave not found');
    if (leave.status !== 'PENDING') throw new BadRequestException('Leave is not pending');

    const approver = await this.prisma.employee.findUnique({
      where: { id: approverId },
      include: { department: true, designation: true }
    });
    if (!approver) throw new NotFoundException('Approver not found');

    const approverRole = this.getRoleForEmployee(approver);
    const leaveData = leave as typeof leave & { approvalQueue?: unknown, currentStep: number };
    const queue = leaveData.approvalQueue as unknown as ApprovalQueueItem[];
    
    // OR override logic for rejection
    if (approverRole === 'OR' || approverRole === 'CEO') {
      queue.forEach(q => {
        if (q.status === 'PENDING') {
          q.status = 'REJECTED';
          q.approverId = approverId;
          q.actedAt = new Date();
        }
      });
      
      await this.prisma.$transaction(async (tx) => {
        await tx.leaveRequest.update({
          where: { id: leaveId },
          data: {
            status: 'REJECTED',
            rejectionReason: reason,
            ...({ approvalQueue: queue as unknown as object, currentStep: queue.length })
          }
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
            data: { pending: { decrement: leave.totalDays } }
          });
        }
      });
      
      return { message: 'Leave Rejected Successfully via Override' };
    }

    const currentStepIndex = leaveData.currentStep;
    const currentStep = queue[currentStepIndex];

    if (!currentStep) {
        throw new BadRequestException('Queue is already completed.');
    }

    if (currentStep.role !== approverRole) {
      throw new BadRequestException(`You are not authorized for this step. Waiting for ${currentStep.role}`);
    }

    currentStep.status = 'REJECTED';
    currentStep.approverId = approverId;
    currentStep.actedAt = new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.leaveRequest.update({
        where: { id: leaveId },
        data: {
          status: 'REJECTED',
          rejectionReason: reason,
          ...({ approvalQueue: queue as unknown as object, currentStep: currentStepIndex + 1 })
        }
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
          data: { pending: { decrement: leave.totalDays } }
        });
      }
    });

    return { message: 'Leave Rejected Successfully' };
  }

  async accrueMonthlyLeaves(): Promise<unknown> {
    const currentYear = new Date().getFullYear();
    const employees = await this.prisma.employee.findMany({
      where: { exitDate: null }
    });

    const leaveTypes = await this.prisma.leaveType.findMany({
      where: { isActive: true }
    });

    let accruedCount = 0;

    for (const emp of employees) {
      for (const lt of leaveTypes) {
        if (lt.code === 'CL_FULL') {
          await this.prisma.leaveBalance.upsert({
            where: {
              employeeId_leaveTypeId_year: {
                employeeId: emp.id,
                leaveTypeId: lt.id,
                year: currentYear
              }
            },
            update: {
              allocated: { increment: 1 }
            },
            create: {
              employeeId: emp.id,
              leaveTypeId: lt.id,
              year: currentYear,
              allocated: 1,
              carriedOver: 0,
              pending: 0,
              used: 0
            }
          });
          accruedCount++;
        } else if (lt.code === 'CL_HALF') {
          await this.prisma.leaveBalance.upsert({
            where: {
              employeeId_leaveTypeId_year: {
                employeeId: emp.id,
                leaveTypeId: lt.id,
                year: currentYear
              }
            },
            update: {
              allocated: 0.5,
              carriedOver: 0
            },
            create: {
              employeeId: emp.id,
              leaveTypeId: lt.id,
              year: currentYear,
              allocated: 0.5,
              carriedOver: 0,
              pending: 0,
              used: 0
            }
          });
          accruedCount++;
        }
      }
    }

    return { message: `Monthly leave accrued successfully for ${accruedCount} balances.` };
  }

  async getCalendar(): Promise<unknown> {
    return this.prisma.leaveRequest.findMany({
      where: { status: 'APPROVED' },
      include: { 
        employee: { include: { department: true } }, 
        leaveType: true 
      }
    });
  }

  async getCtoLeaves(): Promise<unknown> {
    const leaveRequests = await this.prisma.leaveRequest.findMany({
      include: {
        employee: { include: { department: true, designation: true } },
        leaveType: true
      },
      orderBy: { appliedAt: 'desc' }
    });

    return leaveRequests.map(r => ({
      id: r.id,
      employeeName: `${r.employee.firstName} ${r.employee.lastName}`,
      employeeInitials: `${r.employee.firstName.charAt(0)}${r.employee.lastName.charAt(0)}`,
      employeeRole: r.employee.designation?.title || 'Engineer',
      department: r.employee.department?.name || 'Engineering',
      type: r.leaveType.name,
      dateRange: `${r.startDate.toISOString().split('T')[0]} - ${r.endDate.toISOString().split('T')[0]}`,
      days: Number(r.totalDays),
      reason: r.reason,
      status: r.status,
      balanceAfterApproval: 12 // mock balance
    }));
  }
}
