const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const employees = await prisma.employee.findMany({
    where: { firstName: { contains: 'Divya' } }
  });
  
  console.log("Found Divyas:", employees.map(e => ({
    id: e.id,
    firstName: e.firstName,
    lastName: e.lastName,
    role: e.role
  })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
