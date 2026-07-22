const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const pradeep = await prisma.employee.findFirst({
    where: { firstName: { contains: 'Pradeep' } },
    include: { user: true, designation: true, department: true }
  });
  console.log("Pradeep:", {
    id: pradeep?.id,
    firstName: pradeep?.firstName,
    userRole: pradeep?.user?.role,
    designationTitle: pradeep?.designation?.title,
    deptCode: pradeep?.department?.code
  });

  // Check Junaid's pending leave
  const junaid = await prisma.employee.findFirst({ where: { firstName: { contains: 'Junaid' } } });
  const leave = await prisma.leaveRequest.findFirst({
    where: { employeeId: junaid?.id, status: 'PENDING' },
    orderBy: { appliedAt: 'desc' }
  });
  if (leave) {
    console.log("\nJunaid's pending leave:");
    console.log("  approvalQueue:", JSON.stringify(leave.approvalQueue, null, 2));
    console.log("  currentStep:", leave.currentStep);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
