import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      employee: true
    }
  });

  console.log("--- USERS ---");
  for (const user of users) {
    console.log(`User: ${user.email} | employeeId: ${user.employeeId}`);
  }

  const employees = await prisma.employee.findMany();
  console.log("\n--- EMPLOYEES ---");
  for (const emp of employees) {
    console.log(`Emp: ${emp.officialEmail} | ID: ${emp.id}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
