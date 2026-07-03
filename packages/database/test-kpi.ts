const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); async function go() { 
  const currentYear = new Date().getFullYear();
  const balances = await p.leaveBalance.findMany({
    where: { employeeId: 'cmr1mlmfw000f3y1wt8731bbp', year: currentYear },
    include: { leaveType: true }
  });
  console.log(balances);
  p.$disconnect();
} go();
