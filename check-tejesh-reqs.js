const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const emp = await prisma.employee.findUnique({
    where: { employeeId: 'NAP/TR/002' }
  });

  if (!emp) {
    console.log("Not found");
    return;
  }

  const reqs = await prisma.leaveRequest.findMany({
    where: { employeeId: emp.id, status: 'APPROVED' },
    include: { leaveType: true }
  });

  let sum = 0;
  for (const r of reqs) {
    console.log(`${r.startDate.toISOString().split('T')[0]} to ${r.endDate.toISOString().split('T')[0]} | Type: ${r.leaveType.code} | Paid: ${r.paidDays}`);
    sum += Number(r.paidDays);
  }
  
  console.log("TOTAL PAID DAYS FOR NAP/TR/002:", sum);
}

main().then(() => prisma.$disconnect()).catch(console.error);
