import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'divya@naprocs.in' }});
  if (!user || !user.employeeId) return console.log('no user or no employee id');
  const logs = await prisma.attendanceRecord.findMany({ where: { employeeId: user.employeeId } });
  console.log('Logs count:', logs.length);
  if (logs.length > 0) {
    console.log(JSON.stringify(logs.slice(0, 2), null, 2));
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
