const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const currentYear = 2026;
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

  console.log('Fetching all approved leave requests for the year...');
  const requests = await prisma.leaveRequest.groupBy({
    by: ['employeeId', 'leaveTypeId'],
    _sum: {
      paidDays: true
    },
    where: {
      status: 'APPROVED',
      startDate: { gte: startOfYear, lte: endOfYear }
    }
  });

  console.log('Found', requests.length, 'aggregated usage records. Resyncing LeaveBalances...');

  // First, zero out all 'used' balances so anyone without requests goes to 0
  await prisma.leaveBalance.updateMany({
    where: { year: currentYear },
    data: { used: 0 }
  });

  // Now apply the accurate aggregated sums
  for (const req of requests) {
    const totalPaid = Number(req._sum.paidDays || 0);
    
    await prisma.leaveBalance.updateMany({
      where: {
        employeeId: req.employeeId,
        leaveTypeId: req.leaveTypeId,
        year: currentYear
      },
      data: {
        used: totalPaid
      }
    });
  }

  console.log('Database perfectly synchronized!');
}

main().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); });
