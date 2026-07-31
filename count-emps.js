const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();
prisma.employee.count().then(c => { console.log('Total employees:', c); process.exit(0); });
