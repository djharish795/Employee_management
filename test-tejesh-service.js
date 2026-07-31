const { NestFactory } = require('@nestjs/core');
const { LeavesService } = require('./apps/api/src/modules/leaves/leaves.service');
const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const emp = await prisma.employee.findFirst({
    where: {
      firstName: { contains: 'Tejesh', mode: 'insensitive' }
    }
  });

  if (!emp) {
    console.log("Tejesh not found");
    return;
  }

  console.log('Employee:', emp.employeeId, emp.firstName, emp.lastName);

  // Instead of booting up Nest, just instantiate LeavesService with mocked dependencies if possible, or just query DB.
  // Actually, I can just write a script that replicates exactly what getLeavesKPI does for this employee to see what it spits out!
}

main();
