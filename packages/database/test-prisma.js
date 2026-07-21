const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const reports = await prisma.workReport.findMany({
    where: { reviewerId: 'cmr1mlmdm00093y1wwy06vrdt' },
    orderBy: { submittedAt: 'desc' },
  });
  console.log('Reports:', JSON.stringify(reports, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
