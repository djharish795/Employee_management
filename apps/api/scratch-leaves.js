const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const leaves = await prisma.leaveRequest.findMany({
    include: { employee: true }
  });
  console.log(JSON.stringify(leaves, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
