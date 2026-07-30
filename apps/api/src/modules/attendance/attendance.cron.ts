import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../../prisma/prisma.service";
import { RedisService } from "../../redis/redis.service";
import { InAppNotificationService } from "../notifications/in-app.service";

@Injectable()
export class AttendanceCronService {
  private readonly logger = new Logger(AttendanceCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly inApp: InAppNotificationService
  ) {}

  @Cron("59 23 * * *", { timeZone: "Asia/Kolkata" })
  async autoCheckoutMidnight() {
    this.logger.log("Running Midnight Auto-Checkout and Absence/Leave marking...");
    await this.processMidnightJob();
  }

  async forceAutoCheckout() {
    this.logger.log("Executing forced auto-checkout...");
    await this.processMidnightJob();
  }

  @Cron("0 19 * * *", { timeZone: "Asia/Kolkata" })
  async autoCheckout1900() {
    this.logger.log("Running 19:00 Auto-Checkout for active shifts...");
    await this.process1900Checkout();
  }

  private async process1900Checkout() {
    try {
      const today = new Date();
      // Ensure we only affect today's records
      const isoDateStr = today.toISOString().split("T")[0]; 

      // Find all employees currently IN or BREAK in Redis
      const keys = await this.redis.getClient().keys("attendance_state:*");
      for (const key of keys) {
        const stateStr = await this.redis.getClient().get(key);
        if (!stateStr) continue;
        const state = JSON.parse(stateStr);

        // If they are IN or BREAK and the shift date matches today's date prefix
        if ((state.state === "IN" || state.state === "BREAK") && state.shiftDate && state.shiftDate.startsWith(isoDateStr)) {
          const employeeId = key.split(":")[1];
          const shiftDate = new Date(state.shiftDate);
          
          const record = await this.prisma.attendanceRecord.findUnique({
            where: { employeeId_date: { employeeId, date: shiftDate } }
          });

          if (record && !record.checkOutTime) {
            const checkoutTime = new Date(shiftDate);
            checkoutTime.setUTCHours(13, 30, 0, 0); // 19:00 IST is 13:30 UTC

            const now = checkoutTime.getTime();
            let offset = state.offset || 0;
            let overtimeOffset = state.overtimeOffset || 0;
            
            if (state.state === "IN" || state.state === "BREAK") {
              const elapsed = Math.floor((now - state.startTime) / 1000);
              offset += elapsed; // Both IN and BREAK count towards work hours
            }

            let workHoursDecimal = offset / 3600;

            const approvedHalfDay = await this.prisma.leaveRequest.findFirst({
              where: {
                employeeId,
                startDate: { lte: shiftDate },
                endDate: { gte: shiftDate },
                status: 'APPROVED',
                isHalfDay: true
              }
            });
            const thresholdSeconds = approvedHalfDay ? 16200 : 32400;

            let finalStatus = record.status === "WFH" ? "WFH" : "PRESENT";
            // Note: 19:00 is standard checkout, so it shouldn't be EARLY_CHECKOUT unless threshold missed.
            if (offset < thresholdSeconds && finalStatus !== "WFH") {
              finalStatus = "EARLY_CHECKOUT";
            }

            let punchHistory = record.punchHistory ? (record.punchHistory as any[]) : [];
            punchHistory.push({ action: "OUT", time: checkoutTime.toISOString(), system: true });

            let breakHistory = record.breakHistory ? (record.breakHistory as any[]) : [];
            if (state.state === "BREAK" && record.currentBreakStartTime) {
               if (breakHistory.length > 0 && breakHistory[breakHistory.length - 1].end === null) {
                 breakHistory[breakHistory.length - 1].end = checkoutTime.toISOString();
               }
            }

            await this.prisma.attendanceRecord.update({
              where: { id: record.id },
              data: {
                checkOutTime: checkoutTime,
                workHours: workHoursDecimal,
                status: finalStatus as any,
                punchHistory: punchHistory as any,
                breakHistory: breakHistory as any,
                currentBreakStartTime: null,
                notes: (record.notes ? record.notes + "\n" : "") + "System Auto-Checkout at 7:00 PM."
              }
            });

            state.state = "OUT";
            state.startTime = checkoutTime.getTime();
            state.offset = offset;
            state.overtimeOffset = overtimeOffset;
            await this.redis.setJson(key, state, 60 * 60 * 24);

            this.inApp.broadcastEvent('attendance.punched', { employeeId, type: "OUT" });
            
            // Notify user
            await this.prisma.notification.create({
              data: {
                recipientId: employeeId,
                title: "Shift Ended",
                body: "You have been automatically checked out as your shift ended at 7:00 PM.",
                type: "SYSTEM_ALERT"
              }
            });
          }
        }
      }
      this.logger.log("19:00 Auto-Checkout completed.");
    } catch (err) {
      this.logger.error("Failed 19:00 Auto-Checkout", err);
    }
  }

