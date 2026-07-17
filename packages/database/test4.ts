import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const types = await prisma.leaveType.findMany();
  console.log(types.map(t => t.code));
}
main().finally(() => prisma.$disconnect());
