import { PrismaClient } from '@naprocs/database';

const prisma = new PrismaClient();

async function main() {
  const ctoRole = "Chief Technology Officer";
  
  // Find Lokesh
  const lokesh = await prisma.employee.findFirst({
    where: { firstName: { contains: "Lokesh" } }
  });

  const ravi = await prisma.employee.findFirst({
    where: { firstName: { contains: "Ravi" } }
  });

  if (!lokesh || !ravi) {
    console.log("Employees not found");
    return;
  }

  await prisma.successionPlan.create({
    data: {
      roleTitle: ctoRole,
      incumbentId: lokesh.id,
      successorId: ravi.id,
      readinessLevel: "READY_NOW",
      gapAnalysis: "None. Fully ready.",
      developmentPlan: "Transition shadowing in Q1."
    }
  });

  console.log("Seeded succession plan");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
