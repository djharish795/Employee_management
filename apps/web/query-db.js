const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const employee = await prisma.employee.findFirst({
    where: { firstName: 'Salman' }
  });
  
  if (!employee) {
    console.log("Salman not found");
    return;
  }
  
  console.log("Employee ID:", employee.id);
  
  const todayDate = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric', month: '2-digit', day: '2-digit'
  });
  const parts = formatter.formatToParts(todayDate);
  const dateObj = {};
  for (const part of parts) dateObj[part.type] = part.value;
  const isoString = `${dateObj.year}-${dateObj.month}-${dateObj.day}T00:00:00.000Z`;
  
  const record = await prisma.attendanceRecord.findFirst({
    where: { employeeId: employee.id, date: new Date(isoString) }
  });
  
  console.log("Today Record:", record);
  
  const recentRecords = await prisma.attendanceRecord.findMany({
    where: { employeeId: employee.id },
    orderBy: { date: 'desc' },
    take: 3
  });
  
  console.log("Recent records:", recentRecords);
}

main().catch(console.error).finally(() => prisma.$disconnect());
