const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const m = await prisma.approvalMatrix.findMany({ 
    where: { requesterRoleId: { in: ['OE', 'CRM', 'CEM', 'CAM'] } } 
  });
  console.log("ApprovalMatrix:", m);
}
main().catch(console.error).finally(() => prisma.$disconnect());
