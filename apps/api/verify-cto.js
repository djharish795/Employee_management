const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const cto = await prisma.employee.findFirst({
    where: { OR: [{ designation: { title: { contains: 'CTO' } } }, { firstName: { contains: 'Lokesh' } }] },
    include: { reportingManager: true }
  });
  console.log("CTO:", cto?.firstName, cto?.lastName);
  console.log("Manager:", cto?.reportingManager?.firstName, cto?.reportingManager?.lastName);
}

check().catch(console.error).finally(() => prisma.$disconnect());
