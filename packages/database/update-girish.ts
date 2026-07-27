import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.employee.updateMany({
    where: { firstName: 'Girish' },
    data: { dateOfBirth: new Date('2003-07-27T00:00:00.000Z') }
  });
  console.log(`Updated Girish count: ${result.count}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
