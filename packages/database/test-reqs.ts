import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const reqs = await prisma.workflowInstance.findMany({ 
    where: { workflow: { type: 'ASSET_REQUEST' } },
    include: { initiatedBy: true }
  });
  console.log('Found:', reqs.length);
  reqs.forEach(r => console.log(r.id, r.status, r.initiatedBy.firstName));
}

main().catch(console.error).finally(() => prisma.$disconnect());
