const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const reqs = await prisma.leaveRequest.findMany();
  let count = 0;
  for (const r of reqs) {
    const queue = r.approvalQueue || [];
    const hasApprover = queue.some(q => q.approverId === 'cmruoh6x3000zjpd1lbk5qmxu' || q.approverId === 'cmruoh6wa000xjpd1b678r041');
    if (hasApprover) {
      count++;
    }
  }
  console.log("Found leaves with manual check:", count);

  const reqsPrisma = await prisma.leaveRequest.findMany({
    where: {
      OR: [
        {
          approvalQueue: {
            array_contains: [{ approverId: 'cmruoh6x3000zjpd1lbk5qmxu' }]
          }
        },
        {
          approvalQueue: {
            array_contains: [{ approverId: 'cmruoh6wa000xjpd1b678r041' }]
          }
        }
      ]
    }
  });
  console.log("Found leaves with Prisma array_contains:", reqsPrisma.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());
