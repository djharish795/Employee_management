const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const targetCeoEmployeeId = 'cmr1mlm7s00013y1w8q1tsyqe'; // The one they are likely logged in as
  const oldCeoEmployeeId = 'cmr0nq7jt0001irfyq2iz9wrg';

  // Fix OM's reportingManagerId
  await prisma.employee.updateMany({
    where: { reportingManagerId: oldCeoEmployeeId },
    data: { reportingManagerId: targetCeoEmployeeId }
  });
  
  // Retroactively fix WorkReports
  const updatedWorkReports = await prisma.workReport.updateMany({
    where: { reviewerId: oldCeoEmployeeId },
    data: { reviewerId: targetCeoEmployeeId }
  });
  
  // Retroactively fix FieldWorkRequests
  const updatedFieldReports = await prisma.fieldWorkRequest.updateMany({
    where: { approverId: oldCeoEmployeeId },
    data: { approverId: targetCeoEmployeeId }
  });
  
  console.log(`Reassigned OM manager and reports to CEO: ${targetCeoEmployeeId}`);
  console.log(`Updated ${updatedWorkReports.count} Work Reports and ${updatedFieldReports.count} Field Reports.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
