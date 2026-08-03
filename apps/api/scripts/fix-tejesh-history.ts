import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixTejeshPunchHistory() {
  try {
    const tejesh = await prisma.employee.findFirst({
      where: {
        firstName: { contains: 'tejesh', mode: 'insensitive' }
      }
    });

    if (!tejesh) {
      console.log('Tejesh not found');
      return;
    }
    
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

    const checkInTime = new Date(isoString);
    checkInTime.setUTCHours(4, 30, 0, 0); // 10:00 AM IST

    const checkOutTime = new Date(isoString);
    checkOutTime.setUTCHours(13, 30, 0, 0); // 7:00 PM IST

    await prisma.attendanceRecord.update({
      where: {
        employeeId_date: {
          employeeId: tejesh.id,
          date: shiftDate
        }
      },
      data: {
        punchHistory: [
          { action: 'IN', time: checkInTime.toISOString(), system: true },
          { action: 'OUT', time: checkOutTime.toISOString(), system: true }
        ]
      }
    });

    console.log('Updated punchHistory for Tejesh to match 10 AM and 7 PM');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

fixTejeshPunchHistory();
