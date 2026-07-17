import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const employees = await prisma.employee.findMany({
    include: { designation: true, department: true }
  });
  const departments = await prisma.department.findMany();

  const ceo = employees.find(e => e.designation?.title?.toLowerCase().includes('ceo') || e.firstName.includes('Pradeep'));
  const cto = employees.find(e => e.designation?.title?.toLowerCase().includes('cto') || e.firstName.includes('Lokesh'));
  const hrHead = employees.find(e => e.firstName.includes('Tejesh') || e.designation?.title?.toLowerCase().includes('hr') || e.designation?.title?.toLowerCase().includes('director'));
  const opsHead = employees.find(e => e.firstName.includes('Junaid'));

  console.log("Found CEO:", ceo?.firstName);
  console.log("Found CTO:", cto?.firstName);
  console.log("Found HR Head:", hrHead?.firstName);
  console.log("Found Ops Head:", opsHead?.firstName);

  for (const dept of departments) {
    let headId = null;
    const deptName = dept.name.toLowerCase();
    if (deptName.includes('executive')) headId = ceo?.id || null;
    else if (deptName.includes('technology') || deptName.includes('engineering')) headId = cto?.id || null;
    else if (deptName.includes('human resources') || deptName.includes('hr')) headId = hrHead?.id || null;
    else if (deptName.includes('operations')) headId = opsHead?.id || null;
    
    if (headId) {
      await prisma.department.update({ where: { id: dept.id }, data: { headId } });
      console.log(`Assigned ${headId} as head of ${dept.name}`);
    }
  }

  for (const emp of employees) {
    let managerId = null;
    const deptName = emp.department?.name?.toLowerCase() || '';
    
    if (emp.id === ceo?.id) managerId = null;
    else if (emp.id === cto?.id || emp.id === hrHead?.id || emp.id === opsHead?.id) managerId = ceo?.id || null;
    else if (deptName.includes('technology') || deptName.includes('engineering')) managerId = cto?.id || null;
    else if (deptName.includes('human resources')) managerId = hrHead?.id || null;
    else if (deptName.includes('operations')) managerId = opsHead?.id || null;
    else managerId = ceo?.id || null; // default everyone else to ceo just in case

    if (emp.reportingManagerId !== managerId) {
      await prisma.employee.update({ where: { id: emp.id }, data: { reportingManagerId: managerId } });
      console.log(`Updated ${emp.firstName} manager to ${managerId}`);
    }
  }
  
  console.log("Fixed!");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
