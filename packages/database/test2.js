const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.employee.findUnique({ where: { id: 'cmr1mlmbc00053y1wbxcs4p0x' } }).then(data => console.log(JSON.stringify(data, null, 2))).finally(() => prisma.$disconnect());
