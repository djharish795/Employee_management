const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEmployees() {
  const harish = await prisma.employee.findUnique({ where: { officialEmail: 'harish@naprocs.in' } });
  const imthiyaz = await prisma.employee.findUnique({ where: { officialEmail: 'imthiyaz@naprocs.in' } });
  console.log("Harish:", harish);
  console.log("Imthiyaz:", imthiyaz);
}
checkEmployees().finally(() => prisma.$disconnect());
