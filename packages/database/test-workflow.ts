import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const w = await prisma.workflow.findUnique({
    where: { type: 'ASSET_REQUEST' }
  });
  console.log(w);
}

main().catch(console.error).finally(() => prisma.$disconnect());
