const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const depts = await prisma.department.findMany();
  console.log("Departments:", depts);
  const emps = await prisma.employee.findMany({ include: { department: true } });
  console.log("Employees:", emps.map(e => ({ name: e.firstName, dept: e.department?.name })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
