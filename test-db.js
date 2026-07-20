const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();
Promise.all([
  prisma.cemLead.findMany({ include: { followUps: true, meetings: true, assignedCem: true } }),
  prisma.followUp.findMany(),
  prisma.meeting.findMany()
])
.then(x => console.log('ALL DB QUERIES OK'))
.catch(console.error)
.finally(() => prisma.$disconnect());
