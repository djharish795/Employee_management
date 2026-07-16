import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing designations for employees under HR...");

  const hr = await prisma.employee.findFirst({ where: { officialEmail: 'hr@naprocs.in' } });
  
  if (!hr) {
    throw new Error("Could not find HR (Prince Alpha G)!");
  }

  const result = await prisma.employee.updateMany({
    where: { reportingManagerId: hr.id },
    data: { designationId: null }
  });

  console.log(`Cleared designation for ${result.count} employees.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
