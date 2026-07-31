const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const bals = await prisma.leaveBalance.findMany({
    where: { used: 3 },
    include: { leaveType: true, employee: true }
  });

  for (const b of bals) {
    console.log(b.employee.employeeId, b.leaveType.code, b.used);
  }
}

main().then(() => prisma.$disconnect()).catch(console.error);
