const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const ajay = await prisma.employee.findFirst({ where: { firstName: { contains: 'Ajay' } } });
  if (!ajay) return;

  const clType = await prisma.leaveType.findUnique({ where: { code: 'CL' } });
  const clHalfType = await prisma.leaveType.findUnique({ where: { code: 'CL_HALF' } });

  const ajayReq = await prisma.leaveRequest.findFirst({
    where: { employeeId: ajay.id, startDate: new Date('2026-07-06'), totalDays: { in: ['4.5', '4'] } }
  });

  if (ajayReq) {
    // Modify the original request to strictly be the 4 full days (CL)
    // He has 1 available CL, so 1 Paid, 3 Unpaid.
    await prisma.leaveRequest.update({
      where: { id: ajayReq.id },
      data: {
        totalDays: '4',
        paidDays: '1',
        unpaidDays: '3'
      }
    });

    // Create a NEW request for the 0.5 fraction, linked to CL_HALF
    // He has 0.5 available CL_HALF for July. So 0.5 Paid, 0 Unpaid.
    await prisma.leaveRequest.create({
      data: {
        employeeId: ajay.id,
        leaveTypeId: clHalfType.id,
        startDate: ajayReq.endDate, // Same day as the end of the full-day block
        endDate: ajayReq.endDate,
        reason: ajayReq.reason + ' (Half Day Session)',
        status: 'APPROVED',
        totalDays: '0.5',
        paidDays: '0.5',
        unpaidDays: '0',
        isHalfDay: true,
        halfDaySession: 'LAST_DAY',
        approvalQueue: ajayReq.approvalQueue,
        currentStep: ajayReq.currentStep,
        approvedAt: ajayReq.approvedAt,
        approverId: ajayReq.approverId
      }
    });

    console.log('Successfully split the impossible 4.5 day seed request into two schema-compliant requests.');

    // Resync balances
    const currentYear = 2026;

    // Zero out
    await prisma.leaveBalance.updateMany({
      where: { employeeId: ajay.id, year: currentYear },
      data: { used: 0 }
    });

    // Re-aggregate for Ajay
    const aggregated = await prisma.leaveRequest.groupBy({
      by: ['leaveTypeId'],
      _sum: { paidDays: true },
      where: { employeeId: ajay.id, status: 'APPROVED', startDate: { gte: new Date(currentYear, 0, 1) } }
    });

    for (const req of aggregated) {
      await prisma.leaveBalance.updateMany({
        where: { employeeId: ajay.id, leaveTypeId: req.leaveTypeId, year: currentYear },
        data: { used: Number(req._sum.paidDays || 0) }
      });
    }

    console.log('Resynced Ajay Balances perfectly.');
  }
}

main().then(() => prisma.$disconnect()).catch(console.error);
