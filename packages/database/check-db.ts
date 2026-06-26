import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const employees = await prisma.employee.findMany({
    include: {
      designation: true,
      department: true,
      user: true
    }
  });

  console.log("--- CURRENT EMPLOYEES IN DB ---");
  for (const emp of employees) {
    console.log(`- ${emp.firstName} ${emp.lastName} | Email: ${emp.officialEmail} | Dept: ${emp.department?.name} | Desig: ${emp.designation?.title} | UserRole: ${emp.user?.role}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
