import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Fixing Org Hierarchy...");

  const ceo = await prisma.employee.findFirst({ where: { officialEmail: 'pradeep.chandra@naprocs.in' } });
  const cto = await prisma.employee.findFirst({ where: { officialEmail: 'lokesh@naprocs.in' } });
  const opsHead = await prisma.employee.findFirst({ where: { officialEmail: 'junaid@naprocs.in' } });
  const hr = await prisma.employee.findFirst({ where: { officialEmail: 'hr@naprocs.in' } }); // Prince Alpha G

  if (!ceo || !cto || !opsHead || !hr) {
    throw new Error("Missing key personnel for hierarchy!");
  }

  // 1. CEO -> no manager
  await prisma.employee.update({ where: { id: ceo.id }, data: { reportingManagerId: null } });
  console.log(`Set CEO (${ceo.firstName}) manager to null`);

  // 2. CTO -> reports to CEO
  await prisma.employee.update({ where: { id: cto.id }, data: { reportingManagerId: ceo.id } });
  console.log(`Set CTO (${cto.firstName}) manager to CEO`);

  // 3. Ops Head -> reports to CTO
  await prisma.employee.update({ where: { id: opsHead.id }, data: { reportingManagerId: cto.id } });
  console.log(`Set Ops Head (${opsHead.firstName}) manager to CTO`);

  // 4. HR -> reports to Ops Head
  await prisma.employee.update({ where: { id: hr.id }, data: { reportingManagerId: opsHead.id } });
  console.log(`Set HR (${hr.firstName}) manager to Ops Head`);

  // 5. All other employees -> report to HR
  const otherEmployees = await prisma.employee.findMany({
    where: {
      id: { notIn: [ceo.id, cto.id, opsHead.id, hr.id] }
    }
  });

  for (const emp of otherEmployees) {
    await prisma.employee.update({
      where: { id: emp.id },
      data: { reportingManagerId: hr.id }
    });
    console.log(`Set Employee (${emp.firstName} ${emp.lastName}) manager to HR`);
  }

  console.log("Org Hierarchy aligned successfully.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
