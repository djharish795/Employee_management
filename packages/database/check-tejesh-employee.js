const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTejesh() {
  const tejesh = await prisma.employee.findUnique({ where: { officialEmail: 'tejesh@naprocs.in' } });
  console.log("Tejesh:", tejesh);
}
checkTejesh().finally(() => prisma.$disconnect());
