import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const emps = await prisma.employee.findMany({
    select: { id: true, firstName: true, lastName: true, designation: { select: { title: true } }, department: { select: { name: true, id: true } } }
  });
  console.log(JSON.stringify(emps, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
