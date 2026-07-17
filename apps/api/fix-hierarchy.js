const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Fetch all employees and departments
  const employees = await prisma.employee.findMany({
    include: { designation: true, department: true }
  });
  const departments = await prisma.department.findMany();

  console.log("Employees:", employees.map(e => ({ name: e.firstName + ' ' + (e.lastName || ''), role: e.designation?.title, dept: e.department?.name, id: e.id })));

  // Identify key figures
  const ceo = employees.find(e => e.designation?.title?.toLowerCase().includes('ceo') || e.firstName.includes('Pradeep'));
  const cto = employees.find(e => e.designation?.title?.toLowerCase().includes('cto') || e.firstName.includes('Lokesh'));
  const hrHead = employees.find(e => e.firstName.includes('Tejesh') || e.designation?.title?.toLowerCase().includes('hr head') || e.designation?.title?.toLowerCase().includes('director'));
  const opsHead = employees.find(e => e.firstName.includes('Junaid'));

  if (!ceo) console.log("WARNING: CEO not found");

  // Fix departments heads
  for (const dept of departments) {
    let headId = null;
    const deptName = dept.name.toLowerCase();
    if (deptName.includes('executive')) headId = ceo?.id || null;
    else if (deptName.includes('technology') || deptName.includes('engineering')) headId = cto?.id || null;
    else if (deptName.includes('human resources') || deptName.includes('hr')) headId = hrHead?.id || null;
    else if (deptName.includes('operations')) headId = opsHead?.id || null;
    
    if (headId) {
      await prisma.department.update({ where: { id: dept.id }, data: { headId } });
      console.log(`Updated dept ${dept.name} head to ${headId}`);
    }
  }

  // Fix hierarchy
  for (const emp of employees) {
    let managerId = null;
    const title = emp.designation?.title?.toLowerCase() || '';
    
    // CEO reports to nobody
    if (emp.id === ceo?.id) {
      managerId = null;
    }
    // CTO, HR Head, Ops Head report to CEO
    else if (emp.id === cto?.id || emp.id === hrHead?.id || emp.id === opsHead?.id) {
      managerId = ceo?.id || null;
    }
    // Tech/Engineering team reports to CTO
    else if (emp.department?.name?.toLowerCase().includes('technology') || emp.department?.name?.toLowerCase().includes('engineering')) {
      managerId = cto?.id || null;
    }
    // HR team reports to HR Head
    else if (emp.department?.name?.toLowerCase().includes('human resources')) {
      managerId = hrHead?.id || null;
    }
    // Ops team reports to Ops Head
    else if (emp.department?.name?.toLowerCase().includes('operations')) {
      managerId = opsHead?.id || null;
    }
    // Anyone else reports to CEO by default just to fix the chain
    else {
      managerId = ceo?.id || null;
    }

    await prisma.employee.update({ where: { id: emp.id }, data: { reportingManagerId: managerId } });
    console.log(`Updated emp ${emp.firstName} manager to ${managerId}`);
  }
}

main().then(() => console.log('Done')).catch(console.error).finally(() => prisma.$disconnect());
