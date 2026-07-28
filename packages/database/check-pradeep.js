const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { email: { contains: 'pradeep' } },
    include: {
      employee: {
        include: {
          designation: true,
          department: true
        }
      },
      sessions: {
        where: { isActive: true }
      }
    }
  });

  console.log(`Found ${users.length} users with 'pradeep' in email:`);
  for (const user of users) {
    console.log('---');
    console.log('User found:', user.email);
    console.log('User ID:', user.id);
    console.log('User status:', user.status);
    console.log('User role:', user.role);
    console.log('Employee status:', user.employee?.status);
    console.log('Employee designation:', user.employee?.designation?.title);
    console.log('Active sessions:', user.sessions.length);
    
    // Check common passwords
    const passwords = ['Naprocs@123', 'Naprocs@2024!', 'Naprocs@2026!', 'ChangeMe123!'];
    for (const pw of passwords) {
      const valid = await bcrypt.compare(pw, user.passwordHash);
      console.log(`Password "${pw}" valid?`, valid);
    }
  }
}

main().finally(() => prisma.$disconnect());
