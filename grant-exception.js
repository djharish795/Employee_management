const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const empIds = ['NAP/TR/002', 'NAP/OR/002']; // Covering both his TR and OR profile for completeness

  for (const eid of empIds) {
    const emp = await prisma.employee.findUnique({ where: { employeeId: eid } });
    if (!emp) continue;

    const clType = await prisma.leaveType.findUnique({ where: { code: 'CL' } });
    if (!clType) continue;

    await prisma.leaveBalance.updateMany({
      where: {
        employeeId: emp.id,
        leaveTypeId: clType.id,
        year: 2026
      },
      data: {
        carriedOver: 1
      }
    });

    console.log(`Granted 1 carry-over leave from May for ${eid}.`);
  }
}

main().then(() => prisma.$disconnect()).catch(console.error);
