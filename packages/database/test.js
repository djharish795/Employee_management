const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.offboardingProcess.findMany().then(data => console.log(JSON.stringify(data, null, 2))).finally(() => prisma.$disconnect());
