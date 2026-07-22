const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const junaid = await prisma.employee.findFirst({ 
    where: { firstName: { contains: 'Junaid' } },
    include: { user: true, designation: true, department: true } 
  });
  console.log("Junaid details:", junaid);

  if (junaid) {
    const projectAssignment = await prisma.projectAssignment.findFirst({
      where: { employeeId: junaid.id, releasedAt: null },
      include: { project: { include: { assignments: { where: { projectRole: 'TL', releasedAt: null } } } } }
    });
    console.log("Project assignment:", JSON.stringify(projectAssignment, null, 2));
    
    if (junaid.reportingManagerId) {
      const manager = await prisma.employee.findUnique({ where: { id: junaid.reportingManagerId }});
      console.log("Reporting Manager:", manager?.firstName, manager?.lastName);
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
