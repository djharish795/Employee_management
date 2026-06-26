import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Fixing missing reporting managers...");

  // Find the CEO to use as a default manager
  const ceo = await prisma.employee.findFirst({
    where: { officialEmail: 'pradeep.chandra@naprocs.in' }
  });

  if (!ceo) {
    throw new Error("CEO not found!");
  }

  // Find employees where reportingManagerId is null (and they are not the CEO)
  const employeesWithoutManager = await prisma.employee.findMany({
    where: {
      reportingManagerId: null,
      id: { not: ceo.id }
    }
  });

  if (employeesWithoutManager.length === 0) {
    console.log("No employees with missing reporting managers found.");
    return;
  }

  for (const emp of employeesWithoutManager) {
    console.log(`Assigning manager (CEO) to: ${emp.firstName} ${emp.lastName}`);
    
    await prisma.employee.update({
      where: { id: emp.id },
      data: { reportingManagerId: ceo.id }
    });
  }

  console.log("Successfully fixed missing reporting managers!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
