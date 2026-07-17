import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function determineQueue(employee: any) {
    let queue: any[] = [];
    const role = employee.user?.role === 'EMPLOYEE' ? (employee.designation?.title || 'EMPLOYEE') : employee.user?.role;
    if (['TR', 'TS', 'TL', 'QA', 'QE', 'HRE'].includes(employee.designation?.title || '')) {
       // getRoleForEmployee does this
    }

    const projectAssignment = await prisma.projectAssignment.findFirst({
      where: { employeeId: employee.id, releasedAt: null },
      include: {
        project: {
          include: {
            assignments: {
              where: { projectRole: 'TL', releasedAt: null }
            }
          }
        }
      }
    });

    let teamLeadId = undefined;
    if (projectAssignment && projectAssignment.project.assignments.length > 0) {
      teamLeadId = projectAssignment.project.assignments[0].employeeId;
    }

    if (teamLeadId && teamLeadId !== employee.id) {
       queue.push({ role: 'TL', status: 'PENDING', approverId: teamLeadId });
    } else if (employee.reportingManagerId) {
       queue.push({ role: 'MANAGER', status: 'PENDING', approverId: employee.reportingManagerId });
    }

    queue.push({ role: 'HRE', status: 'PENDING', approverId: employee.assignedHrId || undefined });

    return queue;
}

async function main() {
  const employee = await prisma.employee.findFirst({ where: { user: { email: 'salman@naprocs.in' } }, include: { designation: true, user: true } });
  if (!employee) return console.log('Salman not found');
  const q = await determineQueue(employee);
  console.log(q);
}
main().finally(() => prisma.$disconnect());
