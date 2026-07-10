import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  try {
    const data = { name: 'Test Script Project' };
    let projectKey = data.name.replace(/[^A-Za-z0-9]/g, '').substring(0, 4).toUpperCase() || 'PROJ';
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    projectKey = `${projectKey}-${randomSuffix}`;
    
    console.log("Attempting to insert key:", projectKey);
    const p = await prisma.project.create({
      data: {
        name: data.name,
        key: projectKey,
        status: 'ACTIVE'
      }
    });
    console.log("Success:", p);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
