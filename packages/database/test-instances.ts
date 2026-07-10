import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const instances = await prisma.workflowInstance.findMany({
    where: { resourceType: 'ASSET_REQUEST' },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(instances);
}

main().catch(console.error).finally(() => prisma.$disconnect());
