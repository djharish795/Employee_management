const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const divya = await prisma.employee.findFirst({
    where: { firstName: { contains: 'Divya' } },
    include: { user: true, designation: true, department: true }
  });
  console.log("Divya:", JSON.stringify({
    id: divya?.id,
    firstName: divya?.firstName,
    reportingManagerId: divya?.reportingManagerId,
    assignedHrId: divya?.assignedHrId,
    userRole: divya?.user?.role,
    designationTitle: divya?.designation?.title,
    deptCode: divya?.department?.code
  }, null, 2));

  if (divya) {
    // Check leave balances
    const balances = await prisma.leaveBalance.findMany({
      where: { employeeId: divya.id },
      include: { leaveType: true }
    });
    console.log("\nLeave Balances:");
    balances.forEach(b => {
      console.log(`  ${b.leaveType.name} (${b.leaveType.code}): allocated=${b.allocated}, used=${b.used}, pending=${b.pending}, year=${b.year}`);
    });

    // Check leave types
    const leaveTypes = await prisma.leaveType.findMany({ where: { isActive: true } });
    console.log("\nActive Leave Types:");
    leaveTypes.forEach(lt => {
      console.log(`  ${lt.name} (${lt.code}): isPaidLeave=${lt.isPaidLeave}`);
    });
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
