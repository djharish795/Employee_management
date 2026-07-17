import { Injectable, BadRequestException, ForbiddenException, NotFoundException, Logger } from "@nestjs/common";
import { RbacGroups } from "../../common/rbac/rbac.config";
import { RedisService } from "../../redis/redis.service";
import { PrismaService } from "../../prisma/prisma.service";
import { PunchDto } from "./dto/punch.dto";
import { AttendanceStatus } from "@naprocs/database";
import { toZonedTime } from "date-fns-tz";
import { isLateArrival, parseBreakHistory, PRESENT_STATUSES, PRESENT_WITH_LATE_STATUSES } from "./attendance.constants";

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
  ) { }

  private getRedisKey(employeeId: string): string {
    return `attendance_state:${employeeId}`;
  }

  private getTodayShiftDate(): Date {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
    const parts = formatter.formatToParts(now);
    const dateObj: any = {};
    for (const part of parts) dateObj[part.type] = part.value;
    
    // Create a pseudo-UTC date locked to the Indian calendar date to fix .getUTCDay() KPI loops
    const isoString = `${dateObj.year}-${dateObj.month}-${dateObj.day}T00:00:00.000Z`;
    return new Date(isoString);
  }

  private async getState(employeeId: string) {
    const key = this.getRedisKey(employeeId);
    let state = await this.redis.getJson<any>(key);
    const today = this.getTodayShiftDate();

    // Reset state for a new day if the employee is currently checked out
    if (state && state.state === "OUT" && state.shiftDate && state.shiftDate !== today.toISOString()) {
      state = { state: "OUT", startTime: 0, offset: 0, shiftDate: null };
      await this.redis.setJson(key, state, 60 * 60 * 24);
    }

    if (!state) {
      const dbRecord = await this.prisma.attendanceRecord.findUnique({
        where: { employeeId_date: { employeeId, date: today } }
      });

      if (dbRecord && !dbRecord.checkOutTime && dbRecord.checkInTime) {
        const now = Date.now();
        const checkInTime = dbRecord.checkInTime.getTime();

        let currentState = "IN";
        let startTime = now;
        let offset = 0;

        if ((dbRecord as any).currentBreakStartTime) {
          currentState = "BREAK";
          startTime = (dbRecord as any).currentBreakStartTime.getTime();
          offset = Math.floor((startTime - checkInTime) / 1000) - (dbRecord as any).totalBreakSeconds;
        } else {
          const totalElapsedSeconds = Math.floor((now - checkInTime) / 1000) - ((dbRecord as any).totalBreakSeconds || 0);
          offset = totalElapsedSeconds;
          startTime = now;
        }

        state = {
          state: currentState,
          startTime: startTime,
          offset: Math.max(0, offset),
          shiftDate: dbRecord.date.toISOString()
        };

        await this.redis.setJson(key, state, 60 * 60 * 24);
      } else {
        state = { state: "OUT", startTime: 0, offset: 0, shiftDate: null };
      }
    }
    return state;
  }

  async getTodayStatus(employeeId: string) {
    if (!employeeId) throw new BadRequestException("Employee ID is required");
    return await this.getState(employeeId);
  }

  async punch(employeeId: string, dto: PunchDto, ipAddress: string) {
    if (!employeeId) throw new BadRequestException("Employee ID is required");

    if (dto.idempotencyKey) {
      await this.redis.connect();
      const lockKey = `punch_lock:${employeeId}:${dto.idempotencyKey}`;
      const locked = await this.redis.getClient().set(lockKey, "1", "EX", 10, "NX");
      if (!locked) {
        throw new BadRequestException("Duplicate punch request detected");
      }
    }

    const key = this.getRedisKey(employeeId);
    let state = await this.getState(employeeId);
    const now = Date.now();
    const today = this.getTodayShiftDate();

    if (dto.action === "IN") {
      if (state.state === "IN") throw new BadRequestException("Already punched in");

      const isFirstPunch = state.state === "OUT" && state.offset === 0;

      // Persist active shift date context to survive midnight crossovers
      if (isFirstPunch || !state.shiftDate) {
        state.shiftDate = today.toISOString();
      }

      const shiftDate = new Date(state.shiftDate);

      const isReturnFromBreak = state.state === "BREAK";
      if (isReturnFromBreak) {
        const breakElapsed = Math.floor((now - state.startTime) / 1000);
        state.offset += breakElapsed;

        const record = await this.prisma.attendanceRecord.findUnique({
          where: { employeeId_date: { employeeId, date: shiftDate } }
        });

        let breakHistory: any[] = parseBreakHistory(record ? (record as any).breakHistory : null);

        if (breakHistory.length > 0 && breakHistory[breakHistory.length - 1].end === null) {
          breakHistory[breakHistory.length - 1].end = new Date(now).toISOString();
        } else {
          breakHistory.push({ start: new Date(state.startTime).toISOString(), end: new Date(now).toISOString() });
        }

        await this.prisma.attendanceRecord.updateMany({
          where: { employeeId, date: shiftDate, currentBreakStartTime: { not: null } },
          data: {
            totalBreakSeconds: { increment: breakElapsed },
            currentBreakStartTime: null,
            breakHistory: breakHistory as any
          } as any
        });
      }

      state.state = "IN";
      state.startTime = now;
      await this.redis.setJson(key, state, 60 * 60 * 24); // 24 hours

      let initialStatus = "PRESENT";
      if (isFirstPunch) {
        const checkInTime = new Date(now);
        if (isLateArrival(checkInTime)) {
          initialStatus = "LATE";
        }
      }

      if (isFirstPunch) {
        // Upsert first punch. Update block explicitly omits checkInTime to prevent overwriting
        // original checkIn on subsequent Redis-flushed false first punches.
        await this.prisma.attendanceRecord.upsert({
          where: { employeeId_date: { employeeId, date: shiftDate } },
          update: { status: initialStatus as any, checkInIp: ipAddress },
          create: {
            employeeId,
            date: shiftDate,
            checkInTime: new Date(now),
            status: initialStatus as any,
            isRegularized: false,
            checkInIp: ipAddress,
            workHours: 0,
            punchHistory: [{ action: "IN", time: new Date(now).toISOString() }] as any,
          } as any,
        });
      } else {
        const record = await this.prisma.attendanceRecord.findUnique({
          where: { employeeId_date: { employeeId, date: shiftDate } }
        });
        const ph = (record as any)?.punchHistory ? ((record as any).punchHistory as any[]) : [];
        ph.push({ action: "IN", time: new Date(now).toISOString() });
        await this.prisma.attendanceRecord.update({
          where: { employeeId_date: { employeeId, date: shiftDate } },
          data: { punchHistory: ph as any } as any
        });
      }

      return state;
    }

    if (dto.action === "BREAK") {
      if (state.state !== "IN") throw new BadRequestException("Must be punched in to take a break");

      const elapsed = Math.floor((now - state.startTime) / 1000);
      state.offset += elapsed;
      state.state = "BREAK";
      state.startTime = now;
      await this.redis.setJson(key, state, 60 * 60 * 24);

      const shiftDate = state.shiftDate ? new Date(state.shiftDate) : today;

      const record = await this.prisma.attendanceRecord.findUnique({
        where: { employeeId_date: { employeeId, date: shiftDate } }
      });

      let breakHistory: any[] = parseBreakHistory(record ? (record as any).breakHistory : null);

      breakHistory.push({ start: new Date(now).toISOString(), end: null });

      let punchHistory = (record as any)?.punchHistory ? ((record as any).punchHistory as any[]) : [];
      punchHistory.push({ action: "BREAK", time: new Date(now).toISOString() });

      await this.prisma.attendanceRecord.updateMany({
        where: { employeeId, date: shiftDate, currentBreakStartTime: null },
        data: { currentBreakStartTime: new Date(now), breakHistory: breakHistory as any, punchHistory: punchHistory as any } as any
      });

      return state;
    }

    if (dto.action === "OUT") {
      if (state.state === "OUT") throw new BadRequestException("Already punched out");

      if (state.state === "IN" || state.state === "BREAK") {
        const elapsed = Math.floor((now - state.startTime) / 1000);
        state.offset += elapsed;
      }

      const shiftDate = state.shiftDate ? new Date(state.shiftDate) : today;

      state.state = "OUT";
      state.startTime = now;
      await this.redis.setJson(key, state, 60 * 60 * 24);

      const existingRecord = await this.prisma.attendanceRecord.findUnique({
        where: { employeeId_date: { employeeId, date: shiftDate } }
      });
      const checkInTime = existingRecord?.checkInTime || new Date(state.startTime);
      const isLate = isLateArrival(checkInTime);

      let workHoursDecimal = state.offset / 3600;

      const approvedHalfDay = await this.prisma.leaveRequest.findFirst({
        where: {
          employeeId,
          startDate: { lte: shiftDate },
          endDate: { gte: shiftDate },
          status: 'APPROVED',
          isHalfDay: true
        }
      });

      const thresholdSeconds = approvedHalfDay ? 16200 : 32400; // 4.5 hours or 9 hours

      let finalStatus = "PRESENT";
      if (state.offset < thresholdSeconds) {
        finalStatus = "EARLY_CHECKOUT";
      } else if (isLate && !approvedHalfDay) {
        finalStatus = "LATE";
      } else if (existingRecord?.status === "WFH") {
        finalStatus = "WFH";
      }

      let overtimeDecimal = 0;
      if (state.offset > 32400) {
        overtimeDecimal = (state.offset - 32400) / 3600;
      }

      let punchHistory = (existingRecord as any)?.punchHistory ? ((existingRecord as any).punchHistory as any[]) : [];
      punchHistory.push({ action: "OUT", time: new Date(now).toISOString() });

      await this.prisma.attendanceRecord.upsert({
        where: { employeeId_date: { employeeId, date: shiftDate } },
        update: {
          checkOutTime: new Date(now),
          workHours: workHoursDecimal,
          status: finalStatus as any,
          overtime: overtimeDecimal,
          punchHistory: punchHistory as any,
        } as any,
        create: {
          employeeId,
          date: shiftDate,
          checkInTime: new Date(state.startTime),
          checkOutTime: new Date(now),
          status: finalStatus as any,
          isRegularized: false,
          workHours: workHoursDecimal,
          overtime: overtimeDecimal,
          punchHistory: punchHistory as any,
        } as any
      }).catch(err => {
        this.logger.error(`Check-out upsert failed for employee ${employeeId}:`, err.stack || err);
      });

      return state;
    }

    throw new BadRequestException("Invalid action");
  }

  async getMyLogs(employeeId: string, query: any): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    if (!employeeId) throw new BadRequestException("Employee ID is required");

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.attendanceRecord.findMany({
        where: { employeeId },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.attendanceRecord.count({ where: { employeeId } })
    ]);

    // Map to dashboard-panel.tsx expected DTO shape
    const mappedData = data.map(record => ({
      date: record.date.toISOString(),
      checkIn: record.checkInTime ? record.checkInTime.toISOString() : null,
      checkOut: record.checkOutTime ? record.checkOutTime.toISOString() : null,
      hoursWorked: record.workHours ? Number(record.workHours) : 0,
      status: record.status,
      remarks: record.notes || "",
      totalBreakSeconds: record.totalBreakSeconds || 0,
      breakHistory: parseBreakHistory((record as any).breakHistory),
      punchHistory: Array.isArray((record as any).punchHistory) ? (record as any).punchHistory : []
    }));

    return { data: mappedData, total, page, limit };
  }

  async getMyKpis(employeeId: string) {
    if (!employeeId) throw new BadRequestException("Employee ID is required");

    const today = this.getTodayShiftDate();
    const startOfMonth = new Date(today);
    startOfMonth.setUTCDate(1);

    // 1. Present Today
    const todayRecord = await this.prisma.attendanceRecord.findUnique({
      where: { employeeId_date: { employeeId, date: today } },
    });
    const presentToday = todayRecord && (PRESENT_STATUSES as readonly string[]).includes(todayRecord.status) ? 1 : 0;

    // 2. Avg Work Hours this month
    const monthlyRecords = await this.prisma.attendanceRecord.findMany({
      where: {
        employeeId,
        date: { gte: startOfMonth },
        workHours: { not: null }
      },
      select: { workHours: true, status: true },
    });

    let totalHours = 0;
    let daysPresent = 0;
    let lateArrivals = 0;
    let wfhDays = 0;

    monthlyRecords.forEach(record => {
      if (record.workHours) {
        totalHours += Number(record.workHours);
      }
      const statusStr = record.status as string;
      if ((PRESENT_WITH_LATE_STATUSES as readonly string[]).includes(statusStr)) {
        daysPresent += (statusStr === "HALF_DAY" || statusStr === "EARLY_CHECKOUT") ? 0.5 : 1;
      }
      if (statusStr === "LATE") lateArrivals++;
      if (statusStr === "WFH") wfhDays++;
    });

    const avgHoursWorked = monthlyRecords.length > 0 ? (totalHours / monthlyRecords.length) : 0;

    // 3. Attendance Rate (Exclude weekends, ON_LEAVE, HOLIDAY)
    let workingDaysSoFar = 0;
    for (let d = new Date(startOfMonth); d <= today; d.setUTCDate(d.getUTCDate() + 1)) {
      const dayOfWeek = d.getUTCDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDaysSoFar++;
      }
    }

    const holidaysAndLeaves = await this.prisma.attendanceRecord.count({
      where: {
        employeeId,
        date: { gte: startOfMonth, lte: today },
        status: { in: ["ON_LEAVE", "HOLIDAY"] }
      }
    });

    let totalWorkingDays = workingDaysSoFar - holidaysAndLeaves;
    if (totalWorkingDays <= 0) totalWorkingDays = 1; // Prevent division by zero

    const attendanceRate = Math.min(100, (daysPresent / totalWorkingDays) * 100);

    // 4. Weekly Trends (ISO Week: Mon-Sun)
    const currentDayOfWeek = today.getUTCDay();
    const daysSinceMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    const startOfWeek = new Date(today);
    startOfWeek.setUTCDate(today.getUTCDate() - daysSinceMonday);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);

    const weeklyRecords = await this.prisma.attendanceRecord.findMany({
      where: {
        employeeId,
        date: { gte: startOfWeek, lte: endOfWeek }
      },
      orderBy: { date: "asc" }
    });

    const weeklyTrends = [];
    for (let d = new Date(startOfWeek); d <= endOfWeek; d.setUTCDate(d.getUTCDate() + 1)) {
      const isoDate = d.toISOString().split("T")[0];
      const record = weeklyRecords.find(r => r.date.toISOString().split("T")[0] === isoDate);
      weeklyTrends.push({
        date: isoDate,
        hours: record?.workHours ? Number(record.workHours) : 0,
      });
    }

    // Calculate this week hours
    const thisWeekHours = weeklyTrends.reduce((sum, day) => sum + day.hours, 0);
    const weeklyTargetHours = 45;

    return {
      presentToday,
      attendanceRate: Number(attendanceRate.toFixed(1)),
      avgHoursWorked: Number(avgHoursWorked.toFixed(1)),
      lateArrivals,
      wfhDays,
      leaveDays: holidaysAndLeaves,
      thisWeekHours: Number(thisWeekHours.toFixed(1)),
      weeklyTargetHours,
      thisMonthDays: daysPresent,
      weeklyTrends
    };
  }

  async getOrgReports() {
    const today = this.getTodayShiftDate();
    const startOfMonth = new Date(today);
    startOfMonth.setUTCDate(1);

    // Get all records for this month
    const monthlyRecords = await this.prisma.attendanceRecord.findMany({
      where: {
        date: { gte: startOfMonth, lte: today },
      },
      include: {
        employee: {
          include: { department: true }
        }
      }
    });

    let totalHours = 0;
    let lateCount = 0;
    let presentCount = 0;
    const activeEmployees = new Set<string>();

    // Department stats
    const deptStats: Record<string, { present: number, total: number, fte: Set<string> }> = {};

    monthlyRecords.forEach(record => {
      activeEmployees.add(record.employeeId);

      const deptName = record.employee?.department?.name || "Others";
      if (!deptStats[deptName]) {
        deptStats[deptName] = { present: 0, total: 0, fte: new Set() };
      }
      deptStats[deptName].fte.add(record.employeeId);
      deptStats[deptName].total++;

      if (record.workHours) {
        totalHours += Number(record.workHours);
      }
      const statusStr = record.status as string;
      const checkInTime = record.checkInTime;
      let isLate = false;
      if (checkInTime) {
        if (isLateArrival(checkInTime)) isLate = true;
      }

      if (isLate) {
        lateCount++;
        presentCount++;
        deptStats[deptName].present++;
      } else if ((PRESENT_STATUSES as readonly string[]).includes(statusStr)) {
        presentCount += (statusStr === "HALF_DAY" || statusStr === "EARLY_CHECKOUT") ? 0.5 : 1;
        deptStats[deptName].present += (statusStr === "HALF_DAY" || statusStr === "EARLY_CHECKOUT") ? 0.5 : 1;
      }
    });

    const totalRecords = monthlyRecords.length || 1;
    const avgAttendance = Number(((presentCount / totalRecords) * 100).toFixed(1));
    const lateRate = Number(((lateCount / totalRecords) * 100).toFixed(1));
    const avgHours = presentCount > 0 ? Number((totalHours / presentCount).toFixed(1)) : 0;
    const activeFTE = activeEmployees.size;

    const departmentRates = Object.entries(deptStats).map(([name, stats]) => ({
      name,
      percent: stats.total > 0 ? Number(((stats.present / stats.total) * 100).toFixed(1)) : 0,
      count: stats.fte.size
    })).sort((a, b) => b.percent - a.percent);

    // Late Trends (last 6 months)
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setUTCMonth(sixMonthsAgo.getUTCMonth() - 5);
    sixMonthsAgo.setUTCDate(1);

    const sixMonthRecords = await this.prisma.attendanceRecord.findMany({
      where: {
        date: { gte: sixMonthsAgo, lte: today },
      },
      select: { date: true, checkInTime: true }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const lateTrendsMap: Record<string, number> = {};

    // Initialize last 6 months with 0
    for (let i = 0; i < 6; i++) {
      const d = new Date(sixMonthsAgo);
      d.setUTCMonth(d.getUTCMonth() + i);
      lateTrendsMap[monthNames[d.getUTCMonth()]] = 0;
    }

    sixMonthRecords.forEach(record => {
      let isLate = false;
      if (record.checkInTime) {
        if (isLateArrival(record.checkInTime)) isLate = true;
      }

      if (isLate) {
        const month = monthNames[record.date.getUTCMonth()];
        if (lateTrendsMap[month] !== undefined) {
          lateTrendsMap[month]++;
        }
      }
    });

    const maxLates = Math.max(...Object.values(lateTrendsMap), 1);
    const lateTrends = Object.entries(lateTrendsMap).map(([label, count]) => ({
      label,
      count,
      percent: Math.round((count / maxLates) * 100)
    }));

    return {
      avgAttendance,
      lateRate,
      avgHours: `${avgHours}h`,
      activeFTE,
      departmentRates,
      lateTrends
    };
  }

  async getSummaryToday(dateStr?: string, filterDepartmentId?: string, user?: any) {
    let today = this.getTodayShiftDate();
    if (dateStr) {
      today = new Date(dateStr);
      today.setUTCHours(0, 0, 0, 0);
    }

    // Get all employees with their departments
    let employeeWhere: any = {
      status: { notIn: ["EXITED", "CANCELLED", "ONBOARDING"] }
    };
    if (filterDepartmentId && filterDepartmentId !== 'all') {
      employeeWhere.departmentId = filterDepartmentId;
    }

    // Filter to only direct reports if the user is a Team Lead/Manager without global admin permissions
    const isTeamLeadOnly = user && 
      !['SUPER_ADMIN', 'CTO', 'CEO', 'HR', 'CHRO'].includes(user.role) &&
      ['TEAM_LEAD', 'MANAGER'].includes(user.role);

    if (isTeamLeadOnly && user.employeeId) {
      employeeWhere.reportingManagerId = user.employeeId;
    }

    const allEmployees = await this.prisma.employee.findMany({
      where: employeeWhere,
      include: { department: true }
    });
    
    // Only count ACTIVE employees for daily attendance metrics
    const employees = allEmployees.filter(e => e.status === 'ACTIVE');
    const totalEmployees = employees.length;
    // Vacant positions are represented by employees with inactive statuses (e.g. TERMINATED)
    const vacantEmployees = allEmployees.length - totalEmployees;

    // Get today's attendance records
    const todayRecords = await this.prisma.attendanceRecord.findMany({
      where: { date: today },
    });

    // Get today's leave requests
    const todayLeaves = await this.prisma.leaveRequest.findMany({
      where: {
        startDate: { lte: today },
        endDate: { gte: today },
        status: "APPROVED"
      }
    });

    let present = 0;
    let lateArrivals = 0;

    // Group records by employeeId for easy lookup
    const recordMap = new Map();
    todayRecords.forEach(r => recordMap.set(r.employeeId, r));

    // Department Stats
    const deptStats: Record<string, { id: string, name: string, present: number, total: number }> = {};
    const exceptions: any[] = [];
    const presentEmployees: any[] = [];
    let onLeave = 0;

    employees.forEach(emp => {
      const deptId = emp.departmentId || 'unassigned';
      const deptName = emp.department?.name || 'Unassigned';

      if (!deptStats[deptId]) {
        deptStats[deptId] = { id: deptId, name: deptName, present: 0, total: 0 };
      }
      deptStats[deptId].total++;

      const record = recordMap.get(emp.id);

      let isPresent = false;
      let isLate = false;

      if (record) {
        const status = record.status as string;
        if ((PRESENT_STATUSES as readonly string[]).includes(status)) {
          isPresent = true;
        }

        // Check for late arrival
        if (record.checkInTime) {
          if (isLateArrival(record.checkInTime)) {
            isLate = true;
          }
        }
      }

      const initials = `${emp.firstName.charAt(0)}${emp.lastName.charAt(0)}`.toUpperCase();

      if (isPresent) {
        present++;
        deptStats[deptId].present++;

        presentEmployees.push({
          id: `pr-${emp.id}`,
          name: `${emp.firstName} ${emp.lastName}`,
          department: deptName,
          status: 'PRESENT',
          initials
        });

        if (isLate) {
          lateArrivals++;
          exceptions.push({
            id: `ex-${emp.id}`,
            name: `${emp.firstName} ${emp.lastName}`,
            department: deptName,
            status: 'LATE',
            initials
          });
        }
      } else {
        // Not present - check if they are on leave
        const isOnLeave = todayLeaves.some(l => l.employeeId === emp.id);
        if (isOnLeave) {
          onLeave++;
        } else {
          exceptions.push({
            id: `ex-${emp.id}`,
            name: `${emp.firstName} ${emp.lastName}`,
            department: deptName,
            status: 'ABSENT',
            initials
          });
        }
      }
    });

    const presentPercentage = totalEmployees > 0 ? Math.round((present / totalEmployees) * 100) : 0;
    const notPunchedIn = Math.max(0, totalEmployees - present - onLeave);

    // Trend Data (Last 6 months percentage) - we won't filter this by department for simplicity, 
    // or maybe we should. Let's filter if department is selected.
    const trendData = [];
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setUTCMonth(sixMonthsAgo.getUTCMonth() - 5);
    sixMonthsAgo.setUTCDate(1);

    const pastRecords = await this.prisma.attendanceRecord.findMany({
      where: {
        date: { gte: sixMonthsAgo, lte: today },
        employeeId: { in: employees.map(e => e.id) }
      },
      select: { date: true, status: true }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthStats = new Map<string, { present: number, total: number, label: string }>();

    pastRecords.forEach(r => {
      const m = r.date.getUTCMonth();
      const y = r.date.getUTCFullYear();
      const key = `${y}-${(m + 1).toString().padStart(2, '0')}`;
      
      if (!monthStats.has(key)) {
        monthStats.set(key, { present: 0, total: 0, label: monthNames[m] });
      }
      const stat = monthStats.get(key)!;
      stat.total++;
      const statusStr = r.status as string;
      if ((PRESENT_STATUSES as readonly string[]).includes(statusStr)) {
        stat.present++;
      }
    });
    // Populate trend array in order (last 6 months)
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today);
      d.setUTCMonth(d.getUTCMonth() - i);
      const mName = monthNames[d.getUTCMonth()];
      const y = d.getUTCFullYear();
      const key = `${y}-${(d.getUTCMonth() + 1).toString().padStart(2, '0')}`;
      const stat = monthStats.get(key);
      let perc = 0;
      if (stat && stat.total > 0) {
        perc = Math.round((stat.present / stat.total) * 100);
      }
      trendData.push({ month: mName, percentage: perc });
    }

    return {
      metrics: {
        totalEmployees,
        vacantEmployees,
        present,
        presentPercentage,
        onLeave,
        lateArrivals,
        notPunchedIn,
      },
      departmentStats: Object.values(deptStats).sort((a: any, b: any) => b.total - a.total),
      exceptions,
      presentEmployees,
      trendData
    };
  }

  async getAllLogs(query: any, user?: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    // Filter to only direct reports if the user is a Team Lead/Manager without global admin permissions
    const isTeamLeadOnly = user && 
      !['SUPER_ADMIN', 'CTO', 'CEO', 'HR', 'CHRO'].includes(user.role) &&
      ['TEAM_LEAD', 'MANAGER'].includes(user.role);

    if (isTeamLeadOnly && user.employeeId) {
      where.employee = { reportingManagerId: user.employeeId };
    }

    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) {
        where.date.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.date.lte = new Date(query.endDate);
      }
    } else if (query.month && query.year) {
      const year = Number(query.year);
      const month = Number(query.month) - 1; // 0-indexed
      where.date = {
        gte: new Date(year, month, 1),
        lte: new Date(year, month + 1, 0, 23, 59, 59)
      };
    }

    const [records, total] = await Promise.all([
      this.prisma.attendanceRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "desc" },
        include: { employee: { select: { firstName: true, lastName: true } } }
      }),
      this.prisma.attendanceRecord.count({ where }),
    ]);

    const data = records.map(record => {
      const checkIn = record.checkInTime ? record.checkInTime.toISOString() : null;
      const checkOut = record.checkOutTime ? record.checkOutTime.toISOString() : null;
      const hoursWorked = record.workHours ? Number(record.workHours) : "--";
      let statusStr = record.status;
      if (statusStr === "PRESENT" && Number(hoursWorked) < 9) {
        if (record.checkOutTime) {
          statusStr = "EARLY_CHECKOUT" as any;
        }
      }

      return {
        id: record.id,
        employeeName: `${record.employee.firstName} ${record.employee.lastName}`,
        date: record.date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        checkIn,
        checkOut,
        hoursWorked,
        status: statusStr,
        remarks: record.notes || "Standard Entry",
        punchHistory: Array.isArray((record as any).punchHistory) ? (record as any).punchHistory : []
      };
    });

    return { data, total, page, limit };
  }

  async getRegularizations(user?: any) {
    const where: any = {};
    if (user && !RbacGroups.ATTENDANCE_ADMINS.includes(user.role)) {
      if (['MANAGER', 'TEAM_LEAD', 'CTO', 'CEO'].includes(user.role)) {
        where.OR = [
          { employeeId: user.employeeId },
          { employee: { reportingManagerId: user.employeeId } }
        ];
      } else {
        where.employeeId = user.employeeId;
      }
    }

    const requests = await this.prisma.regularizationRequest.findMany({
      where,
      orderBy: { submittedDate: "desc" },
      include: { employee: { select: { firstName: true, lastName: true } } }
    });

    return requests.map(req => ({
      id: req.id,
      employeeId: req.employeeId,
      employeeName: `${req.employee.firstName} ${req.employee.lastName}`,
      attendanceDate: req.attendanceDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      reason: req.reason,
      correctionType: req.correctionType,
      attachmentName: req.attachmentName,
      managerStatus: req.managerStatus,
      hrStatus: req.hrStatus,
      submittedDate: req.submittedDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      comments: req.comments,
    }));
  }

  async createRegularization(employeeId: string, dto: any) {
    return this.prisma.regularizationRequest.create({
      data: {
        employeeId,
        attendanceDate: new Date(dto.attendanceDate),
        reason: dto.reason,
        correctionType: dto.correctionType,
        attachmentName: dto.attachmentName,
      }
    });
  }

  async actionRegularization(id: string, action: "APPROVE" | "REJECT", currentUser: any) {
    const statusVal = action === "APPROVE" ? "APPROVED" : "REJECTED";

    const request = await this.prisma.regularizationRequest.findUnique({
      where: { id },
      include: { employee: true }
    });

    if (!request) {
      throw new BadRequestException("Regularization request not found");
    }

    let approverRole: "MANAGER" | "HR" | null = null;

    if (RbacGroups.ATTENDANCE_ADMINS.includes(currentUser.role as any)) {
      approverRole = "HR";
    } else if (request.employee.reportingManagerId === currentUser.employeeId) {
      approverRole = "MANAGER";
    }

    if (!approverRole) {
      throw new ForbiddenException("You do not have permission to action this request.");
    }

    if (approverRole === "MANAGER") {
      return this.prisma.regularizationRequest.update({
        where: { id },
        data: { managerStatus: statusVal, comments: `Actioned by Manager (${action})` }
      });
    } else {
      const updatedReq = await this.prisma.regularizationRequest.update({
        where: { id },
        data: { hrStatus: statusVal, comments: `Actioned by HR/Admin (${action})` },
        include: { employee: true }
      });

      if (action === "APPROVE") {
        const dateStr = new Date(updatedReq.attendanceDate);
        
        // Setup 10:00 AM IST (04:30 AM UTC)
        const checkInTime = new Date(dateStr);
        checkInTime.setUTCHours(4, 30, 0, 0); 
        
        // Setup 07:00 PM IST (13:30 PM UTC)
        const checkOutTime = new Date(dateStr);
        checkOutTime.setUTCHours(13, 30, 0, 0);

        const status = updatedReq.correctionType === "WFH_MARKING" ? "WFH" : "PRESENT";

        await this.prisma.attendanceRecord.upsert({
          where: {
            employeeId_date: {
              employeeId: updatedReq.employeeId,
              date: dateStr,
            }
          },
          update: {
            status,
            workHours: 9.0,
            checkInTime,
            checkOutTime,
            isRegularized: true,
            regularizedById: currentUser.employeeId,
            notes: `Approved Correction: ${updatedReq.correctionType}`
          },
          create: {
            employeeId: updatedReq.employeeId,
            date: dateStr,
            status,
            workHours: 9.0,
            checkInTime,
            checkOutTime,
            isRegularized: true,
            regularizedById: currentUser.employeeId,
            notes: `Approved Correction: ${updatedReq.correctionType}`
          }
        });
      }

      return updatedReq;
    }
  }

  async getTeamAttendanceView(employeeId: string, dateStr: string) {
    const today = new Date(dateStr);
    today.setUTCHours(0, 0, 0, 0);

    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();

    // 1. Get unified team (HR reports + Project Members)
    const hrSubordinates = await this.prisma.employee.findMany({
      where: { reportingManagerId: employeeId, status: { not: "EXITED" } },
      select: { id: true, firstName: true, lastName: true }
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
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    const employeeMap = new Map();
    hrSubordinates.forEach((emp: any) => employeeMap.set(emp.id, emp));
    projectMembers.forEach((assignment: any) => {
      if (assignment.employee && !employeeMap.has(assignment.employeeId)) {
        employeeMap.set(assignment.employeeId, assignment.employee);
      }
    });

    const team = Array.from(employeeMap.values());
    const teamIds = team.map(emp => emp.id);

    // 2. Get today's attendance for the team
    const todayRecords = await this.prisma.attendanceRecord.findMany({
      where: {
        date: today,
        employeeId: { in: teamIds }
      },
      select: {
        id: true,
        employeeId: true,
        status: true,
        checkInTime: true,
        checkOutTime: true,
        workHours: true
      }
    });
    const recordMap = new Map(todayRecords.map(r => [r.employeeId, r]));

    // 3. Get today's leaves for the team
    const todayLeaves = await this.prisma.leaveRequest.findMany({
      where: {
        employeeId: { in: teamIds },
        startDate: { lte: today },
        endDate: { gte: today },
        status: "APPROVED"
      }
    });
    const leaveMap = new Map(todayLeaves.map(l => [l.employeeId, l]));

    // 4. Calculate KPIs
    let presentCount = 0;
    let lateCount = 0;
    let leaveCount = 0;

    const realTimeStatus = team.map(emp => {
      const record = recordMap.get(emp.id);
      const leave = leaveMap.get(emp.id);
      let status = "Absent";
      
      if (leave) {
        status = "On leave";
        leaveCount++;
      } else if (record) {
        status = record.status === "LATE" ? "Late" : "Present";
        if (status === "Present") presentCount++;
        if (status === "Late") lateCount++;
      }

      let hoursStr = "-";
      if (record?.checkInTime && !record?.checkOutTime) {
        const diffMs = Date.now() - record.checkInTime.getTime();
        const hrs = Math.floor(diffMs / 3600000);
        const mins = Math.floor((diffMs % 3600000) / 60000);
        hoursStr = `${hrs}h ${mins}m so far`;
      } else if (record?.workHours) {
        hoursStr = `${record.workHours}h (checked out)`;
      }

      const checkInFormat = record?.checkInTime ? new Date(record.checkInTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) : "-";
      const checkOutFormat = record?.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) : "-";

      return {
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        initials: `${emp.firstName.charAt(0)}${emp.lastName.charAt(0)}`.toUpperCase(),
        status,
        checkIn: checkInFormat,
        checkOut: checkOutFormat,
        hours: hoursStr
      };
    });

    // 5. Monthly Heatmap Data
    const monthlyRecords = await this.prisma.attendanceRecord.findMany({
      where: {
        date: { gte: firstDay, lte: lastDay },
        employeeId: { in: teamIds }
      },
      select: {
        employeeId: true,
        date: true,
        status: true
      }
    });

    const monthlyLeaves = await this.prisma.leaveRequest.findMany({
      where: {
        employeeId: { in: teamIds },
        status: "APPROVED",
        OR: [
          { startDate: { gte: firstDay, lte: lastDay } },
          { endDate: { gte: firstDay, lte: lastDay } },
          { startDate: { lte: firstDay }, endDate: { gte: lastDay } }
        ]
      }
    });

    const memberMonthlyMap = new Map();
    team.forEach(emp => {
      // prefill days with absent or future depending on if it's in the future
      const days = Array.from({ length: daysInMonth }, (_, i) => {
        const d = new Date(today.getFullYear(), today.getMonth(), i + 1);
        if (d > new Date()) return "FUTURE";
        // Check weekends
        const dayOfWeek = d.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) return "WEEKEND";
        return "ABSENT";
      });
      memberMonthlyMap.set(emp.id, days);
    });

    // Populate Leaves
    monthlyLeaves.forEach(leave => {
      const days = memberMonthlyMap.get(leave.employeeId);
      if (days) {
        const lStart = new Date(leave.startDate);
        const lEnd = new Date(leave.endDate);
        for (let d = new Date(lStart); d <= lEnd; d.setDate(d.getDate() + 1)) {
          if (d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
            const dayIdx = d.getDate() - 1;
            if (days[dayIdx] !== "FUTURE") days[dayIdx] = "LEAVE";
          }
        }
      }
    });

    // Populate Attendance Records
    monthlyRecords.forEach(record => {
      const days = memberMonthlyMap.get(record.employeeId);
      if (days) {
        const dayIdx = new Date(record.date).getDate() - 1;
        if (days[dayIdx] !== "FUTURE") {
          days[dayIdx] = record.status === "LATE" ? "LATE" : "PRESENT";
        }
      }
    });

    const heatmapData = team.map(emp => ({
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      initials: `${emp.firstName.charAt(0)}${emp.lastName.charAt(0)}`.toUpperCase(),
      days: memberMonthlyMap.get(emp.id)
    }));

    return {
      kpis: {
        directReportsCount: team.length,
        presentCount,
        lateCount,
        leaveCount
      },
      realTimeStatus,
      heatmapData
    };
  }
}
