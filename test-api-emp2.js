const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ where: { email: 'pradeep@naprocs.in' }});
  
  const token = jwt.sign({
    sub: user.id,
    email: user.email,
    role: user.role,
    employeeId: user.employeeId,
    jti: 'test-jti'
  }, process.env.JWT_SECRET || 'secret');

  console.log('Fetching /employees/cmruovadm0005xw3rcacksujz%20 with token...');
  const res = await fetch('http://localhost:3001/api/v1/employees/cmruovadm0005xw3rcacksujz%20', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Response:', data);
}
main().catch(console.error).finally(() => prisma.$disconnect());
