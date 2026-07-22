const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Deleting all work reports...');
  const deletedWorkReports = await prisma.workReport.deleteMany();
  console.log(`Deleted ${deletedWorkReports.count} work reports.`);

  console.log('Deleting all field work requests...');
  const deletedFieldWork = await prisma.fieldWorkRequest.deleteMany();
  console.log(`Deleted ${deletedFieldWork.count} field work requests.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
