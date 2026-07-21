const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const reports = await prisma.workReport.findMany();
  console.log('Reports Reviewer IDs:', reports.map(r => r.reviewerId));
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
