import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const leaves = await prisma.leaveRequest.findMany({ orderBy: { appliedAt: 'desc' }, take: 1, include: { employee: true } });
  console.log(JSON.stringify(leaves, null, 2));
}
main().finally(() => prisma.$disconnect());
