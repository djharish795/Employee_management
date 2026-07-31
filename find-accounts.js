const fs = require('fs');
const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const bals = await prisma.leaveBalance.findMany({ where: { used: 3 }, include: { leaveType: true, employee: true } });
  bals.forEach(b => { if (b.leaveType.code === 'CL') console.log('Account:', b.employee.employeeId, b.employee.firstName); });
  
  // also, let's find any request from june 15 to 16
  const reqs = await prisma.leaveRequest.findMany({ where: { startDate: { gte: new Date('2026-06-15'), lte: new Date('2026-06-15') } }, include: { employee: true }});
  console.log("Requests on June 15:");
  reqs.forEach(r => console.log(r.employee.employeeId, r.startDate.toISOString().split('T')[0], 'to', r.endDate.toISOString().split('T')[0], 'Paid:', r.paidDays));
}

main().then(() => prisma.$disconnect()).catch(console.error);
