import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'divya@naprocs.in';
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: { employee: true }
  });
  
  console.log('--- USER RECORD ---');
  console.log(JSON.stringify(user, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
