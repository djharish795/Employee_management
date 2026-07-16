const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'sweetha@naprocs.in' },
    include: { employee: true }
  });

  if (!user) {
    console.log('User not found!');
  } else {
    console.log('User found:', user.email);
    console.log('User status:', user.status);
    console.log('User role:', user.role);
    console.log('Employee status:', user.employee?.status);
    const valid = await bcrypt.compare('Naprocs@123', user.passwordHash);
    console.log('Password Naprocs@123 valid?', valid);
  }
}

main().finally(() => prisma.$disconnect());
