const http = require('http');
const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const emp = await prisma.employee.findFirst({
    where: {
      OR: [
        { employeeId: 'NAP/OR/002' },
        { firstName: { contains: 'Tejesh', mode: 'insensitive' } }
      ]
    }
  });

  if (!emp) {
    console.log("Tejesh not found");
    return;
  }

  console.log('Employee:', emp.employeeId, emp.firstName, emp.lastName);

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/leaves/kpi?employeeId=' + emp.id,
    method: 'GET'
  };

  const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    });
  });

  req.on('error', e => console.error(e));
  req.end();
}

main();
