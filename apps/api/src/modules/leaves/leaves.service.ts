import { Injectable, NotFoundException, BadRequestException, Logger, ForbiddenException } from '@nestjs/common';
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

      let staticYearly = Number(b.allocated);
      if (b.leaveType.code === 'CL_FULL') staticYearly = 12;
      else if (b.leaveType.code === 'CL_HALF') staticYearly = 6;
      else if (b.leaveType.code === 'OPTIONAL') staticYearly = 2;

      return {
        ...b,
        yearlyAllocated: staticYearly, // Force exact policy limits for the yearly total (12 + 6 + 2 = 20)
        allocated: actualAllocated,
        carriedOver: Number(b.carriedOver),
        used: Number(b.used),
        pending: Number(b.pending)
      };
    });

    const hasSickLeave = balances.some(b => b.leaveType.code === 'SL' || b.leaveType.code === 'SICK');
    if (!hasSickLeave) {
      const sickLeaveType = await this.prisma.leaveType.findFirst({
        where: { code: { in: ['SL', 'SICK'] } }
      });
      if (sickLeaveType) {
        adjustedBalances.push({
          id: 'virtual-sl',
          employeeId: employeeId,
          leaveTypeId: sickLeaveType.id,
          year: currentYear,
          allocated: 10,
          carriedOver: 0,
          used: 0,
          pending: 0,
          yearlyAllocated: 10,
          leaveType: sickLeaveType
        } as any);
      }
    }

    adjustedBalances.forEach(b => {
      if (['CL_FULL', 'CL_HALF', 'OPTIONAL'].includes(b.leaveType.code)) {
        yearlyTotal += b.yearlyAllocated;
        accruedTotal += b.allocated + b.carriedOver;
        totalUsed += b.used;
        totalPending += b.pending;
      }
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
        status: { in: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] },
        OR: [
          {
            approvalQueue: {
              array_contains: [{ approverId }]
            }
          },
          {
            approvalQueue: {
              array_contains: [{ role }]
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

      return true;
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
        totalDays: reqData.totalDays?.toNumber(),
        paidDays: reqData.paidDays?.toNumber(),
        unpaidDays: reqData.unpaidDays?.toNumber(),
        isPendingForMe: isCurrentPending,
        myAction
      };
    });
  }

  private getRoleForEmployee(employee: any): string {
    if (employee.user?.role) {
      if (['CEO', 'CTO', 'OM'].includes(employee.user.role)) {
        return employee.user.role;
      }
    }
    const designTitle = (employee.designation?.title || '').toUpperCase();
    if (designTitle.includes('TRAINEE RESEARCHER') || designTitle === 'TR') return 'TR';
    if (designTitle.includes('TEAM LEAD') || designTitle === 'TL') return 'TL';
    if (designTitle.includes('OPERATIONS EXECUTIVE') || designTitle === 'OE') return 'OE';
    if (designTitle.includes('CLIENT ACQUISITION MANAGER') || designTitle === 'CAM') return 'CAM';
    if (designTitle.includes('CLIENT RELATIONSHIP MANAGER') || designTitle === 'CRM') return 'CRM';
    if (designTitle.includes('HR EXECUTIVE') || designTitle === 'HRE') return 'HRE';
    if (['QA', 'QE', 'TS'].some(t => designTitle.includes(t))) return designTitle;

    const deptCode = employee.department?.code || '';
    if (deptCode === 'HR') return 'HRE';

    return employee.user?.role || 'EMPLOYEE';
  }

  /**
   * Helper to fetch a leave balance for a given request within a transaction.
   */
  private async getLeaveBalance(tx: any, leave: { employeeId: string; leaveTypeId: string; startDate: Date }) {
    const currentYear = new Date(leave.startDate).getUTCFullYear();
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

    if (role === 'OM' || role === 'CTO') {
      return [{ role: 'CEO', status: 'PENDING' }];
    }

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
          if (!employee.reportingManagerId) {
            throw new BadRequestException("A reporting manager is required for this leave approval process but none is assigned.");
          }
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
      // Fallback queue determination based on role

      if (role === 'CTO') {
        // CTO → CEO only
        queue.push({ role: 'CEO', status: 'PENDING' });

      } else if (role === 'OM') {
        // Operations Manager → CEO only (no HR step)
        queue.push({ role: 'CEO', status: 'PENDING' });

      } else if (role === 'TR') {
        // Trainee Researcher → TL (from project) → HR
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

        // Emergency (< 24 hrs) → add CEO as final escalation step
        if (isEmergency) {
          queue.push({ role: 'CEO', status: 'PENDING' });
        }

      } else if (role === 'TL') {
        // Team Lead → Reporting Manager → HR
        if (employee.reportingManagerId) {
          queue.push({ role: 'MANAGER', status: 'PENDING', approverId: employee.reportingManagerId });
        }
        queue.push({ role: 'HRE', status: 'PENDING', approverId: employee.assignedHrId || undefined });

        if (isEmergency) {
          queue.push({ role: 'CEO', status: 'PENDING' });
        }

      } else if (role === 'OE' || role === 'CRM' || role === 'CEM' || role === 'CAM') {
        // Operations Team (OE / CRM / CEM / CAM)
        // Step 1: Operations Manager (their reportingManagerId or fallback to role)
        // Step 2: HR Executive
        // No project TL override — their lead IS the OM
        queue.push({ role: 'OM', status: 'PENDING', approverId: employee.reportingManagerId || undefined });
        queue.push({ role: 'HRE', status: 'PENDING', approverId: employee.assignedHrId || undefined });

        // Emergency (< 24 hrs) → escalate to CEO as final step
        if (isEmergency) {
          queue.push({ role: 'CEO', status: 'PENDING' });
        }

      } else if (role === 'HRE') {
        // HR Executive → Reporting Manager (HR Head / Director)
        if (employee.reportingManagerId) {
          queue.push({ role: 'MANAGER', status: 'PENDING', approverId: employee.reportingManagerId });
        }

      } else if (role !== 'CEO') {
        // Generic employees (Frontend/Backend devs, QA, TS, etc.)
        // Step 1: Project TL → fallback to Reporting Manager
        // Step 2: HR
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

        if (isEmergency) {
          queue.push({ role: 'CEO', status: 'PENDING' });
        }
      }

      // NOTE: For OM and CTO, CEO is always the approver regardless of policy scope.
      // For all other roles, if NOT emergency, CEO step (added above) is only included
      // when isEmergency is true, so no further filtering needed for the fallback path.
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

    return uniqueQueue.filter(q => q.approverId || ['HRE', 'CEO', 'CTO', 'OM'].includes(q.role));
  }

  async getMyLeaves(employeeId: string): Promise<unknown> {
    if (!employeeId) throw new BadRequestException('Employee ID is required');
    const requests = await this.prisma.leaveRequest.findMany({
      where: { employeeId },
      include: { leaveType: true },
      orderBy: { appliedAt: 'desc' }
    });
    return requests.map((r: any) => ({
      ...r,
      totalDays: r.totalDays?.toNumber(),
      paidDays: r.paidDays?.toNumber(),
      unpaidDays: r.unpaidDays?.toNumber()
    }));
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

    if (data.attachmentUrl) {
      const usedAttachment = await this.prisma.leaveRequest.findFirst({
        where: { attachmentUrl: data.attachmentUrl, status: { notIn: ['REJECTED', 'CANCELLED'] } }
      });
      if (usedAttachment) {
        throw new BadRequestException('This medical certificate has already been used in a previous leave request.');
      }

      try {
        const response = await fetch(data.attachmentUrl, { method: 'HEAD' });
        if (!response.ok) {
          throw new BadRequestException('The provided medical certificate URL is inaccessible or fake.');
        }
      } catch (err) {
        if (err instanceof BadRequestException) throw err;
        throw new BadRequestException('The provided medical certificate URL could not be verified.');
      }
    }

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

    const currentYear = startDate.getUTCFullYear();
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

      if ((leaveType.code === 'SL' || leaveType.code === 'SICK') && !data.attachmentUrl) {
        const windowStart = new Date(startDate);
        windowStart.setDate(windowStart.getDate() - 21);
        const windowEnd = new Date(endDate);
        windowEnd.setDate(windowEnd.getDate() + 21);

        const recentSickLeaves = await this.prisma.leaveRequest.findMany({
          where: {
            employeeId: employee.id,
            leaveTypeId: leaveType.id,
            status: { notIn: ['REJECTED', 'CANCELLED'] },
            startDate: { gte: windowStart },
            endDate: { lte: windowEnd }
          },
          select: { startDate: true, endDate: true }
        });

        const windowHolidays = await this.prisma.companyHoliday.findMany({
          where: { date: { gte: windowStart, lte: windowEnd } }
        });
        const windowHolidayDates = windowHolidays.map((h: any) => h.date.toISOString().split('T')[0]);

        const sickDates = new Set<string>();

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6 && !windowHolidayDates.includes(d.toISOString().split('T')[0])) {
            sickDates.add(d.toISOString().split('T')[0]);
          }
        }

        for (const rsl of recentSickLeaves) {
          for (let d = new Date(rsl.startDate); d <= rsl.endDate; d.setDate(d.getDate() + 1)) {
            if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6 && !windowHolidayDates.includes(d.toISOString().split('T')[0])) {
              sickDates.add(d.toISOString().split('T')[0]);
            }
          }
        }

        const sortedDates = Array.from(sickDates).sort();
        let maxChain = 0;
        let currentChain = 0;
        let prevDate: Date | null = null;

        for (const dateStr of sortedDates) {
          const currDate = new Date(dateStr);
          if (!prevDate) {
            currentChain = 1;
          } else {
            let gapWorkingDays = 0;
            for (let d = new Date(prevDate); d < currDate; d.setDate(d.getDate() + 1)) {
              if (d.toISOString().split('T')[0] === prevDate.toISOString().split('T')[0]) continue;
              if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6 && !windowHolidayDates.includes(d.toISOString().split('T')[0])) {
                gapWorkingDays++;
              }
            }
            if (gapWorkingDays === 0) {
              currentChain++;
            } else {
              currentChain = 1;
            }
          }
          if (currentChain > maxChain) maxChain = currentChain;
          prevDate = currDate;
        }

        if (maxChain > 2) {
          throw new BadRequestException(`Sick Leave requests exceeding 2 consecutive working days (including contiguous past/future requests) require a medical report or document.`);
        }
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
        // 1. PESSIMISTIC LOCK: Serialize concurrent requests at the DB layer
        await tx.$executeRaw`
          SELECT 1 FROM "leave_balances" 
          WHERE "employeeId" = ${employee.id} 
            AND "leaveTypeId" = ${leaveType.id} 
            AND "year" = ${currentYear} 
          FOR UPDATE
        `;

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
              allocated: (leaveType.code === 'SL' || leaveType.code === 'SICK') ? 10 : 0,
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
          const currentMonth = startDate.getUTCMonth();
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
          paidDays = applicablePaidDays;
          unpaidDays = daysForThisType - applicablePaidDays;

          const startOfMonth = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1));
          const endOfMonth = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth() + 1, 0));

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
          const defaultMax = leaveType.code === 'CL_HALF' ? 0.5 : 3;
          const maxPaidAllowedThisMonth = (leaveType as any).maxPaidPerMonth ? Number((leaveType as any).maxPaidPerMonth) : defaultMax;
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

    const mappedLeaves = createdLeaves.map((r: any) => ({
      ...r,
      totalDays: r.totalDays?.toNumber(),
      paidDays: r.paidDays?.toNumber(),
      unpaidDays: r.unpaidDays?.toNumber()
    }));

    return { message: 'Leave Applied Successfully', data: mappedLeaves.length > 1 ? mappedLeaves : mappedLeaves[0] };
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
          const currentMonth = startDate.getUTCMonth();
          const policyMonth = currentMonth >= 5 ? currentMonth - 5 + 1 : currentMonth + 7 + 1;
          const accruedLimit = Math.min(Number(balance.allocated), policyMonth);
          available = Math.max(0, accruedLimit + Number(balance.carriedOver) - Number(balance.used) - Number(balance.pending));
        } else if (leaveType.code === 'CL_HALF') {
          available = 0.5; // Strictly max 1 half-day per month. Reset every month.
        } else {
          available = Math.max(0, Number(balance.allocated) + Number(balance.carriedOver) - Number(balance.used) - Number(balance.pending));
        }
      } else if (leaveType.code === 'SL' || leaveType.code === 'SICK') {
        available = 10; // Virtual initialization for the preview API
      }

      if (leaveType.code === 'CL_FULL' || leaveType.code === 'CL_HALF') {
        const applicablePaidDays = Math.min(daysForThisType, available);

        const startOfMonth = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1));
        const endOfMonth = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth() + 1, 0));

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
      const genericError = new NotFoundException('Leave not found or you are not authorized to view it');
      if (!leave) throw genericError;

      const approver = await this.prisma.employee.findUnique({
        where: { id: approverId },
        include: { department: true, designation: true, user: true }
      });
      if (!approver) throw genericError;

      const approverRole = this.getRoleForEmployee(approver);

      const leaveData = leave as typeof leave & { approvalQueue?: unknown, currentStep: number };
      const queue = leaveData.approvalQueue as unknown as ApprovalQueueItem[];
      const currentStepIndex = leaveData.currentStep;
      const currentStep = queue[currentStepIndex];

      let isAuthorized = false;
      if (approverRole === 'CEO') {
        isAuthorized = true;
      } else if (currentStep) {
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
      }

      if (!isAuthorized) throw genericError;

      if (leave.status !== 'PENDING') throw new BadRequestException('Leave is not pending');

      if (leave.employeeId === approverId && approverRole !== 'CEO') {
        throw new ForbiddenException('Self-approval is strictly prohibited. Your manager must approve this request.');
      }

      if (!currentStep && approverRole !== 'CEO') {
        throw new BadRequestException('Queue is already completed.');
      }

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

          if (!leave.isHalfDay) {
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);
            const start = new Date(leave.startDate);
            start.setUTCHours(0, 0, 0, 0);
            const end = new Date(leave.endDate);
            end.setUTCHours(0, 0, 0, 0);
            for (let d = new Date(start); d <= end && d <= today; d.setUTCDate(d.getUTCDate() + 1)) {
              const dayOfWeek = d.getUTCDay();
              if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                await tx.attendanceRecord.upsert({
                  where: { employeeId_date: { employeeId: leave.employeeId, date: new Date(d) } },
                  update: { status: 'ON_LEAVE' },
                  create: {
                    employeeId: leave.employeeId,
                    date: new Date(d),
                    status: 'ON_LEAVE',
                    workHours: 0,
                    isRegularized: false
                  }
                });
              }
            }
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

          if (!leave.isHalfDay) {
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);
            const start = new Date(leave.startDate);
            start.setUTCHours(0, 0, 0, 0);
            const end = new Date(leave.endDate);
            end.setUTCHours(0, 0, 0, 0);
            for (let d = new Date(start); d <= end && d <= today; d.setUTCDate(d.getUTCDate() + 1)) {
              const dayOfWeek = d.getUTCDay();
              if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                await tx.attendanceRecord.upsert({
                  where: { employeeId_date: { employeeId: leave.employeeId, date: new Date(d) } },
                  update: { status: 'ON_LEAVE' },
                  create: {
                    employeeId: leave.employeeId,
                    date: new Date(d),
                    status: 'ON_LEAVE',
                    workHours: 0,
                    isRegularized: false
                  }
                });
              }
            }
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
    const genericError = new NotFoundException('Leave not found or you are not authorized to view it');
    if (!leave) throw genericError;

    const approver = await this.prisma.employee.findUnique({
      where: { id: approverId },
      include: { department: true, designation: true, user: true }
    });
    if (!approver) throw genericError;

    const approverRole = this.getRoleForEmployee(approver);

    const leaveData = leave as typeof leave & { approvalQueue?: unknown, currentStep: number };
    const queue = leaveData.approvalQueue as unknown as ApprovalQueueItem[];
    const currentStepIndex = leaveData.currentStep;
    const currentStep = queue[currentStepIndex];

    let isAuthorized = false;
    if (approverRole === 'CEO') {
      isAuthorized = true;
    } else if (currentStep) {
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
    }

    if (!isAuthorized) throw genericError;

    if (leave.status !== 'PENDING') throw new BadRequestException('Leave is not pending');

    if (leave.employeeId === approverId && approverRole !== 'CEO') {
      throw new ForbiddenException('Self-rejection is strictly prohibited. Your manager must review this request.');
    }

    if (!currentStep && approverRole !== 'CEO') {
      throw new BadRequestException('Queue is already completed.');
    }

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
        const updateResult = await tx.leaveRequest.updateMany({
          where: { id: leaveId, status: 'PENDING' },
          data: {
            status: 'REJECTED',
            rejectionReason: reason,
            ...({ approvalQueue: queue as unknown as object, currentStep: queue.length })
          }
        });

        if (updateResult.count === 0) throw new Error("ConcurrencyConflict");

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



    currentStep.status = 'REJECTED';
    currentStep.approverId = approverId;
    currentStep.actedAt = new Date();

    await this.prisma.$transaction(async (tx) => {
      const updateResult = await tx.leaveRequest.updateMany({
        where: { id: leaveId, status: 'PENDING' },
        data: {
          status: 'REJECTED',
          rejectionReason: reason,
          ...({ approvalQueue: queue as unknown as object, currentStep: currentStepIndex + 1 })
        }
      });

      if (updateResult.count === 0) throw new Error("ConcurrencyConflict");

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
      const updateResult = await tx.leaveRequest.updateMany({
        where: { id: leaveId, status: 'PENDING' },
        data: {
          status: 'CANCELLED',
          approvalQueue: Array.isArray(leave.approvalQueue)
            ? (leave.approvalQueue as any[]).map((q: any) => q.status === 'PENDING' ? { ...q, status: 'CANCELLED' } : q)
            : leave.approvalQueue || []
        }
      });

      if (updateResult.count === 0) throw new Error("ConcurrencyConflict");

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
    const today = new Date();
    const jobName = `accrueMonthlyLeaves_${today.getFullYear()}_${today.getMonth() + 1}`;

    try {
      await this.prisma.systemJobLog.create({ data: { jobName } });
    } catch (e: any) {
      if (e.code === 'P2002') {
        this.logger.warn(`Job ${jobName} already executed. Skipping.`);
        return { message: 'Job already executed.' };
      }
      throw e;
    }

    const currentYear = today.getFullYear();
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
              allocated: { increment: 0.5 },
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
    const jobName = `carryForwardYearlyLeaves_${currentYear}`;

    try {
      await this.prisma.systemJobLog.create({ data: { jobName } });
    } catch (e: any) {
      if (e.code === 'P2002') {
        this.logger.warn(`Job ${jobName} already executed. Skipping.`);
        return { message: 'Job already executed.' };
      }
      throw e;
    }
    const previousYear = currentYear - 1;

    const previousBalances = await this.prisma.leaveBalance.findMany({
      where: {
        year: previousYear,
        leaveType: { code: { in: ['CL_FULL', 'SL', 'SICK'] } }
      },
      include: { leaveType: true }
    });

    const ops: any[] = [];

    for (const pb of previousBalances) {
      if (pb.leaveType.code === 'CL_FULL') {
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
      } else if (pb.leaveType.code === 'SL' || pb.leaveType.code === 'SICK') {
        // Sick Leave resets to flat 10 every year, no carry forward.
        ops.push(this.prisma.leaveBalance.upsert({
          where: {
            employeeId_leaveTypeId_year: {
              employeeId: pb.employeeId,
              leaveTypeId: pb.leaveTypeId,
              year: currentYear
            }
          },
          update: {
            allocated: 10,
            carriedOver: 0,
            pending: 0,
            used: 0
          },
          create: {
            employeeId: pb.employeeId,
            leaveTypeId: pb.leaveTypeId,
            year: currentYear,
            allocated: 10,
            carriedOver: 0,
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

  async getCalendar(employeeId?: string, role?: string): Promise<unknown> {
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
      ids.add(employeeId); // ALWAYS include the employee themselves
      hrSubordinates.forEach((emp: any) => ids.add(emp.id));
      projectMembers.forEach((pm: any) => ids.add(pm.employeeId));

      teamIds = Array.from(ids);

      // We removed the 'if teamIds.length === 0 return []' check 
      // because teamIds will at least have the employeeId.
    }

    const requests = await this.prisma.leaveRequest.findMany({
      where: {
        status: { in: ['APPROVED', 'PENDING'] },
        ...(teamIds ? { employeeId: { in: teamIds } } : {})
      },
      include: {
        employee: { include: { department: true } },
        leaveType: true
      },
      orderBy: { startDate: 'asc' }
    });

    return requests.map((r: any) => {
      const isSensitive = ['MATERNITY', 'PATERNITY', 'SL', 'SICK', 'BEREAVEMENT'].includes(r.leaveType?.code);
      const shouldMask = role !== 'HR' && isSensitive;
      
      const maskedLeaveType = shouldMask ? { ...r.leaveType, name: 'Approved Leave', code: 'LEAVE' } : r.leaveType;
      const maskedReason = shouldMask ? '[Redacted for privacy]' : r.reason;

      return {
        ...r,
        leaveType: maskedLeaveType,
        reason: maskedReason,
        totalDays: r.totalDays?.toNumber(),
        paidDays: r.paidDays?.toNumber(),
        unpaidDays: r.unpaidDays?.toNumber()
      };
    });
  }

  async expireStaleLeaves(): Promise<void> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const staleLeaves = await this.prisma.leaveRequest.findMany({
      where: {
        status: 'PENDING',
        startDate: { lt: today }
      },
      include: { leaveType: true, employee: true }
    });

    for (const leave of staleLeaves) {
      await this.prisma.$transaction(async (tx) => {
        const updateResult = await tx.leaveRequest.updateMany({
          where: { id: leave.id, status: 'PENDING' },
          data: {
            status: 'CANCELLED',
            rejectionReason: 'System: Auto-expired stale pending request',
            approvalQueue: Array.isArray(leave.approvalQueue)
              ? (leave.approvalQueue as any[]).map((q: any) => q.status === 'PENDING' ? { ...q, status: 'CANCELLED' } : q)
              : leave.approvalQueue || []
          }
        });

        if (updateResult.count === 0) return;

        const balance = await this.getLeaveBalance(tx, leave);
        if (balance) {
          const paidDays = leave.paidDays ? Number(leave.paidDays) : 0;
          await tx.leaveBalance.update({
            where: { id: balance.id },
            data: {
              pending: { decrement: paidDays }
            }
          });
        }
      });
      this.logger.log(`Auto-expired and refunded stale leave request ${leave.id}`);
    }
  }
}
