import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApplyLeaveDto } from './dto/apply-leave.dto';
import { WorkflowEngineService } from '../workflows/workflow-engine.service';
import { AuditService } from '../audit/audit.service';

import { NotificationsService } from '../notifications/notifications.service';

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
    private readonly workflowEngine: WorkflowEngineService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService
  ) { }

  async getLeavesKPI(employeeId: string): Promise<unknown> {
    const currentYear = new Date().getFullYear();
    const balances = await this.prisma.leaveBalance.findMany({
      where: { employeeId, year: currentYear },
      include: { leaveType: true }
    });

    let yearlyTotal = 0;
    let accruedTotal = 0;
    let totalUsed = 0;
    let totalPending = 0;

    const currentMonth = new Date().getMonth();
    const policyMonth = currentMonth >= 5 ? currentMonth - 5 + 1 : currentMonth + 7 + 1; // Policy year starts in June

    const adjustedBalances = balances.map(b => {
      let actualAllocated = Number(b.allocated);

      if (b.leaveType.code === 'CL_FULL') {
        actualAllocated = Math.min(Number(b.allocated), policyMonth);
      } else if (b.leaveType.code === 'CL_HALF') {
        // Half days do not carry forward. Limit is always past used + 0.5 for the current month
        actualAllocated = Number(b.used) + 0.5;
      }

      return {
        ...b,
        yearlyAllocated: Number(b.allocated), // Pass the original yearly allocation limit down
        allocated: actualAllocated,
        carriedOver: Number(b.carriedOver),
        used: Number(b.used),
        pending: Number(b.pending)
      };
    });

    adjustedBalances.forEach(b => {
      if (['CL_FULL', 'CL_HALF', 'OPTIONAL'].includes(b.leaveType.code)) {
        yearlyTotal += b.yearlyAllocated;
      }

      // Accrued, used, and pending must aggregate all available leave types to hit 4.5
      accruedTotal += b.allocated + b.carriedOver;
      totalUsed += b.used;
      totalPending += b.pending;
    });

    return {
      totalLeaves: yearlyTotal,
      accruedLeaves: accruedTotal,
      usedLeaves: totalUsed,
      pendingLeaves: totalPending,
      availableLeaves: Math.max(0, accruedTotal - totalUsed),
      details: adjustedBalances
    };
  }

  async getApprovals(approverId: string): Promise<unknown> {
    const approver = await this.prisma.employee.findUnique({
      where: { id: approverId },
      include: { department: true, designation: true, user: true }
    });

    if (!approver) throw new NotFoundException('Approver not found');

    const role = this.getRoleForEmployee(approver);

    const requests = await this.prisma.leaveRequest.findMany({
      where: {
        status: { in: ['PENDING', 'APPROVED', 'REJECTED'] },
        OR: [
          {
            approvalQueue: {
              path: ['$[*].approverId'],
              array_contains: approverId
            }
          },
          {
            approvalQueue: {
              path: ['$[*].role'],
              array_contains: role
            }
          }
        ]
      },
      include: { employee: true, leaveType: true }
    });

    return requests.filter(req => {
      const reqData = req as typeof req & { approvalQueue?: unknown, currentStep: number };
      if (!reqData.approvalQueue) return false;
      const queue = reqData.approvalQueue as unknown as any[];

      const currentStep = queue[reqData.currentStep];
      let isCurrentPending = false;
      if (currentStep && currentStep.status === 'PENDING') {
        if (currentStep.approverId) {
          isCurrentPending = currentStep.approverId === approverId;
        } else {
          isCurrentPending = currentStep.role === role;
        }
      }

      const hasActed = queue.some(step => {
        if (step.status === 'APPROVED' || step.status === 'REJECTED') {
          if (step.approverId) {
            return step.approverId === approverId;
          }
          return step.role === role;
        }
        return false;
      });

      return isCurrentPending || hasActed;
    }).map(req => {
      const reqData = req as typeof req & { approvalQueue?: unknown, currentStep: number };
      const queue = reqData.approvalQueue as unknown as any[];
      const currentStep = queue[reqData.currentStep];

      let isCurrentPending = false;
      if (currentStep && currentStep.status === 'PENDING') {
        if (currentStep.approverId) {
          isCurrentPending = currentStep.approverId === approverId;
        } else {
          isCurrentPending = currentStep.role === role;
        }
      }

      // Determine what action this user took
      let myAction = null;
      const myStep = queue.find(step => {
        if (step.approverId) return step.approverId === approverId;
        return step.role === role;
      });
      if (myStep && myStep.status !== 'PENDING') {
        myAction = myStep.status;
      }

      return {
        ...req,
        isPendingForMe: isCurrentPending,
        myAction
      };
    });
  }

  private getRoleForEmployee(employee: any): string {
    if (employee.user?.role) {
      if (['CEO', 'CTO'].includes(employee.user.role)) {
        return employee.user.role;
      }
    }
    const designTitle = employee.designation?.title || '';
    if (['TR', 'TS', 'TL', 'QA', 'QE', 'HRE', 'CTO', 'CEO'].includes(designTitle)) return designTitle;

    const deptCode = employee.department?.code || '';
    if (deptCode === 'HR') return 'HRE';

    return 'EMPLOYEE';
  }

  /**
   * Helper to fetch a leave balance for a given request within a transaction.
   */
  private async getLeaveBalance(tx: any, leave: { employeeId: string; leaveTypeId: string; startDate: Date }) {
    const currentYear = new Date(leave.startDate).getFullYear();
    return tx.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId: leave.employeeId,
          leaveTypeId: leave.leaveTypeId,
          year: currentYear
        }
      }
    });
  }

  private async determineQueue(employee: any, isEmergency: boolean): Promise<ApprovalQueueItem[]> {
    let queue: ApprovalQueueItem[] = [];
    const role = this.getRoleForEmployee(employee);
    const policy = await this.prisma.orgPolicy.findFirst();

    // 1. Fetch from ApprovalMatrix
    const matrix = await this.prisma.approvalMatrix.findMany({
      where: { requesterRoleId: role, isEmergency },
      orderBy: { stepOrder: 'asc' }
    });

    if (matrix.length > 0) {
      for (const step of matrix) {
        let approverId = undefined;
        if (step.approverRoleId === 'TL') {
          const projectAssignment = await this.prisma.projectAssignment.findFirst({
            where: { employeeId: employee.id, releasedAt: null },
            include: { project: { include: { assignments: { where: { projectRole: 'TL', releasedAt: null } } } } }
          });
          if (projectAssignment && projectAssignment.project.assignments.length > 0) {
            approverId = projectAssignment.project.assignments[0].employeeId;
          }
        } else if (step.approverRoleId === 'MANAGER') {
          approverId = employee.reportingManagerId;
        } else if (step.approverRoleId === 'HRE') {
          approverId = employee.assignedHrId || undefined;
        }

        if (step.approverRoleId === 'CEO' && policy?.ceoLeaveApprovalScope === 'EMERGENCY_ONLY' && !isEmergency) {
          continue; // Skip adding CEO
        }

        queue.push({ role: step.approverRoleId, status: 'PENDING', approverId });
      }
    } else {
      // Fallback
      if (role === 'CTO') {
        queue.push({ role: 'CEO', status: 'PENDING' });
      } else if (role !== 'CEO') {
        const projectAssignment = await this.prisma.projectAssignment.findFirst({
          where: { employeeId: employee.id, releasedAt: null },
          include: { project: { include: { assignments: { where: { projectRole: 'TL', releasedAt: null } } } } }
        });

        let teamLeadId = undefined;
        if (projectAssignment && projectAssignment.project.assignments.length > 0) {
          teamLeadId = projectAssignment.project.assignments[0].employeeId;
        }

        if (teamLeadId && teamLeadId !== employee.id) {
          queue.push({ role: 'TL', status: 'PENDING', approverId: teamLeadId });
        } else if (employee.reportingManagerId) {
          queue.push({ role: 'MANAGER', status: 'PENDING', approverId: employee.reportingManagerId });
        }

        queue.push({ role: 'HRE', status: 'PENDING', approverId: employee.assignedHrId || undefined });
      }

      // Apply CEO Scope filter on the fallback queue
      queue = queue.filter(q => !(q.role === 'CEO' && policy?.ceoLeaveApprovalScope === 'EMERGENCY_ONLY' && !isEmergency));
    }

    // CYCLE DETECTION: Ensure no duplicate approver roles or IDs
    const uniqueQueue: ApprovalQueueItem[] = [];
    const seenRoles = new Set<string>();
    const seenIds = new Set<string>();

    for (const q of queue) {
      if (seenRoles.has(q.role)) continue;
      if (q.approverId && seenIds.has(q.approverId)) continue;
      if (q.approverId === employee.id) continue;

      seenRoles.add(q.role);
      if (q.approverId) seenIds.add(q.approverId);
      uniqueQueue.push(q);
    }

    return uniqueQueue.filter(q => q.approverId || ['HRE', 'CEO', 'CTO'].includes(q.role));
  }

  async getMyLeaves(employeeId: string): Promise<unknown> {
    if (!employeeId) throw new BadRequestException('Employee ID is required');
    const requests = await this.prisma.leaveRequest.findMany({
      where: { employeeId },
      include: { leaveType: true },
      orderBy: { appliedAt: 'desc' }
    });
    return requests;
  }

  async applyLeave(data: ApplyLeaveDto & { employeeId: string }): Promise<unknown> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: data.employeeId },
      include: { department: true, designation: true, user: true }
    });

    if (!employee) throw new NotFoundException('Employee not found');

    const leaveTypes = await this.prisma.leaveType.findMany({
      where: { code: { in: data.leaveTypeIds } }
    });

    if (!leaveTypes.length) throw new NotFoundException('Leave types not found');

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const isSickLeave = leaveTypes.some(lt => ['SL', 'SICK'].includes(lt.code));
    if (isSickLeave && durationDays > 3 && (!data.attachmentUrl || data.attachmentUrl.trim() === '')) {
      throw new BadRequestException('A medical certificate (attachment) is required for sick leave exceeding 3 consecutive days.');
    }

    // 1. Backdated Check (3 days max grace period)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const graceDate = new Date(today);
    graceDate.setDate(graceDate.getDate() - 3);

    if (startDate < graceDate) {
      throw new BadRequestException('Backdated leave requests beyond 3 days are not allowed. Please contact HR.');
    }

    // 2. Overlap Check
    const overlaps = await this.prisma.leaveRequest.findFirst({
      where: {
        employeeId: data.employeeId,
        status: { notIn: ['REJECTED', 'CANCELLED'] },
        startDate: { lte: endDate },
        endDate: { gte: startDate }
      }
    });

    if (overlaps) {
      throw new BadRequestException('You already have a pending or approved leave during this date range.');
    }

    // 3. Smart Total Days Calculation
    let totalWorkingDays = 0;

    const holidays = await this.prisma.companyHoliday.findMany({
      where: { date: { gte: startDate, lte: endDate } }
    });
    const holidayDates = holidays.map((h: any) => h.date.toISOString().split('T')[0]);

    for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
      const dayOfWeek = d.getUTCDay();
      const dateStr = d.toISOString().split('T')[0];

      // Skip Sundays (0), Saturdays (6), and Holidays
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDates.includes(dateStr)) {
        totalWorkingDays++;
      }
    }

    if (totalWorkingDays === 0) {
      throw new BadRequestException('The selected date range contains only non-working days (weekends or holidays).');
    }

    const hasHalfDay = leaveTypes.some(lt => lt.code === 'CL_HALF');
    const hasFullDay = leaveTypes.some(lt => lt.code !== 'CL_HALF');

    if (hasHalfDay && !hasFullDay && totalWorkingDays > 1) {
      throw new BadRequestException('Half day leave can only be applied for a single date');
    }

    const currentYear = startDate.getFullYear();
    const createdLeaves = [];

    for (const leaveType of leaveTypes) {
      if (leaveType.code === 'MATERNITY') {
        if (employee.gender !== 'FEMALE') {
          throw new BadRequestException('Maternity leave is only applicable for female employees.');
        }
      }

      const noticeHours = (startDate.getTime() - Date.now()) / (1000 * 60 * 60);
      let isEmergency = false;

      if (leaveType.code.startsWith('CL') && noticeHours < 24) {
        isEmergency = true;
      } else if (leaveType.code === 'OPTIONAL' && noticeHours < (7 * 24)) {
        throw new BadRequestException('Optional holidays require at least 7 days prior notice.');
      }

      if (leaveType.requiresDocumentAbove && totalWorkingDays > Number(leaveType.requiresDocumentAbove) && !data.attachmentUrl) {
        throw new BadRequestException(`${leaveType.name} requests exceeding ${leaveType.requiresDocumentAbove} consecutive days require a medical proof document.`);
      }

      let approvalQueue = await this.determineQueue(employee, isEmergency);

      let daysForThisType = totalWorkingDays;
      if (hasHalfDay) {
        if (leaveType.code === 'CL_HALF') {
          daysForThisType = 0.5;
        } else {
          daysForThisType = totalWorkingDays - 0.5;
        }
      }

      if (daysForThisType <= 0) continue;

      const leave = await this.prisma.$transaction(async (tx) => {
        let balance = await tx.leaveBalance.findUnique({
          where: {
            employeeId_leaveTypeId_year: {
              employeeId: employee.id,
              leaveTypeId: leaveType.id,
              year: currentYear
            }
          }
        });

        if (!balance) {
          balance = await tx.leaveBalance.create({
            data: {
              employeeId: employee.id,
              leaveTypeId: leaveType.id,
              year: currentYear,
              allocated: 0,
              carriedOver: 0,
              pending: 0,
              used: 0
            }
          });
        }

        let paidDays = 0;
        let unpaidDays = 0;

        let available = 0;
        if (leaveType.code === 'CL_FULL') {
          const currentMonth = startDate.getMonth();
          const policyMonth = currentMonth >= 5 ? currentMonth - 5 + 1 : currentMonth + 7 + 1;
          const accruedLimit = Math.min(Number(balance.allocated), policyMonth);
          available = Math.max(0, accruedLimit + Number(balance.carriedOver) - Number(balance.used) - Number(balance.pending));
        } else if (leaveType.code === 'CL_HALF') {
          available = 0.5; // Strictly max 1 half-day per month. Reset every month.
        } else {
          available = Math.max(0, Number(balance.allocated) + Number(balance.carriedOver) - Number(balance.used) - Number(balance.pending));
        }

        if (leaveType.code === 'CL_FULL' || leaveType.code === 'CL_HALF') {
          const applicablePaidDays = Math.min(daysForThisType, available);

          const startOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
          const endOfMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

          const monthlyLeaves = await tx.leaveRequest.aggregate({
            where: {
              employeeId: employee.id,
              leaveTypeId: leaveType.id,
              status: { notIn: ['REJECTED', 'CANCELLED'] },
              startDate: { gte: startOfMonth, lte: endOfMonth }
            },
            _sum: { paidDays: true }
          });

          const alreadyPaidThisMonth = Number(monthlyLeaves._sum.paidDays || 0);
          const maxPaidAllowedThisMonth = (leaveType as any).maxPaidPerMonth ? Number((leaveType as any).maxPaidPerMonth) : 3;
          const remainingPaidAllowedThisMonth = Math.max(0, maxPaidAllowedThisMonth - alreadyPaidThisMonth);

          paidDays = Math.min(applicablePaidDays, remainingPaidAllowedThisMonth);
          unpaidDays = daysForThisType - paidDays;
        } else {
          if (available < daysForThisType) {
            throw new BadRequestException(`Insufficient leave balance for ${leaveType.name}. You have ${available} days available.`);
          }
          paidDays = daysForThisType;
          unpaidDays = 0;
        }

        let reqStartDate = new Date(startDate);
        let reqEndDate = new Date(endDate);
        let isReqHalfDay = false;

        if (hasHalfDay && hasFullDay) {
          if (leaveType.code === 'CL_HALF') {
            if (data.halfDaySession === 'LAST_DAY') {
              reqStartDate = new Date(endDate);
            } else {
              reqEndDate = new Date(startDate);
            }
            isReqHalfDay = true;
          } else {
            if (data.halfDaySession === 'LAST_DAY') {
              reqEndDate.setDate(reqEndDate.getDate() - 1);
            } else {
              reqStartDate.setDate(reqStartDate.getDate() + 1);
            }
          }
        } else if (leaveType.code === 'CL_HALF') {
          isReqHalfDay = true;
        }

        const newLeave = await tx.leaveRequest.create({
          data: {
            employeeId: employee.id,
            leaveTypeId: leaveType.id,
            startDate: reqStartDate,
            endDate: reqEndDate,
            reason: data.reason,
            totalDays: daysForThisType,
            paidDays,
            unpaidDays,
            status: 'PENDING',
            attachmentUrl: data.attachmentUrl,
            isHalfDay: isReqHalfDay,
            isEmergency,
            ...({ approvalQueue: approvalQueue as unknown as object, currentStep: 0 })
          }
        });

        await tx.leaveBalance.update({
          where: { id: balance.id },
          data: { pending: { increment: paidDays } }
        });

        return newLeave;
      });

      createdLeaves.push(leave);

      this.auditService.logCreate({
        moduleName: 'Leaves',
        entityId: leave.id,
        actorId: data.employeeId,
        metadata: { leaveTypeId: leaveType.id, startDate: leave.startDate, endDate: leave.endDate }
      });

      const queue = approvalQueue as unknown as ApprovalQueueItem[];
      if (queue.length > 0) {
        const firstStep = queue[0];
        if (firstStep.approverId) {
          await this.notificationsService.createNotification(
            firstStep.approverId,
            'New Leave Request',
            `${employee.firstName} ${employee.lastName} has applied for leave.`,
            'LEAVE_STATUS',
            leave.id
          );
        } else {
          await this.notificationsService.notifyRole(
            firstStep.role,
            'New Leave Request',
            `${employee.firstName} ${employee.lastName} has applied for leave.`,
            'LEAVE_STATUS',
            leave.id
          );
        }
      }

      try {
        await this.workflowEngine.startWorkflow('LEAVE', leave.id, employee.id, {
          leaveTypeId: leaveType.id,
          totalDays: daysForThisType,
          isEmergency
        });
      } catch (err) {
        this.logger.warn(`Workflow Engine failed to start for Leave ${leave.id}. Fallback to traditional queue. Error: ${(err as Error).message}`);
      }
    }

    return { message: 'Leave Applied Successfully', data: createdLeaves.length > 1 ? createdLeaves : createdLeaves[0] };
  }

  async calculateLeave(data: ApplyLeaveDto & { employeeId: string }): Promise<unknown> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: data.employeeId }
    });

    if (!employee) throw new NotFoundException('Employee not found');

    const leaveTypes = await this.prisma.leaveType.findMany({
      where: { code: { in: data.leaveTypeIds } }
    });

    if (!leaveTypes.length) throw new NotFoundException('Leave types not found');

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    let totalWorkingDays = 0;

    const holidays = await this.prisma.companyHoliday.findMany({
      where: { date: { gte: startDate, lte: endDate } }
    });
    const holidayDates = holidays.map((h: any) => h.date.toISOString().split('T')[0]);

    for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
      const dayOfWeek = d.getUTCDay();
      const dateStr = d.toISOString().split('T')[0];
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDates.includes(dateStr)) {
        totalWorkingDays++;
      }
    }

    if (totalWorkingDays === 0) {
      return { totalDays: 0, paidDays: 0, unpaidDays: 0, deductionAmount: 0 };
    }

    const hasHalfDay = leaveTypes.some(lt => lt.code === 'CL_HALF');
    const hasFullDay = leaveTypes.some(lt => lt.code !== 'CL_HALF');

    let totalPaid = 0;
    let totalUnpaid = 0;
    let totalDeduction = 0;

    const currentYear = startDate.getFullYear();

    for (const leaveType of leaveTypes) {
      let daysForThisType = totalWorkingDays;
      if (hasHalfDay) {
        if (leaveType.code === 'CL_HALF') {
          daysForThisType = 0.5;
        } else {
          daysForThisType = totalWorkingDays - 0.5;
        }
      }

      if (daysForThisType <= 0) continue;

      let balance = await this.prisma.leaveBalance.findUnique({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: employee.id,
            leaveTypeId: leaveType.id,
            year: currentYear
          }
        }
      });

      let paidDays = 0;
      let unpaidDays = 0;

      let available = 0;
      if (balance) {
        if (leaveType.code === 'CL_FULL') {
          const currentMonth = startDate.getMonth();
          const policyMonth = currentMonth >= 5 ? currentMonth - 5 + 1 : currentMonth + 7 + 1;
          const accruedLimit = Math.min(Number(balance.allocated), policyMonth);
          available = Math.max(0, accruedLimit + Number(balance.carriedOver) - Number(balance.used) - Number(balance.pending));
        } else if (leaveType.code === 'CL_HALF') {
          available = 0.5; // Strictly max 1 half-day per month. Reset every month.
        } else {
          available = Math.max(0, Number(balance.allocated) + Number(balance.carriedOver) - Number(balance.used) - Number(balance.pending));
        }
      }

      if (leaveType.code === 'CL_FULL' || leaveType.code === 'CL_HALF') {
        const applicablePaidDays = Math.min(daysForThisType, available);

        const startOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const endOfMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

        const monthlyLeaves = await this.prisma.leaveRequest.aggregate({
          where: {
            employeeId: employee.id,
            leaveTypeId: leaveType.id,
            status: { notIn: ['REJECTED', 'CANCELLED'] },
            startDate: { gte: startOfMonth, lte: endOfMonth }
          },
          _sum: { paidDays: true }
        });

        const alreadyPaidThisMonth = Number(monthlyLeaves._sum.paidDays || 0);
        const maxPaidAllowedThisMonth = (leaveType as any).maxPaidPerMonth ? Number((leaveType as any).maxPaidPerMonth) : 3;
        const remainingPaidAllowedThisMonth = Math.max(0, maxPaidAllowedThisMonth - alreadyPaidThisMonth);

        paidDays = Math.min(applicablePaidDays, remainingPaidAllowedThisMonth);
        unpaidDays = daysForThisType - paidDays;
      } else {
        paidDays = available >= daysForThisType ? daysForThisType : available;
        unpaidDays = daysForThisType - paidDays;
      }

      totalPaid += paidDays;
      totalUnpaid += unpaidDays;

      if (unpaidDays > 0) {
        const salaryStruct = await this.prisma.salaryStructure.findFirst({
          where: { employeeId: employee.id },
          orderBy: { effectiveFrom: 'desc' }
        });

        if (salaryStruct) {
          const monthlyGross = Number(salaryStruct.basicSalary) + Number(salaryStruct.hra) + Number(salaryStruct.specialAllowance);
          const perDayRate = monthlyGross / 30; // standard 30 days calculation
          totalDeduction += Number((perDayRate * unpaidDays).toFixed(2));
        }
      }
    }

    return { totalDays: totalPaid + totalUnpaid, paidDays: totalPaid, unpaidDays: totalUnpaid, deductionAmount: totalDeduction };
  }

  async approveLeave(leaveId: string, approverId: string): Promise<unknown> {
    const { withRetry } = await import('../../common/utils/retry.util');
    return withRetry(async () => {
      const leave = await this.prisma.leaveRequest.findUnique({ where: { id: leaveId }, include: { employee: true } });
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
      if (approverRole === 'CEO') {
        queue.forEach(q => {
          if (q.status === 'PENDING') {
            q.status = 'APPROVED';
            q.approverId = approverId;
            q.actedAt = new Date();
          }
        });

        await this.prisma.$transaction(async (tx) => {
          const updateResult = await tx.leaveRequest.updateMany({
            where: { id: leaveId, status: 'PENDING' },
            data: {
              status: 'APPROVED',
              approvedAt: new Date(),
              approverId,
              ...({ approvalQueue: queue as unknown as object, currentStep: queue.length })
            }
          });

          if (updateResult.count === 0) throw new Error("ConcurrencyConflict");

          const balance = await this.getLeaveBalance(tx, leave);

          if (balance) {
            await tx.leaveBalance.update({
              where: { id: balance.id },
              data: {
                pending: { decrement: leave.totalDays },
                used: { increment: leave.totalDays }
              }
            });
          }

          if (Number(leave.unpaidDays) > 0) {
            await tx.payrollSyncEvent.create({
              data: {
                employeeId: leave.employeeId,
                leaveRequestId: leave.id,
                unpaidDays: leave.unpaidDays,
                status: 'PENDING'
              }
            });
          }
        });

        this.auditService.logApprove({
          moduleName: 'Leaves',
          entityId: leaveId,
          actorId: approverId,
          metadata: { approverId, override: true }
        });

        return { message: 'Leave Approved Successfully via Override' };
      }

      const currentStepIndex = leaveData.currentStep;
      const currentStep = queue[currentStepIndex];

      if (!currentStep) {
        throw new BadRequestException('Queue is already completed.');
      }

      let isAuthorized = false;
      if (currentStep.approverId) {
        isAuthorized = currentStep.approverId === approverId;
      } else if (currentStep.role === approverRole) {
        if (currentStep.role === 'TL') {
          const assignment = await this.prisma.projectAssignment.findFirst({
            where: {
              employeeId: leave.employeeId,
              project: { assignments: { some: { employeeId: approverId, projectRole: 'TL', releasedAt: null } } },
              releasedAt: null
            }
          });
          if (assignment || (leave as any).employee?.reportingManagerId === approverId) {
            isAuthorized = true;
          }
        } else {
          isAuthorized = true;
        }
      }

      if (!isAuthorized) {
        throw new BadRequestException(`You are not authorized for this step. Waiting for ${currentStep.role}`);
      }

      currentStep.status = 'APPROVED';
      currentStep.approverId = approverId;
      currentStep.actedAt = new Date();

      const nextStepIndex = currentStepIndex + 1;
      const isFinished = nextStepIndex >= queue.length;

      await this.prisma.$transaction(async (tx) => {
        const updateResult = await tx.leaveRequest.updateMany({
          where: { id: leaveId, status: 'PENDING' },
          data: {
            status: isFinished ? 'APPROVED' : 'PENDING',
            approvedAt: isFinished ? new Date() : null,
            approverId: isFinished ? approverId : null,
            ...({ approvalQueue: queue as unknown as object, currentStep: nextStepIndex })
          }
        });

        if (updateResult.count === 0) throw new Error("ConcurrencyConflict");

        if (isFinished) {
          const balance = await this.getLeaveBalance(tx, leave);

          if (balance) {
            await tx.leaveBalance.update({
              where: { id: balance.id },
              data: {
                pending: { decrement: (leave as any).paidDays || 0 },
                used: { increment: (leave as any).paidDays || 0 }
              }
            });
          }

          if (Number(leave.unpaidDays) > 0) {
            await tx.payrollSyncEvent.create({
              data: {
                employeeId: leave.employeeId,
                leaveRequestId: leave.id,
                unpaidDays: leave.unpaidDays,
                status: 'PENDING'
              }
            });
          }
        }
      });

      this.auditService.logApprove({
        moduleName: 'Leaves',
        entityId: leaveId,
        actorId: approverId,
        metadata: { approverId }
      });

      if (isFinished) {
        await this.notificationsService.createNotification(
          leave.employeeId,
          'Leave Approved',
          `Your leave request from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been fully approved.`,
          'LEAVE_STATUS',
          leave.id
        );
      } else {
        const nextStep = queue[nextStepIndex];
        if (nextStep.approverId) {
          await this.notificationsService.createNotification(
            nextStep.approverId,
            'Leave Approval Required',
            `A leave request from ${leave.employee?.firstName || 'Employee'} requires your approval.`,
            'LEAVE_STATUS',
            leave.id
          );
        } else {
          await this.notificationsService.notifyRole(
            nextStep.role,
            'Leave Approval Required',
            `A leave request from ${leave.employee?.firstName || 'Employee'} requires your approval.`,
            'LEAVE_STATUS',
            leave.id
          );
        }
      }

      return { message: isFinished ? 'Leave Approved Successfully' : `Leave Approved by ${approverRole}, pending next step.` };
    });
  }

  async rejectLeave(leaveId: string, approverId: string, reason: string): Promise<unknown> {
    const leave = await this.prisma.leaveRequest.findUnique({ where: { id: leaveId }, include: { employee: true } });
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
    if (approverRole === 'CEO') {
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

        const balance = await this.getLeaveBalance(tx, leave);

        if (balance) {
          await tx.leaveBalance.update({
            where: { id: balance.id },
            data: { pending: { decrement: leave.paidDays } }
          });
        }
      });

      this.auditService.logReject({
        moduleName: 'Leaves',
        entityId: leaveId,
        actorId: approverId,
        metadata: { approverId, reason, override: true }
      });

      return { message: 'Leave Rejected Successfully via Override' };
    }

    const currentStepIndex = leaveData.currentStep;
    const currentStep = queue[currentStepIndex];

    if (!currentStep) {
      throw new BadRequestException('Queue is already completed.');
    }

    let isAuthorized = false;
    if (currentStep.approverId) {
      isAuthorized = currentStep.approverId === approverId;
    } else if (currentStep.role === approverRole) {
      if (currentStep.role === 'TL') {
        const assignment = await this.prisma.projectAssignment.findFirst({
          where: {
            employeeId: leave.employeeId,
            project: { assignments: { some: { employeeId: approverId, projectRole: 'TL', releasedAt: null } } },
            releasedAt: null
          }
        });
        if (assignment || (leave as any).employee?.reportingManagerId === approverId) {
          isAuthorized = true;
        }
      } else {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
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

      const balance = await this.getLeaveBalance(tx, leave);

      if (balance) {
        await tx.leaveBalance.update({
          where: { id: balance.id },
          data: { pending: { decrement: leave.paidDays } }
        });
      }
    });

    this.auditService.logReject({
      moduleName: 'Leaves',
      entityId: leaveId,
      actorId: approverId,
      metadata: { approverId, reason }
    });

    await this.notificationsService.createNotification(
      leave.employeeId,
      'Leave Rejected',
      `Your leave request from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} was rejected. Reason: ${reason}`,
      'LEAVE_STATUS',
      leave.id
    );

    return { message: 'Leave Rejected Successfully' };
  }

  async cancelLeave(leaveId: string, employeeId: string): Promise<unknown> {
    const leave = await this.prisma.leaveRequest.findUnique({ where: { id: leaveId } });
    if (!leave) throw new NotFoundException('Leave not found');
    if (leave.employeeId !== employeeId) throw new BadRequestException('You can only cancel your own leave requests.');
    if (leave.status !== 'PENDING') throw new BadRequestException('Only pending leaves can be cancelled.');

    await this.prisma.$transaction(async (tx) => {
      await tx.leaveRequest.update({
        where: { id: leaveId },
        data: { status: 'CANCELLED' }
      });

      const balance = await this.getLeaveBalance(tx, leave);
      if (balance) {
        await tx.leaveBalance.update({
          where: { id: balance.id },
          data: { pending: { decrement: leave.paidDays } }
        });
      }
    });

    this.auditService.logUpdate({
      moduleName: 'Leaves',
      entityId: leaveId,
      actorId: employeeId,
      metadata: { action: 'CANCELLED_BY_EMPLOYEE' }
    });

    return { message: 'Leave Cancelled Successfully' };
  }

  async accrueMonthlyLeaves(): Promise<unknown> {
    const currentYear = new Date().getFullYear();
    const employees = await this.prisma.employee.findMany({
      where: { exitDate: null }
    });

    const leaveTypes = await this.prisma.leaveType.findMany({
      where: { isActive: true }
    });

    const currentMonth = new Date().getMonth();
    const policyMonth = currentMonth >= 5 ? currentMonth - 5 + 1 : currentMonth + 7 + 1; // Policy year starts in June

    const currentBalances = await this.prisma.leaveBalance.findMany({
      where: { year: currentYear }
    });
    const balanceMap = new Map();
    currentBalances.forEach(b => balanceMap.set(`${b.employeeId}-${b.leaveTypeId}`, b));

    const ops: any[] = [];

    for (const emp of employees) {
      for (const lt of leaveTypes) {
        if (lt.code === 'CL_FULL') {
          const existing = balanceMap.get(`${emp.id}-${lt.id}`);
          if (existing && Number(existing.allocated) >= policyMonth) continue; // Skip if already accrued

          ops.push(this.prisma.leaveBalance.upsert({
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
          }));
        } else if (lt.code === 'CL_HALF') {
          ops.push(this.prisma.leaveBalance.upsert({
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
          }));
        }
      }
    }

    const { chunkArray } = await import('../../common/constants/db-batch.constants');
    const opChunks = chunkArray(ops);

    for (const chunk of opChunks) {
      await this.prisma.$transaction(chunk);
    }

    const accruedCount = ops.length;
    return { message: `Monthly leave accrued successfully for ${accruedCount} balances.` };
  }

  async carryForwardYearlyLeaves(): Promise<unknown> {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    const previousBalances = await this.prisma.leaveBalance.findMany({
      where: {
        year: previousYear,
        leaveType: { code: 'CL_FULL' }
      }
    });

    const ops: any[] = [];

    for (const pb of previousBalances) {
      const remaining = Number(pb.allocated) + Number(pb.carriedOver) - Number(pb.used) - Number(pb.pending);
      if (remaining > 0) {
        // Max 7 days carry forward
        const carryForwardAmount = Math.min(remaining, 7);

        ops.push(this.prisma.leaveBalance.upsert({
          where: {
            employeeId_leaveTypeId_year: {
              employeeId: pb.employeeId,
              leaveTypeId: pb.leaveTypeId,
              year: currentYear
            }
          },
          update: {
            carriedOver: carryForwardAmount
          },
          create: {
            employeeId: pb.employeeId,
            leaveTypeId: pb.leaveTypeId,
            year: currentYear,
            allocated: 0, // Will be accrued separately
            carriedOver: carryForwardAmount,
            pending: 0,
            used: 0
          }
        }));
      }
    }

    const { chunkArray } = await import('../../common/constants/db-batch.constants');
    const opChunks = chunkArray(ops);

    for (const chunk of opChunks) {
      await this.prisma.$transaction(chunk);
    }

    const carriedOverCount = ops.length;
    return { message: `Successfully carried forward leaves for ${carriedOverCount} employees.` };
  }

  async getCalendar(employeeId?: string): Promise<unknown> {
    let teamIds: string[] | undefined = undefined;

    if (employeeId) {
      const hrSubordinates = await this.prisma.employee.findMany({
        where: { reportingManagerId: employeeId, status: { not: "EXITED" } },
        select: { id: true }
      });

      const tlProjects = await this.prisma.projectAssignment.findMany({
        where: { employeeId: employeeId, projectRole: "TL", releasedAt: null },
        select: { projectId: true }
      });
      const tlProjectIds = tlProjects.map((p: any) => p.projectId);

      const projectMembers = await this.prisma.projectAssignment.findMany({
        where: {
          projectId: { in: tlProjectIds },
          projectRole: { in: ["TR", "TS"] },
          releasedAt: null,
          employeeId: { not: employeeId }
        },
        select: { employeeId: true }
      });

      const ids = new Set<string>();
      hrSubordinates.forEach((emp: any) => ids.add(emp.id));
      projectMembers.forEach((pm: any) => ids.add(pm.employeeId));

      teamIds = Array.from(ids);

      if (teamIds.length === 0) {
        return [];
      }
    }

    return this.prisma.leaveRequest.findMany({
      where: {
        status: 'APPROVED',
        ...(teamIds ? { employeeId: { in: teamIds } } : {})
      },
      include: {
        employee: { include: { department: true } },
        leaveType: true
      },
      orderBy: { startDate: 'asc' }
    });
  }


}
