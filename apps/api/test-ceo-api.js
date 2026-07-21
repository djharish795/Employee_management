const { PrismaClient } = require('@prisma/client');
const { sign } = require('jsonwebtoken');
require('dotenv').config({ path: '../../.env' });

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ where: { role: 'CEO' }, include: { employee: true } });
  if (!user) return console.log('No CEO found');

  const payload = {
    userId: user.id,
    employeeId: user.employee.id,
    role: user.role,
    email: user.email,
  };
  const secret = process.env.JWT_SECRET || 'fallback_secret';
  const token = sign(payload, secret);
  
  try {
    const res = await fetch('http://localhost:3001/api/v1/work-reports/team', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Status:', res.status);
    const data = await res.text();
    console.log('Data:', data);
  } catch (err) {
    console.log('Error:', err.message);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
