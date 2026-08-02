import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting historical weekend attendance fix...');
  const absentRecords = await prisma.attendanceRecord.findMany({
    where: {
      status: 'ABSENT'
    }
  });

  let updatedCount = 0;
  for (const record of absentRecords) {
    const day = new Date(record.date).getDay();
    // 0 = Sunday, 6 = Saturday
    if (day === 0 || day === 6) {
      await prisma.attendanceRecord.update({
        where: { id: record.id },
        data: {
          status: 'HOLIDAY',
          notes: (record.notes ? record.notes + '\n' : '') + 'System Auto-Mark: Weekend (Off) [Retroactive Fix]'
        }
      });
      updatedCount++;
    }
  }

  console.log(`Successfully updated ${updatedCount} historical weekend records from ABSENT to HOLIDAY.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
