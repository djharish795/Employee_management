const { PrismaClient } = require('./packages/database');
const prisma = new PrismaClient();

async function main() {
  const emp = await prisma.employee.findUnique({ where: { employeeId: 'NAP/TR/013' } });
  console.log('Imthiyaz:', emp);
  if (!emp) return;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const record = await prisma.attendanceRecord.findUnique({ where: { employeeId_date: { employeeId: emp.id, date: today } } });
  console.log('Attendance:', record);
  
  const leaves = await prisma.leaveRequest.findMany({ where: { employeeId: emp.id } });
  console.log('Leaves:', leaves);
}

main().catch(console.error).finally(() => prisma.$disconnect());
