const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { employee: true }
  });
  console.log(`Total users: ${users.length}`);
  users.forEach(u => {
    console.log(`- Email: ${u.email}, Role: ${u.role}, Status: ${u.status}, EmployeeStatus: ${u.employee?.status}`);
  });
}

main().finally(() => prisma.$disconnect());
