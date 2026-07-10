import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "workflow_instances" ADD COLUMN "metadata" JSONB;`);
    console.log("Added column successfully");
  } catch (e) {
    console.log("Error or column already exists:", e.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
