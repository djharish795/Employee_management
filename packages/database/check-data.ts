import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const records = await prisma.attendanceRecord.groupBy({
    by: ['date'],
    _count: {
      id: true
    }
  });
  
  console.log("Attendance counts by date:");
  records.forEach(r => {
    console.log(`${r.date}: ${r._count.id} records`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
