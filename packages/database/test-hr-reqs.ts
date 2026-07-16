import { PrismaClient } from '@prisma/client';
import { sign } from 'jsonwebtoken';
import http from 'http';

const prisma = new PrismaClient();

async function main() {
  const hrUser = await prisma.user.findFirst({ where: { role: 'HR' }, include: { employee: true } });
  if (!hrUser) return console.log('No HR user found');

  const token = sign(
    { sub: hrUser.id, email: hrUser.email, role: hrUser.role, employeeId: hrUser.employee?.id },
    'wjzDFlB9Ib8n5hsQeJucCRSWxgmMiZ2aN4TPofrYXd6OVEptHGqy1kA0K3vLU7',
    { expiresIn: '15m' }
  );

  const req = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/assets/requests',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('Response:', data));
  });
  req.on('error', console.error);
  req.end();
}

main().catch(console.error).finally(() => prisma.$disconnect());
