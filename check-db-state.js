const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const empIds = ['NAP/TR/002', 'NAP/OR/002'];

  for (const eid of empIds) {
    const emp = await prisma.employee.findUnique({ where: { employeeId: eid }});
    if (!emp) continue;

    console.log(`\n=== ${eid} ===`);
    const bals = await prisma.leaveBalance.findMany({ where: { employeeId: emp.id }, include: { leaveType: true } });
    for (const b of bals) {
      if (b.leaveType.code === 'CL') {
         console.log(`CL Used: ${b.used}, Allocated: ${b.allocated}`);
      }
    }

    const reqs = await prisma.leaveRequest.findMany({ where: { employeeId: emp.id } });
    console.log(`Total Requests: ${reqs.length}`);
    for (const r of reqs) {
       console.log(`  ${r.startDate.toISOString().split('T')[0]} - ${r.paidDays} paid days`);
    }
  }

  // Also fix Ajay
  const ajay = await prisma.employee.findFirst({ where: { firstName: { contains: 'Ajay' } } });
  if (ajay) {
    const ajayReq = await prisma.leaveRequest.findFirst({
      where: { employeeId: ajay.id, totalDays: '4.5' }
    });
    if (ajayReq) {
      await prisma.leaveRequest.update({
        where: { id: ajayReq.id },
        data: { paidDays: '3', unpaidDays: '1.5' }
      });
      console.log('Fixed Ajay to 3 paid 1.5 unpaid');
      
      // Resync his balance
      await prisma.leaveBalance.updateMany({
        where: { employeeId: ajay.id, leaveTypeId: ajayReq.leaveTypeId, year: 2026 },
        data: { used: 4 } // 1 day earlier + 3 days now
      });
    }
  }
}

main().then(() => prisma.$disconnect()).catch(console.error);
