import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const assignments = await prisma.projectAssignment.findMany({});
  console.log("Assignments releasedAt:");
  assignments.forEach(a => console.log(a.releasedAt));
}
main().finally(() => prisma.$disconnect());
