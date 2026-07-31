const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const clHalf = await prisma.leaveType.findUnique({ where: { code: 'CL_HALF' } });
  if (!clHalf) return;

  const reqs = await prisma.leaveRequest.findMany({
    where: { leaveTypeId: clHalf.id },
    include: { employee: true }
  });

  console.log(`Found ${reqs.length} CL_HALF requests`);
  for (const r of reqs) {
    console.log(`- ${r.employee.employeeId}: Total ${r.totalDays}, Paid ${r.paidDays}, Unpaid ${r.unpaidDays}`);
    
    // Auto-fix it if it's unpaid
    if (Number(r.unpaidDays) > 0) {
      await prisma.leaveRequest.update({
        where: { id: r.id },
        data: { paidDays: r.totalDays, unpaidDays: 0 }
      });
      console.log(`  -> Fixed! Now Paid ${r.totalDays}, Unpaid 0`);
    }
  }

  // Also resync balances
  console.log("Resyncing balances...");
  const currentYear = 2026;
  const aggregated = await prisma.leaveRequest.groupBy({
    by: ['employeeId', 'leaveTypeId'],
    _sum: { paidDays: true },
    where: { status: 'APPROVED', startDate: { gte: new Date(currentYear, 0, 1) } }
  });

  for (const req of aggregated) {
    if (req.leaveTypeId === clHalf.id) {
       await prisma.leaveBalance.updateMany({
         where: { employeeId: req.employeeId, leaveTypeId: req.leaveTypeId, year: currentYear },
         data: { used: Number(req._sum.paidDays || 0) }
       });
    }
  }
}

main().then(() => prisma.$disconnect()).catch(console.error);
