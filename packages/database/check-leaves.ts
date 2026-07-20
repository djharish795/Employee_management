import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'divya@naprocs.in' }});
  if (!user || !user.employeeId) return console.log('no user');
  const leaves = await prisma.leaveRequest.findMany({ where: { employeeId: user.employeeId } });
  console.log('Leaves count:', leaves.length);
  if (leaves.length > 0) {
    console.log(JSON.stringify(leaves.slice(0, 2), null, 2));
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
