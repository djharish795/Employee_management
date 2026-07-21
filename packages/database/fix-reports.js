const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ include: { employee: true } });
  const ceoUser = users.find(u => u.role === 'CEO');
  const omUser = users.find(u => u.role === 'OM');
  
  if (ceoUser?.employee && omUser?.employee) {
    const ceoId = ceoUser.employee.id;
    const omId = omUser.employee.id;
    
    // Fix OM's reportingManagerId
    await prisma.employee.update({
      where: { id: omId },
      data: { reportingManagerId: ceoId }
    });
    
    // Retroactively fix WorkReports submitted by OM
    const updatedWorkReports = await prisma.workReport.updateMany({
      where: { employeeId: omId },
      data: { reviewerId: ceoId }
    });
    
    // Retroactively fix FieldWorkRequests submitted by OM
    const updatedFieldReports = await prisma.fieldWorkRequest.updateMany({
      where: { employeeId: omId },
      data: { approverId: ceoId }
    });
    
    console.log(`Fixed OM manager to CEO: ${ceoId}`);
    console.log(`Retroactively updated ${updatedWorkReports.count} Work Reports and ${updatedFieldReports.count} Field Reports.`);
  } else {
    console.log('Could not find CEO or OM user/employee');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
