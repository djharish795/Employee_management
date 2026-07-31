const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const p = new PrismaClient();

async function run() {
  const junaid = await p.employee.findFirst({
    where: { firstName: { contains: 'Junaid' } },
    include: { user: true, designation: true, department: true }
  });
  console.log('Junaid:', junaid ? junaid.id : 'Not found', junaid ? junaid.designation?.title : '');
  
  if (junaid) {
    const subs = await p.employee.count({ where: { reportingManagerId: junaid.id } });
    console.log('Junaid Subordinates Count:', subs);
    
    const deptHead = await p.department.findMany({ where: { headId: junaid.id } });
    console.log('Junaid Head of Depts:', deptHead.map(d=>d.name));
  }

  const swetha = await p.employee.findFirst({
    where: { firstName: { contains: 'Swetha' } },
    include: { user: true, designation: true, department: true }
  });
  console.log('Swetha:', swetha ? swetha.id : 'Not found', swetha ? swetha.designation?.title : '');
}

run().then(() => {
  p.$disconnect();
  process.exit(0);
});
