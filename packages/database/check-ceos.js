const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const ceos = await prisma.user.findMany({ where: { role: 'CEO' }, include: { employee: true } });
  console.log('CEOs:', ceos.map(c => ({ id: c.id, email: c.email, employeeId: c.employee?.id })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
