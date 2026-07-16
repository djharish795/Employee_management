import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const employees = await prisma.employee.findMany({
    include: {
      designation: true,
      department: true,
      reportingManager: {
        select: {
          firstName: true,
          lastName: true,
        }
      }
    },
  });

  const roles = new Set(employees.map(e => e.designation?.name || "No Designation"));
  const users = await prisma.user.findMany();
  
  console.log("=== CURRENT ROLES / DESIGNATIONS IN DB ===");
  Array.from(roles).forEach(r => console.log("- " + r));

  console.log("\n=== SYSTEM ACCESS ROLES IN DB (User Table) ===");
  const userRoles = new Set(users.map(u => u.role));
  Array.from(userRoles).forEach(r => console.log("- " + r));

  console.log("\n=== ORG CHART (Who reports to who) ===");
  employees.forEach(e => {
    const managerName = e.reportingManager 
      ? `${e.reportingManager.firstName} ${e.reportingManager.lastName}` 
      : "No Manager (Top Level)";
    const designation = e.designation?.name || "No Designation";
    console.log(`${e.firstName} ${e.lastName} [${designation}] ---> Reports to: ${managerName}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
