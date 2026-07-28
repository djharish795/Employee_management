require("dotenv").config({ path: "apps/api/.env" });
const { PrismaClient } = require("./node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client");

async function run() {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL
  });
  try {
    const users = await prisma.user.count();
    console.log(`There are ${users} users in the production database.`);
  } catch (err) {
    console.error("Database error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}
run();
