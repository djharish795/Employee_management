const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();
async function main() {
  // Find the OM (Junaid)
  const om = await prisma.employee.findFirst({
    where: { user: { role: 'OM' } },
    include: { user: true, designation: true }
  });
  if (!om) {
    console.log("No OM found!");
    return;
  }
  console.log("OM Found:", om.firstName, om.lastName, "ID:", om.id);

  // Find all OE, CRM, CEM employees
  const opsEmployees = await prisma.employee.findMany({
    where: {
      status: 'ACTIVE',
      designation: {
        title: {
          in: ['OE', 'CRM', 'CEM', 'CAM', 'Operations Executive', 'Client Relationship Manager', 'Client Engagement Manager', 'Client Acquisition Manager']
        }
      }
    },
    include: { designation: true }
  });

  console.log(`Found ${opsEmployees.length} operations employees`);
  for (const emp of opsEmployees) {
    console.log(`  - ${emp.firstName} ${emp.lastName} | ${emp.designation?.title} | currentManager: ${emp.reportingManagerId}`);
  }

  // Also check by user role
  const userRoleOps = await prisma.employee.findMany({
    where: {
      status: 'ACTIVE',
      user: { role: { in: ['OE', 'CRM', 'CEM', 'CAM'] } }
    },
    include: { user: true, designation: true }
  });
  console.log(`\nFound ${userRoleOps.length} ops employees by user role`);
  for (const emp of userRoleOps) {
    console.log(`  - ${emp.firstName} ${emp.lastName} | role: ${emp.user?.role} | designation: ${emp.designation?.title} | currentManager: ${emp.reportingManagerId}`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
