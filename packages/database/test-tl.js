const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const tl = await prisma.employee.findFirst({ where: { department: { name: 'Engineering' } } });
  console.log(tl);
}
run();
