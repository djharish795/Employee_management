const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const ajay = await prisma.employee.findFirst({ where: { firstName: { contains: 'Ajay' } } });
  if (!ajay) return;

  const ajayReq = await prisma.leaveRequest.findFirst({
    where: { employeeId: ajay.id, startDate: new Date('2026-07-06') }
  });
  
  if (ajayReq) {
    // Total days was 4.5.
    // Accrued = 2. Used in June = 1. Remaining = 1.
    // So he can only get 1 Paid day. The other 3.5 must be Unpaid.
    await prisma.leaveRequest.update({
      where: { id: ajayReq.id },
      data: { paidDays: '1', unpaidDays: '3.5' }
    });
    console.log('Fixed Ajay July request to 1 paid 3.5 unpaid');
    
    // Resync his balance globally just to be safe
    const currentYear = 2026;
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const aggregated = await prisma.leaveRequest.aggregate({
      _sum: { paidDays: true },
      where: { employeeId: ajay.id, leaveTypeId: ajayReq.leaveTypeId, status: 'APPROVED', startDate: { gte: startOfYear, lte: endOfYear } }
    });

    const totalPaid = Number(aggregated._sum.paidDays || 0);

    await prisma.leaveBalance.updateMany({
      where: { employeeId: ajay.id, leaveTypeId: ajayReq.leaveTypeId, year: currentYear },
      data: { used: totalPaid }
    });
    console.log('Resynced Ajay CL Balance to', totalPaid);
  }
}

main().then(() => prisma.$disconnect()).catch(console.error);
