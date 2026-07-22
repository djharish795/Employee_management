const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const m = await prisma.approvalMatrix.findMany();
  console.log("All Approval Matrices:");
  console.log(m);
}
main().catch(console.error).finally(() => prisma.$disconnect());
