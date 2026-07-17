import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const employee = await prisma.employee.findFirst({ where: { user: { email: 'salman@naprocs.in' } } });
  if (!employee) return console.log('Salman not found');

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

  console.dir(projectAssignment, { depth: null });
}
main().finally(() => prisma.$disconnect());
