const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const { DashboardService } = require('./apps/api/dist/modules/dashboard/dashboard.service.js');

const prisma = new PrismaClient();

async function run() {
  try {
    const dashboardService = new DashboardService(prisma);
    const result = await dashboardService.getHrOverview();
    console.log(result);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
