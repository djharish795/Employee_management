const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateTejesh() {
  try {
    const user = await prisma.user.update({
      where: { email: 'tejesh@naprocs.in' },
      data: { role: 'TEAM_LEAD' }
    });
    console.log("Successfully updated:", user.email, "to", user.role);
  } catch (err) {
    console.error("Error updating user:", err);
  }
}

updateTejesh().catch(console.error).finally(() => prisma.$disconnect());
