const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const junaid = await prisma.employee.findFirst({ where: { firstName: { contains: 'Junaid' } } });
  if (!junaid) {
    console.log("Junaid not found");
    return;
  }
  
  const usersToUpdate = await prisma.user.findMany({
    where: {
      role: { in: ['CRM', 'CEM', 'OE'] },
      employeeId: { not: null }
    }
  });

  console.log(`Found ${usersToUpdate.length} users to update.`);

  let updatedCount = 0;
  for (const user of usersToUpdate) {
    await prisma.employee.update({
      where: { id: user.employeeId },
      data: { reportingManagerId: junaid.id }
    });
    
    // Also update existing reports so Junaid can see them!
    await prisma.workReport.updateMany({
      where: { employeeId: user.employeeId },
      data: { reviewerId: junaid.id }
    });
    
    updatedCount++;
  }

  console.log(`Successfully updated ${updatedCount} employees and their reports to report to Junaid.`);
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
