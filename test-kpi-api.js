const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();
const http = require('http');

async function main() {
  const emp = await prisma.employee.findFirst({ where: { employeeId: 'NAP/OR/002' } });
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/leaves/kpi?employeeId=' + emp.id,
    headers: {
      'Cookie': 'accessToken=MOCK_TOKEN' // Needs auth but let's see if we can bypass it or if it needs JWT
    },
    method: 'GET'
  };

  const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(data));
  });

  req.on('error', e => console.error(e));
  req.end();
}

main();
