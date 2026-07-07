const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTejesh() {
  const user = await prisma.user.findUnique({
    where: { email: 'tejesh@naprocs.com' }
  });
  console.log("Tejesh DB Record:", user);
}

checkTejesh().catch(console.error).finally(() => prisma.$disconnect());
