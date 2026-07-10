const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = 'sweetha@naprocs.in';
  const newPassword = 'ChangeMe123!';
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  await prisma.user.update({
    where: { email },
    data: { passwordHash: hashedPassword }
  });

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = await bcrypt.compare(newPassword, user.passwordHash);
  
  console.log(`Password reset for ${email}. Valid check:`, valid);
}

main().finally(() => prisma.$disconnect());
