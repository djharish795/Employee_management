const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.department.deleteMany();
  await prisma.designation.deleteMany();
}

main()
  .then(() => console.log('Deleted successfully'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
