const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const oldEmail = 'pradeep.chandra@naprocs.in';
  
  // Find the old user
  const user = await prisma.user.findUnique({
    where: { email: oldEmail },
    include: { employee: true }
  });
  
  if (user) {
    if (user.employee) {
      // First try to re-map any remaining connections just in case
      const oldEmpId = user.employee.id;
      const targetEmpId = 'cmr1mlm7s00013y1w8q1tsyqe'; // pradeep@naprocs.in employee id
      
      await prisma.employee.updateMany({
        where: { reportingManagerId: oldEmpId },
        data: { reportingManagerId: targetEmpId }
      });
      await prisma.workReport.updateMany({
        where: { reviewerId: oldEmpId },
        data: { reviewerId: targetEmpId }
      });
      await prisma.fieldWorkRequest.updateMany({
        where: { approverId: oldEmpId },
        data: { approverId: targetEmpId }
      });
      
      // Delete employee record
      await prisma.employee.delete({
        where: { id: oldEmpId }
      });
    }
    
    // Delete user record
    await prisma.user.delete({
      where: { id: user.id }
    });
    console.log(`Successfully removed dummy account ${oldEmail}`);
  } else {
    console.log(`Account ${oldEmail} not found, perhaps already deleted`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
