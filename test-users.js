const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();
prisma.user.findMany({ include: { employee: true } }).then(r => console.log(JSON.stringify(r, null, 2))).catch(console.error).finally(() => prisma.$disconnect());
