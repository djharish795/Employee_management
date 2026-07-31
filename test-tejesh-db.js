const fs = require('fs');
const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const emp = await prisma.employee.findFirst({
    where: { firstName: { contains: 'Tejesh', mode: 'insensitive' } }
  });

  if (!emp) {
    fs.writeFileSync('tejesh-db.txt', 'Not found');
    return;
  }

  const reqs = await prisma.leaveRequest.findMany({
    where: { employeeId: emp.id, status: { in: ['APPROVED', 'PENDING'] } }
  });

  const bals = await prisma.leaveBalance.findMany({
    where: { employeeId: emp.id },
    include: { leaveType: true }
  });

  fs.writeFileSync('tejesh-db.txt', JSON.stringify({ emp: emp.employeeId, reqs, bals }, null, 2));
  console.log('Done');
}

main().then(() => prisma.$disconnect()).catch(console.error);
