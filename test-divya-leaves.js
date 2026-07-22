const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const divya = await prisma.employee.findFirst({ where: { firstName: { contains: 'Divya' } } });
  const leaves = await prisma.leaveRequest.findMany({
    where: { employeeId: divya?.id },
    orderBy: { appliedAt: 'desc' },
    take: 3
  });
  leaves.forEach(l => {
    console.log({
      id: l.id,
      startDate: l.startDate,
      endDate: l.endDate,
      appliedAt: l.appliedAt,
      status: l.status,
      approvalQueue: JSON.stringify(l.approvalQueue),
      currentStep: l.currentStep,
      totalDays: l.totalDays.toString(),
      paidDays: l.paidDays.toString(),
      unpaidDays: l.unpaidDays.toString(),
    });
  });
}
main().catch(console.error).finally(() => prisma.$disconnect());
