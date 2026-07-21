
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const ceo = await prisma.employee.findFirst({ where: { role: 'CEO' } });
  const om = await prisma.employee.findFirst({ where: { role: 'OM' } });
  if (ceo && om) {
    await prisma.employee.update({
      where: { id: om.id },
      data: { reportingManagerId: ceo.id }
    });
    console.log('Fixed OM manager to CEO:', ceo.id);
  } else {
    console.log('Could not find CEO or OM');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
