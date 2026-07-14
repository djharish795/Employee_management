const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { role: 'MANAGER' }
  });
  console.log(users.map(u => u.email));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
