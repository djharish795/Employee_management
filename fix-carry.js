const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const clType = await prisma.leaveType.findUnique({ where: { code: 'CL' } });
  const optType = await prisma.leaveType.findUnique({ where: { code: 'OPTIONAL' } });

  // Cap CL carriedOver at 7
  await prisma.leaveBalance.updateMany({
    where: { leaveTypeId: clType.id, carriedOver: { gt: 7 } },
    data: { carriedOver: 7 }
  });

  // Zero out OPTIONAL carriedOver
  await prisma.leaveBalance.updateMany({
    where: { leaveTypeId: optType.id },
    data: { carriedOver: 0 }
  });

  console.log('Fixed DB limits!');
}

main().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); });
