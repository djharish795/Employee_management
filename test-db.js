const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();
prisma.leaveRequest.findMany().then(r => console.log(r)).catch(console.error).finally(() => prisma.$disconnect());
