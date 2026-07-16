const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  console.log("URL:", process.env.DATABASE_URL);
  try {
    const res = await prisma.attendanceRecord.findFirst();
    console.log("Success:", res ? "Found record" : "No records");
  } catch (e) {
    console.error("FAIL:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
run();
