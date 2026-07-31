const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Finding exact duplicate leave requests...");
  const allReqs = await prisma.leaveRequest.findMany({
    orderBy: { appliedAt: 'asc' }
  });

  const seen = new Set();
  const toDelete = [];

  for (const r of allReqs) {
    // Generate a unique fingerprint for each request
    const fingerprint = `${r.employeeId}-${r.leaveTypeId}-${r.startDate.toISOString()}-${r.endDate.toISOString()}-${r.totalDays}`;
    
    if (seen.has(fingerprint)) {
      toDelete.push(r.id);
    } else {
      seen.add(fingerprint);
    }
  }

  console.log(`Found ${toDelete.length} duplicate requests. Deleting them...`);

  if (toDelete.length > 0) {
    await prisma.leaveRequest.deleteMany({
      where: { id: { in: toDelete } }
    });
    console.log("Duplicates deleted successfully.");
  }

  // Now we MUST resync the leave balances again since we removed the duplicates
  console.log("Resyncing leave balances...");
  
  const currentYear = 2026;
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

  const aggregated = await prisma.leaveRequest.groupBy({
    by: ['employeeId', 'leaveTypeId'],
    _sum: { paidDays: true },
    where: { status: 'APPROVED', startDate: { gte: startOfYear, lte: endOfYear } }
  });

  // Zero out all 'used' balances first
  await prisma.leaveBalance.updateMany({
    where: { year: currentYear },
    data: { used: 0 }
  });

  // Apply the true sums
  for (const req of aggregated) {
    const totalPaid = Number(req._sum.paidDays || 0);
    await prisma.leaveBalance.updateMany({
      where: { employeeId: req.employeeId, leaveTypeId: req.leaveTypeId, year: currentYear },
      data: { used: totalPaid }
    });
  }

  console.log("Database perfectly deduplicated and resynchronized!");
}

main().then(() => prisma.$disconnect()).catch(console.error);
