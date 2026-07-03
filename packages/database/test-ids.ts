const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); async function go() { 
  const emp = await p.employee.findUnique({ where: { employeeId: 'NAP/TR/002' } });
  console.log('Employee UUID:', emp.id);
  const user = await p.user.findFirst({ where: { employeeId: emp.id } });
  console.log('User UUID:', user.id);
  
  const balances = await p.leaveBalance.findMany({ where: { employeeId: emp.id } });
  console.log('Balances length:', balances.length);
  p.$disconnect();
} go();
