const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ include: { employee: true } });
  console.log("Users:", users.map(u => ({ email: u.email, employeeId: u.employeeId, empExists: !!u.employee })));
  
  // Test the profile service logic
  if (users.length > 0) {
    const user = users[0];
    if (user.employeeId) {
      const emp = await prisma.employee.findUnique({
        where: { id: user.employeeId },
        include: { department: true, designation: true, user: true }
      });
      console.log("Found emp by id?", !!emp);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
