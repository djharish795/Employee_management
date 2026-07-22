const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const reqsPrisma = await prisma.leaveRequest.findMany({
    where: {
      OR: [
        {
          approvalQueue: {
            array_contains: [{ approverId: 'cmruoh78w001pjpd1v1uq2ygj' }]
          }
        },
        {
          approvalQueue: {
            array_contains: [{ role: 'TL' }]
          }
        }
      ]
    }
  });
  console.log("Found leaves with Prisma array_contains:", reqsPrisma.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());
