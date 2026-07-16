import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Database Summary Counts:');
  console.log('------------------------');
  
  const empCount = await prisma.employee.count();
  const userCount = await prisma.user.count();
  const deptCount = await prisma.department.count();
  const desigCount = await prisma.designation.count();
  const leaveBalanceCount = await prisma.leaveBalance.count();
  const attendanceCount = await prisma.attendanceRecord.count();
  
  console.log(`Employees: ${empCount}`);
  console.log(`Users: ${userCount}`);
  console.log(`Departments: ${deptCount}`);
  console.log(`Designations: ${desigCount}`);
  console.log(`Leave Balances: ${leaveBalanceCount}`);
  console.log(`Attendance Records: ${attendanceCount}`);
}

main().finally(() => prisma.$disconnect());
