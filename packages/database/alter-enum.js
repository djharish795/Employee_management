const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE 'CAM';`);
    console.log('Successfully added CAM to UserRole enum.');
  } catch (error) {
    console.error('Error adding CAM to UserRole enum:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
