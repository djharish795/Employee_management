import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const cto = await prisma.employee.findFirst({ where: { user: { role: 'CTO' } }, include: { user: true, designation: true } });
  console.log(cto);
}

main().finally(() => process.exit(0));
