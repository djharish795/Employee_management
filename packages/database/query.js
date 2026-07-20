const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findFirst({ 
  where: { employee: { firstName: 'Varsha' } }, 
  include: { employee: { include: { designation: true, department: true } } } 
}).then(u => { 
  console.log(JSON.stringify(u, null, 2)); 
  prisma.$disconnect(); 
});
