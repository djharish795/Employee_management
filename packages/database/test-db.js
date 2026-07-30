const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function test() {
  const e = await prisma.employee.findUnique({ where: { id: 'cmruoh6n0000djpd1a741bk5l' }, include: { user: true } });
  console.log(e.user.role);
}
test().catch(console.error).finally(() => prisma.$disconnect());
