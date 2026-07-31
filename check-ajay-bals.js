const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const ajay = await prisma.employee.findFirst({ where: { firstName: { contains: 'Ajay' } } });
  if (!ajay) return;

  const bals = await prisma.leaveBalance.findMany({
    where: { employeeId: ajay.id },
    include: { leaveType: true }
  });

  console.log("Ajay Balances:");
  bals.forEach(b => {
    console.log(`- ${b.leaveType.code}: used=${b.used}, allocated=${b.allocated}`);
  });
}

main().then(() => prisma.$disconnect()).catch(console.error);
