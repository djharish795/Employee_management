import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../../prisma/prisma.service";
import { RedisService } from "../../redis/redis.service";

@Injectable()
export class AttendanceCronService {
  private readonly logger = new Logger(AttendanceCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
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
