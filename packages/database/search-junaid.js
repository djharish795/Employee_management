const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { email: { contains: 'junaid' } }
  });
  console.log(users.map(u => ({ email: u.email, role: u.role })));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
