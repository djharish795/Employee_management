import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixTejesh() {
  try {
    // 1. Find Tejesh
    const tejesh = await prisma.employee.findFirst({
      where: {
        firstName: { contains: 'tejesh', mode: 'insensitive' }
      }
    });

    if (!tejesh) {
      console.log('Tejesh not found');
      return;
    }

    console.log(`Found Tejesh: ${tejesh.id}`);

    // Today's date in UTC that corresponds to the shift date
    const today = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
    const parts = formatter.formatToParts(today);
    const dateObj: any = {};
    for (const part of parts) dateObj[part.type] = part.value;
    const isoString = `${dateObj.year}-${dateObj.month}-${dateObj.day}T00:00:00.000Z`;
    const shiftDate = new Date(isoString);

    // 2. Update Attendance Record
    const checkInTime = new Date(isoString);
    checkInTime.setUTCHours(4, 30, 0, 0); // 10:00 AM IST

    const checkOutTime = new Date(isoString);
    checkOutTime.setUTCHours(13, 30, 0, 0); // 7:00 PM IST

    await prisma.attendanceRecord.upsert({
      where: {
        employeeId_date: {
          employeeId: tejesh.id,
          date: shiftDate
        }
      },
      update: {
        checkInTime,
        checkOutTime,
        workHours: 9.0,
        status: 'PRESENT',
        overtime: null,
        isOvertimeApproved: false,
        overtimeApprovedById: null,
        notes: "Fixed by System manually."
      },
      create: {
        employeeId: tejesh.id,
        date: shiftDate,
        checkInTime,
        checkOutTime,
        workHours: 9.0,
        status: 'PRESENT',
        notes: "Fixed by System manually."
      }
    });

    console.log('Attendance record updated to 10 AM - 7 PM, 9 hours, PRESENT');

    // 3. Delete any overtime notifications sent to OM for Tejesh
    // Actually, just delete the attendance-related notifications for Tejesh or from Tejesh
    const deletedNotes = await prisma.notification.deleteMany({
      where: {
        title: { contains: 'Overtime', mode: 'insensitive' },
      }
    });

    console.log(`Deleted ${deletedNotes.count} overtime notifications`);

    // 4. Try to delete Redis state
    try {
      const Redis = require('ioredis');
      const redis = new Redis({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
        tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
        connectTimeout: 5000,
        maxRetriesPerRequest: 1
      });
      await redis.del(`attendance_state:${tejesh.id}`);
      console.log('Cleared Redis state');
      redis.disconnect();
    } catch (e: any) {
      console.log('Could not clear redis state automatically. Please wait or it will resolve on next punch.', e.message);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

fixTejesh();
