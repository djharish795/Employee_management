import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting dummy data wipeout...');

  // 1. Delete all Regularization Requests
  const regCount = await prisma.regularizationRequest.deleteMany({});
  console.log(`Deleted ${regCount.count} regularization requests.`);

  // 2. Delete all Leave Requests
  const leaveCount = await prisma.leaveRequest.deleteMany({});
  console.log(`Deleted ${leaveCount.count} leave requests.`);

  // 3. Reset all Leave Balances (used = 0, pending = 0)
  const balanceCount = await prisma.leaveBalance.updateMany({
    data: {
      used: 0,
      pending: 0
    }
  });
  console.log(`Reset ${balanceCount.count} leave balances.`);

  // 4. Delete all Attendance Records
  const attCount = await prisma.attendanceRecord.deleteMany({});
  console.log(`Deleted ${attCount.count} attendance records.`);

  console.log('Dummy data wipeout completed successfully!');
}

main().catch(console.error).finally(() => {
  prisma.$disconnect();
});
