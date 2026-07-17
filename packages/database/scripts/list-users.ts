import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { employee: true },
  });
  console.log(JSON.stringify(users.map(u => ({
    id: u.id,
    email: u.email,
    role: u.role,
    employeeId: u.employeeId,
    employee: u.employee ? {
      firstName: u.employee.firstName,
      lastName: u.employee.lastName,
      officialEmail: u.employee.officialEmail,
    } : null
  })), null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
