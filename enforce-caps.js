const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Enforcing strict accrual limits for all historical data...");

  // Policy start is June 1, 2026. Current month is July.
  // CL Accrued = 2. CL_HALF Accrued = 1 (2 half-day sessions).
  const CAPS = {
    'CL': 2,
    'CL_HALF': 1
  };

  const leaveTypes = await prisma.leaveType.findMany();
  const clType = leaveTypes.find(lt => lt.code === 'CL');
  const clHalfType = leaveTypes.find(lt => lt.code === 'CL_HALF');

  if (!clType || !clHalfType) {
    console.error("Missing leave types");
    return;
  }

  const employees = await prisma.employee.findMany();

  for (const emp of employees) {
    // Process CL
    let clRequests = await prisma.leaveRequest.findMany({
      where: { employeeId: emp.id, status: 'APPROVED', leaveTypeId: clType.id },
      orderBy: { startDate: 'asc' }
    });

    let clAccrued = 0;
    for (const req of clRequests) {
      let paidSoFar = clAccrued;
      let reqTotal = Number(req.totalDays);
      
      let allowedPaidForThisReq = Math.min(reqTotal, CAPS['CL'] - paidSoFar);
      if (allowedPaidForThisReq < 0) allowedPaidForThisReq = 0;
      
      let newPaid = allowedPaidForThisReq;
      let newUnpaid = reqTotal - newPaid;
      
      clAccrued += newPaid;

      if (Number(req.paidDays) !== newPaid) {
        await prisma.leaveRequest.update({
          where: { id: req.id },
          data: { paidDays: newPaid.toString(), unpaidDays: newUnpaid.toString() }
        });
        console.log(`[${emp.employeeId}] Patched CL Request (${req.startDate.toISOString().split('T')[0]}): Paid ${req.paidDays} -> ${newPaid}, Unpaid ${req.unpaidDays} -> ${newUnpaid}`);
      }
    }

    // Process CL_HALF
    let hdRequests = await prisma.leaveRequest.findMany({
      where: { employeeId: emp.id, status: 'APPROVED', leaveTypeId: clHalfType.id },
      orderBy: { startDate: 'asc' }
    });

    let hdAccrued = 0;
    for (const req of hdRequests) {
      let paidSoFar = hdAccrued;
      let reqTotal = Number(req.totalDays);
      
      let allowedPaidForThisReq = Math.min(reqTotal, CAPS['CL_HALF'] - paidSoFar);
      if (allowedPaidForThisReq < 0) allowedPaidForThisReq = 0;
      
      let newPaid = allowedPaidForThisReq;
      let newUnpaid = reqTotal - newPaid;
      
      hdAccrued += newPaid;

      if (Number(req.paidDays) !== newPaid) {
        await prisma.leaveRequest.update({
          where: { id: req.id },
          data: { paidDays: newPaid.toString(), unpaidDays: newUnpaid.toString() }
        });
        console.log(`[${emp.employeeId}] Patched CL_HALF Request (${req.startDate.toISOString().split('T')[0]}): Paid ${req.paidDays} -> ${newPaid}, Unpaid ${req.unpaidDays} -> ${newUnpaid}`);
      }
    }
  }

  // Resync Balances
  console.log("Resyncing all balances...");
  const currentYear = 2026;
  
  await prisma.leaveBalance.updateMany({
    where: { year: currentYear },
    data: { used: 0 }
  });

  const aggregated = await prisma.leaveRequest.groupBy({
    by: ['employeeId', 'leaveTypeId'],
    _sum: { paidDays: true },
    where: { status: 'APPROVED', startDate: { gte: new Date(currentYear, 0, 1) } }
  });

  for (const req of aggregated) {
    const totalPaid = Number(req._sum.paidDays || 0);
    await prisma.leaveBalance.updateMany({
      where: { employeeId: req.employeeId, leaveTypeId: req.leaveTypeId, year: currentYear },
      data: { used: totalPaid }
    });
  }

  console.log("Done! All historical data strictly conforms to maximum accrual limits.");
}

main().then(() => prisma.$disconnect()).catch(console.error);
