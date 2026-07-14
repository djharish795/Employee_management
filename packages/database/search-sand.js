const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { email: { contains: 'sand' } }
  });
  console.log(users.map(u => u.email));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
