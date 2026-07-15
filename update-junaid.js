const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const updatedUser = await prisma.user.update({
    where: { email: 'junaid@naprocs.in' },
    data: { role: 'OM' },
  });
  console.log('Updated Junaid role:', updatedUser);
}
run().finally(() => prisma.$disconnect());
