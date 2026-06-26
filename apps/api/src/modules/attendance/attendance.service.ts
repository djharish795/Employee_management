import { Injectable, BadRequestException } from "@nestjs/common";
import { RedisService } from "../../redis/redis.service";
import { PrismaService } from "../../prisma/prisma.service";
import { PunchDto } from "./dto/punch.dto";

@Injectable()
export class AttendanceService {
  constructor(
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  private getRedisKey(employeeId: string): string {
    return `attendance_state:${employeeId}`;
  }

  private getTodayUTC(): Date {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  private async getState(employeeId: string) {
    const key = this.getRedisKey(employeeId);
    let state = await this.redis.getJson<any>(key);
    const today = this.getTodayUTC();

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

    const key = this.getRedisKey(employeeId);
    let state = await this.getState(employeeId);
    const now = Date.now();
    const today = this.getTodayUTC();

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
        await this.prisma.attendanceRecord.update({
          where: { employeeId_date: { employeeId, date: shiftDate } },
          data: {
            totalBreakSeconds: { increment: breakElapsed },
            currentBreakStartTime: null
          } as any
        }).catch(() => {}); // Ignore if DB record doesn't exist yet (edge case)
      }

      state.state = "IN";
      state.startTime = now;
      await this.redis.setJson(key, state, 60 * 60 * 24); // 24 hours

      if (isFirstPunch) {
        // Upsert first punch. Update block explicitly omits checkInTime to prevent overwriting
        // original checkIn on subsequent Redis-flushed false first punches.
        await this.prisma.attendanceRecord.upsert({
          where: { employeeId_date: { employeeId, date: shiftDate } },
          update: { status: "PRESENT", checkInIp: ipAddress },
          create: {
            employeeId,
            date: shiftDate,
            checkInTime: new Date(now),
            status: "PRESENT",
            isRegularized: false,
            checkInIp: ipAddress,
            workHours: 0,
          },
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
      await this.prisma.attendanceRecord.update({
        where: { employeeId_date: { employeeId, date: shiftDate } },
        data: { currentBreakStartTime: new Date(now) } as any
      }).catch(() => {});

      return state;
    }

    if (dto.action === "OUT") {
      if (state.state === "OUT") throw new BadRequestException("Already punched out");
      
      if (state.state === "IN") {
        const elapsed = Math.floor((now - state.startTime) / 1000);
        state.offset += elapsed;
      }
      
      const shiftDate = state.shiftDate ? new Date(state.shiftDate) : today;

      state.state = "OUT";
      state.startTime = now;
      await this.redis.setJson(key, state, 60 * 60 * 24);
      
      const workHoursDecimal = state.offset / 3600;
      // Threshold: 9 hours = 32400 seconds for early checkout
      const finalStatus = state.offset < 32400 ? "HALF_DAY" : "PRESENT";
      
      await this.prisma.attendanceRecord.upsert({
        where: { employeeId_date: { employeeId, date: shiftDate } },
        update: {
          checkOutTime: new Date(now),
          workHours: workHoursDecimal,
          status: finalStatus as any,
        },
        create: {
          employeeId,
          date: shiftDate,
          checkInTime: new Date(state.startTime),
          checkOutTime: new Date(now),
          status: finalStatus as any,
          isRegularized: false,
          workHours: workHoursDecimal,
        }
      }).catch(err => {
        console.error(`Check-out upsert failed for employee ${employeeId}:`, err);
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
      remarks: record.notes || ""
    }));

    return { data: mappedData, total, page, limit };
  }

  async getMyKpis(employeeId: string) {
    if (!employeeId) throw new BadRequestException("Employee ID is required");
    
    const today = this.getTodayUTC();
    const startOfMonth = new Date(today);
    startOfMonth.setUTCDate(1);

    // 1. Present Today
    const todayRecord = await this.prisma.attendanceRecord.findUnique({
      where: { employeeId_date: { employeeId, date: today } },
    });
    const presentToday = todayRecord && ["PRESENT", "WFH", "HALF_DAY"].includes(todayRecord.status) ? 1 : 0;

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
      if (["PRESENT", "WFH", "HALF_DAY", "LATE", "EARLY_CHECKOUT"].includes(statusStr)) {
        daysPresent += statusStr === "HALF_DAY" ? 0.5 : 1;
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

    // 4. Weekly Trends (Last 7 days)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);

    const weeklyRecords = await this.prisma.attendanceRecord.findMany({
      where: {
        employeeId,
        date: { gte: sevenDaysAgo, lte: today }
      },
      orderBy: { date: "asc" }
    });

    const weeklyTrends = [];
    for (let d = new Date(sevenDaysAgo); d <= today; d.setUTCDate(d.getUTCDate() + 1)) {
      const isoDate = d.toISOString().split("T")[0];
      const record = weeklyRecords.find(r => r.date.toISOString().split("T")[0] === isoDate);
      weeklyTrends.push({
        date: isoDate,
        hours: record?.workHours ? Number(record.workHours) : 0,
      });
    }

    // Calculate this week hours
    const thisWeekHours = weeklyTrends.reduce((sum, day) => sum + day.hours, 0);

    return {
      presentToday,
      attendanceRate: Number(attendanceRate.toFixed(1)),
      avgHoursWorked: Number(avgHoursWorked.toFixed(1)),
      lateArrivals,
      wfhDays,
      leaveDays: holidaysAndLeaves,
      thisWeekHours: Number(thisWeekHours.toFixed(1)),
      thisMonthDays: daysPresent,
      weeklyTrends
    };
  }
}
