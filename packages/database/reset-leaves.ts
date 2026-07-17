import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Delete all leave requests so the history is clean
  await prisma.leaveRequest.deleteMany({});
  
  // Reset all leave balances to their original seeded values
  await prisma.leaveBalance.updateMany({
    where: { leaveType: { code: 'CL_FULL' } },
    data: { allocated: 12, used: 0, pending: 0, carriedOver: 0 }
  });
  await prisma.leaveBalance.updateMany({
    where: { leaveType: { code: 'CL_HALF' } },
    data: { allocated: 6, used: 0, pending: 0, carriedOver: 0 }
  });
  await prisma.leaveBalance.updateMany({
    where: { leaveType: { code: 'OPTIONAL' } },
    data: { allocated: 2, used: 0, pending: 0, carriedOver: 0 }
  });
  await prisma.leaveBalance.updateMany({
    where: { leaveType: { code: 'COMP' } },
    data: { allocated: 0, used: 0, pending: 0, carriedOver: 0 }
  });
  
  console.log("Leaves reset successfully! (Casual: 12, Half: 6, Optional: 2 -> Overall 20)");
}
main().catch(console.error).finally(() => prisma.$disconnect());
