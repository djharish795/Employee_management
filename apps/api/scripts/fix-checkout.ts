import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

async function fix() {
  const keys = await redis.keys("attendance_state:*");
  const today = new Date();
  const todayLocal = today.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

  for (const key of keys) {
    const stateStr = await redis.get(key);
    if (!stateStr) continue;
    const state = JSON.parse(stateStr);

    const shiftDateObj = new Date(state.shiftDate);
    const shiftDateLocal = state.shiftDate ? shiftDateObj.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) : null;

    if ((state.state === "IN" || state.state === "BREAK") && state.shiftDate && shiftDateLocal === todayLocal) {
      const employeeId = key.split(":")[1];
      const shiftDate = new Date(state.shiftDate);
      
      const record = await prisma.attendanceRecord.findUnique({
        where: { employeeId_date: { employeeId, date: shiftDate } }
      });

      if (record && !record.checkOutTime) {
        console.log(`Checking out ${employeeId}...`);
        const checkoutTime = new Date(shiftDate);
        checkoutTime.setUTCHours(13, 30, 0, 0); // 19:00 IST is 13:30 UTC

        const now = checkoutTime.getTime();
        let offset = state.offset || 0;
        let overtimeOffset = state.overtimeOffset || 0;
        
        if (state.state === "IN" || state.state === "BREAK") {
          const elapsed = Math.floor((now - state.startTime) / 1000);
          offset += elapsed; 
        }

        const approvedHalfDay = await prisma.leaveRequest.findFirst({
          where: {
            employeeId,
            startDate: { lte: shiftDate },
            endDate: { gte: shiftDate },
            status: 'APPROVED',
            isHalfDay: true
          }
        });
        const thresholdSeconds = (approvedHalfDay ? 16200 : 32400) - 59; 
        
        let effectiveSeconds = offset;
        if (effectiveSeconds >= thresholdSeconds && effectiveSeconds < (approvedHalfDay ? 16200 : 32400)) {
          effectiveSeconds = approvedHalfDay ? 16200 : 32400;
        }
        let workHoursDecimal = effectiveSeconds / 3600;

        let finalStatus = record.status === "WFH" ? "WFH" : "PRESENT";
        if (offset < thresholdSeconds && finalStatus !== "WFH") {
          finalStatus = "EARLY_CHECKOUT";
        }

        let punchHistory = record.punchHistory ? (record.punchHistory as any[]) : [];
        punchHistory.push({ action: "OUT", time: checkoutTime.toISOString(), system: true });

        await prisma.attendanceRecord.update({
          where: { id: record.id },
          data: {
            checkOutTime: checkoutTime,
            workHours: workHoursDecimal,
            status: finalStatus as any,
            punchHistory: punchHistory as any,
            currentBreakStartTime: null,
            notes: (record.notes ? record.notes + "\n" : "") + "System Auto-Checkout at 7:00 PM."
          }
        });

        state.state = "OUT";
        state.startTime = checkoutTime.getTime();
        state.offset = offset;
        state.overtimeOffset = overtimeOffset;
        await redis.set(key, JSON.stringify(state), "EX", 60 * 60 * 24);
      }
    }
  }
  console.log("Done");
  process.exit(0);
}

fix();
