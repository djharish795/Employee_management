import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const emps = await prisma.employee.findMany({ include: { user: true, designation: true } });
  const cto = emps.find(e => e.user?.role === 'CTO');
  console.log('CTO Designation:', cto?.designation?.title);
  const om = emps.find(e => e.user?.role === 'OM');
  console.log('OM Designation:', om?.designation?.title);
}

main().finally(() => prisma.$disconnect());
