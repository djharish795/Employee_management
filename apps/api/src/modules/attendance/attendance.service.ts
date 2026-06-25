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

  async getTodayStatus(employeeId: string) {
    if (!employeeId) throw new BadRequestException("Employee ID is required");
    
    const state = await this.redis.getJson<any>(this.getRedisKey(employeeId));
    if (!state) {
      return { state: "OUT", startTime: 0, offset: 0, shiftDate: null };
    }
    return state;
  }

  async punch(employeeId: string, dto: PunchDto, ipAddress: string) {
    if (!employeeId) throw new BadRequestException("Employee ID is required");

    const key = this.getRedisKey(employeeId);
    let state = await this.redis.getJson<any>(key) || { state: "OUT", startTime: 0, offset: 0, shiftDate: null };
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
      
      await this.prisma.attendanceRecord.update({
        where: { employeeId_date: { employeeId, date: shiftDate } },
        data: {
          checkOutTime: new Date(now),
          workHours: workHoursDecimal,
        },
      }).catch(err => {
        // If redis shiftDate gets corrupted or out of sync, log and fallback gracefully
        console.error(`Midnight crossover update failed for employee ${employeeId}:`, err);
        throw new BadRequestException("Failed to finalize shift. Active record missing.");
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
    
    monthlyRecords.forEach(record => {
      if (record.workHours) {
        totalHours += Number(record.workHours);
      }
      if (["PRESENT", "WFH", "HALF_DAY"].includes(record.status)) {
        daysPresent += record.status === "HALF_DAY" ? 0.5 : 1;
      }
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

    return {
      presentToday,
      attendanceRate: Number(attendanceRate.toFixed(1)),
      avgHoursWorked: Number(avgHoursWorked.toFixed(1)),
      weeklyTrends
    };
  }
}
