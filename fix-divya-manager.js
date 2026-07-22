const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const omId = 'cmruoh6lc0009jpd1gf2q15im'; // Junaid

  const divya = await prisma.employee.findFirst({
    where: { firstName: { contains: 'Divya' } }
  });
  console.log("Divya ID:", divya?.id, "current reportingManagerId:", divya?.reportingManagerId);

  if (divya) {
    await prisma.employee.update({
      where: { id: divya.id },
      data: { reportingManagerId: omId }
    });
    console.log("Updated Divya's reporting manager to Junaid (OM)");
  }

  // Also find Swetha (CEM) and any others
  const sweetha = await prisma.employee.findFirst({
    where: { firstName: { contains: 'Swetha' } }
  });
  if (sweetha && !sweetha.reportingManagerId) {
    await prisma.employee.update({
      where: { id: sweetha.id },
      data: { reportingManagerId: omId }
    });
    console.log("Updated Swetha's reporting manager to Junaid (OM)");
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
