const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const p = new PrismaClient();
p.employee.findMany({ 
  where: { status: 'ACTIVE' }, 
  include: { department: true, designation: true } 
}).then(emps => { 
  const map = {}; 
  emps.forEach(e => { 
    const d = e.department?.name || 'No Dept'; 
    const title = e.designation?.title || 'No Title'; 
    if (!map[d]) map[d] = new Set(); 
    map[d].add(title); 
  }); 
  for (const d in map) { 
    console.log(d + ':'); 
    console.log('  - ' + [...map[d]].join('\n  - ')); 
  } 
  p.$disconnect(); 
  process.exit(0); 
});
