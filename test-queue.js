const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const req = await prisma.leaveRequest.findFirst({ where: { status: 'PENDING' }, orderBy: { appliedAt: 'desc' } });
  console.log(JSON.stringify(req.approvalQueue, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
