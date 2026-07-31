const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allowedCodes = ['CL', 'CL_HALF', 'SL', 'OPTIONAL', 'WFH', 'LOP', 'ML'];
  
  // First delete leave requests for invalid types to satisfy foreign key constraints
  const deletedRequests = await prisma.leaveRequest.deleteMany({
    where: {
      leaveType: {
        code: { notIn: allowedCodes }
      }
    }
  });
  console.log(`Deleted ${deletedRequests.count} old leave requests`);

  // Delete leave balances for invalid types
  const deletedBalances = await prisma.leaveBalance.deleteMany({
    where: {
      leaveType: {
        code: { notIn: allowedCodes }
      }
    }
  });
  console.log(`Deleted ${deletedBalances.count} old leave balances`);

  // Now delete the leave types
  const deleted = await prisma.leaveType.deleteMany({
    where: {
      code: { notIn: allowedCodes }
    }
  });
  console.log(`Deleted ${deleted.count} old leave types`);

}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
