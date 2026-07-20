require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findFirst({ where: { employee: { firstName: 'Varsha' } } });
  console.log(JSON.stringify(user));
  
  const assignments = await prisma.projectAssignment.findMany({ where: { employeeId: user.employeeId } });
  console.log("Assignments:", JSON.stringify(assignments));
}
main().finally(() => prisma.$disconnect());
