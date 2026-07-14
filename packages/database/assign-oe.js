const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const emails = ['sandya@naprocs.in', 'sandeep@naprocs.in'];
  
  for (const email of emails) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.user.update({
        where: { email },
        data: { role: 'OE' }
      });
      console.log(`Updated ${email} to OE role.`);
    } else {
      console.log(`User ${email} not found.`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
