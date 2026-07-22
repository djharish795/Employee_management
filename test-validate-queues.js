const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

function getRoleForEmployee(employee) {
  if (employee.user?.role) {
    if (['CEO', 'CTO', 'OM'].includes(employee.user.role)) {
      return employee.user.role;
    }
  }
  const designTitle = (employee.designation?.title || '').toUpperCase();
  if (designTitle.includes('TRAINEE RESEARCHER') || designTitle === 'TR') return 'TR';
  if (designTitle.includes('TEAM LEAD') || designTitle === 'TL') return 'TL';
  if (designTitle.includes('OPERATIONS EXECUTIVE') || designTitle === 'OE') return 'OE';
  if (designTitle.includes('CLIENT ACQUISITION MANAGER') || designTitle === 'CAM') return 'CAM';
  if (designTitle.includes('CLIENT RELATIONSHIP MANAGER') || designTitle === 'CRM') return 'CRM';
  if (designTitle.includes('CLIENT ENGAGEMENT MANAGER') || designTitle === 'CEM') return 'CEM';
  if (designTitle.includes('HR EXECUTIVE') || designTitle === 'HRE') return 'HRE';
  const deptCode = employee.department?.code || '';
  if (deptCode === 'HR') return 'HRE';
  return employee.user?.role || 'EMPLOYEE';
}

async function main() {
  const employees = await prisma.employee.findMany({
    where: { status: 'ACTIVE' },
    include: { user: true, designation: true, department: true }
  });

  console.log("=== LEAVE APPROVAL QUEUE SIMULATION ===\n");

  for (const emp of employees) {
    const role = getRoleForEmployee(emp);
    let queue = [];

    // Simulate queue logic (non-emergency)
    if (role === 'CTO' || role === 'OM') {
      queue = [{ role: 'CEO', note: 'Direct → CEO' }];
    } else if (role === 'TR') {
      // Would check project TL, simplified
      queue = [
        { role: 'TL / MANAGER', note: 'Project TL or Reporting Manager' },
        { role: 'HRE', note: 'HR Executive' }
      ];
    } else if (role === 'TL') {
      queue = [
        { role: 'MANAGER', approverId: emp.reportingManagerId, note: 'Reporting Manager' },
        { role: 'HRE', note: 'HR Executive' }
      ];
    } else if (['OE', 'CRM', 'CEM', 'CAM'].includes(role)) {
      queue = [
        { role: 'OM', approverId: emp.reportingManagerId, note: 'Operations Manager (OM)' },
        { role: 'HRE', note: 'HR Executive' }
      ];
    } else if (role === 'HRE') {
      queue = [{ role: 'MANAGER', approverId: emp.reportingManagerId, note: 'HR Manager' }];
    } else if (role === 'CEO') {
      queue = [{ role: '—', note: 'CEO has no approver' }];
    } else {
      queue = [
        { role: 'TL / MANAGER', note: 'Project TL or Reporting Manager' },
        { role: 'HRE', note: 'HR Executive' }
      ];
    }

    const name = `${emp.firstName} ${emp.lastName}`.trim();
    console.log(`👤 ${name} | Role: ${role}`);
    queue.forEach((q, i) => console.log(`   Step ${i+1}: ${q.role} ${q.approverId ? '(ID: '+q.approverId.slice(-6)+')' : ''} — ${q.note}`));
    console.log(`   📣 Emergency (< 24h) — CEO added as extra final step (except CEO/CTO/OM)`);
    console.log();
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
