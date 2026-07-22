const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const m = await prisma.approvalMatrix.findMany({ where: { requesterRoleId: 'OM' } });
  console.log("ApprovalMatrix for OM:", m);
}
main().catch(console.error).finally(() => prisma.$disconnect());