  private async processMidnightJob() {
    try {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const activeEmployees = await this.prisma.employee.findMany({ 
        where: { status: 'ACTIVE' },
        include: { user: true }
      });
      const approvedLeaves = await this.prisma.leaveRequest.findMany({
        where: {
          status: 'APPROVED',
          isHalfDay: false,
          startDate: { lte: today },
          endDate: { gte: today }
        }
      });
      
      const leaveEmployeeIds = new Set(approvedLeaves.map(l => l.employeeId));

      const todayRecords = await this.prisma.attendanceRecord.findMany({
        where: { date: today }
      });
      const punchedInEmployeeIds = new Set(todayRecords.map(r => r.employeeId));

      const missingLeaveEmpIds = activeEmployees
        .filter(emp => !punchedInEmployeeIds.has(emp.id) && leaveEmployeeIds.has(emp.id))
        .map(emp => emp.id);

      if (missingLeaveEmpIds.length > 0) {
        const { chunkArray } = await import('../../common/constants/db-batch.constants');
        const chunks = chunkArray(missingLeaveEmpIds);
        
        for (const chunk of chunks) {
          await Promise.all(chunk.map(empId => 
            this.prisma.attendanceRecord.upsert({
              where: { employeeId_date: { employeeId: empId, date: today } },
              update: { status: 'ON_LEAVE' },
              create: {
                employeeId: empId,
                date: today,
                status: 'ON_LEAVE',
                workHours: 0,
                isRegularized: false
              }
            })
          ));
        }
      }
      let markedLeaveCount = missingLeaveEmpIds.length;

      this.logger.log(`Marked ${markedLeaveCount} employees as ON_LEAVE.`);

      // Handle ABSENT (No punches, no full-day leave) or HOLIDAY
      const isHoliday = await this.prisma.companyHoliday.findFirst({
        where: { date: today }
      });
      const noShowStatus = isHoliday ? 'HOLIDAY' : 'ABSENT';
      const noShowNotes = isHoliday ? 'System Auto-Mark: Company Holiday' : 'System Auto-Mark: No show';

      const noShowEmployees = activeEmployees.filter(emp => 
        emp.user?.role !== 'CEO' && 
        emp.user?.role !== 'CTO' && 
        !punchedInEmployeeIds.has(emp.id) && 
        !leaveEmployeeIds.has(emp.id)
      );

      if (noShowEmployees.length > 0) {
        const absentIds = noShowEmployees.map(e => e.id);
        const { chunkArray } = await import('../../common/constants/db-batch.constants');
        const chunks = chunkArray(absentIds);
        
        for (const chunk of chunks) {
          await Promise.all(chunk.map(empId => 
            this.prisma.attendanceRecord.upsert({
              where: { employeeId_date: { employeeId: empId, date: today } },
              update: { status: noShowStatus as any },
              create: {
                employeeId: empId,
                date: today,
                status: noShowStatus as any,
                workHours: 0,
                isRegularized: false,
                notes: noShowNotes
              }
            })
          ));
        }
        this.logger.log(`Marked ${absentIds.length} employees as ABSENT.`);
      }

      const openRecords = await this.prisma.attendanceRecord.findMany({
        where: { checkInTime: { not: null }, checkOutTime: null, date: today }
      });

      const { chunkArray } = await import('../../common/constants/db-batch.constants');
      const recordChunks = chunkArray(openRecords);

      for (const chunk of recordChunks) {
        await Promise.all(chunk.map(async (record) => {
          const midnight = new Date(record.date);
          midnight.setUTCHours(23, 59, 59, 999);
          const checkInTime = record.checkInTime!.getTime();
          const checkOutTime = midnight.getTime();
          const totalElapsedSeconds = Math.floor((checkOutTime - checkInTime) / 1000) - (record.totalBreakSeconds || 0);
          const workHours = Math.max(0, totalElapsedSeconds / 3600);

          await this.prisma.attendanceRecord.update({
            where: { id: record.id },
            data: {
              checkOutTime: midnight,
              workHours: Number(workHours.toFixed(2)),
              isRegularized: false,
              notes: (record.notes ? record.notes + "\n" : "") + "System Auto-Checkout at midnight. Requires HR Regularization."
            }
          });
          const redisKey = `attendance_state:${record.employeeId}`;
          await this.redis.del(redisKey);
        }));
      }
      this.logger.log(`Auto-checked out ${openRecords.length} employees.`);
      this.logger.log("Midnight job completed.");
    } catch (error) {
      this.logger.error("Failed to run midnight job", error);
    }
  }
}
