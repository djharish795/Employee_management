const fs = require('fs');
const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const emp = await prisma.employee.findFirst({
    where: { firstName: { contains: 'Ajay' } }
  });
  if (!emp) return;

  const reqs = await prisma.leaveRequest.findMany({
    where: { employeeId: emp.id },
    include: { leaveType: true }
  });
  
  for (const r of reqs) {
    console.log(`${r.startDate.toISOString().split('T')[0]} to ${r.endDate.toISOString().split('T')[0]} | Type: ${r.leaveType.code} | Total: ${r.totalDays} | Paid: ${r.paidDays} | Unpaid: ${r.unpaidDays}`);
  }
}

main().then(() => prisma.$disconnect()).catch(console.error);
