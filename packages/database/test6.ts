import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const om = await prisma.employee.findUnique({ where: { id: 'cmr1mlmf5000d3y1wiic84xq3' } });
  const hr = await prisma.employee.findUnique({ where: { id: 'cmr1mln00001t3y1wzqsnibt9' }, include: { user: true } });
  
  const hrm = await prisma.user.findUnique({ where: { email: 'hr@naprocs.in' }, include: { employee: true } });

  console.log('OM:', om?.officialEmail);
  console.log('HRE ID assigned:', hr?.id, 'Email:', hr?.officialEmail, 'User Email:', hr?.user?.email);
  console.log('Real HR@naprocs.in ID:', hrm?.employee?.id);
}
main().finally(() => prisma.$disconnect());
