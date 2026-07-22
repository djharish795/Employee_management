const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const omId = 'cmruoh6lc0009jpd1gf2q15im'; // Junaid
  
  const divya = await prisma.employee.findFirst({ where: { firstName: { contains: 'Divya' } } });
  if (!divya) return;
  
  const leave = await prisma.leaveRequest.findFirst({
    where: { employeeId: divya.id, status: 'PENDING' }
  });
  
  if (leave) {
    const newQueue = [
      { role: 'OM', approverId: omId, status: 'PENDING' },
      { role: 'HRE', status: 'PENDING' }
    ];
    await prisma.leaveRequest.update({
      where: { id: leave.id },
      data: { approvalQueue: newQueue }
    });
    console.log("Updated Divya's leave queue");
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
