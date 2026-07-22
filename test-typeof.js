const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();
prisma.leaveRequest.findMany().then(r => console.log('typeof:', typeof r[0].totalDays, r[0].totalDays?.constructor?.name)).catch(console.error).finally(() => prisma.$disconnect());
