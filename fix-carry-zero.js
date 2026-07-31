const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.leaveBalance.updateMany({
    data: { carriedOver: 0 }
  });

  console.log('Zeroed out all carriedOver leaves across the board!');
}

main().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); });
