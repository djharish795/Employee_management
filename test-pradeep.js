const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const emp = await prisma.employee.findUnique({ where: { id: 'cmr1mlm7s00013y1w8q1tsyqe' } });
  console.log(emp);
}
main().finally(() => prisma.$disconnect());
