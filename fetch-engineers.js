const { PrismaClient } = require('./packages/database/node_modules/@prisma/client'); 
const p = new PrismaClient(); 

p.employee.findMany({ 
  where: { 
    status: 'ACTIVE', 
    firstName: { not: 'Vacant' }, 
    department: { name: { in: ['Engineering', 'Technology', 'IT', 'Product', 'QA', 'Architecture', 'Software Development', 'Quality Assurance'] } } 
  }, 
  include: { designation: true, department: true }, 
  orderBy: { designationId: 'asc' } 
}).then(emps => { 
  const list = emps.filter(e => { 
    const t = e.designation.title.toLowerCase(); 
    return !t.includes('chief') && !t.includes('cto') && !t.includes('ceo') && !t.includes('head'); 
  }); 
  console.log(JSON.stringify(list.map(e => ({ name: e.firstName + ' ' + (e.lastName || ''), currentTitle: e.designation.title, department: e.department.name })), null, 2)); 
  process.exit(0); 
});
