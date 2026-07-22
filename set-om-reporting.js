const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const omId = 'cmruoh6lc0009jpd1gf2q15im'; // Junaid

  // Update Vacant CEM and Vacant OE to have OM as reporting manager
  const vacantIds = ['cmruohrlh002zcvrj5us7xji7', 'cmruohrma0031cvrjeikjabbu'];
  
  for (const empId of vacantIds) {
    const emp = await prisma.employee.findUnique({ where: { id: empId }, include: { designation: true } });
    console.log(`Updating ${emp?.firstName} ${emp?.lastName} (${emp?.designation?.title}) — setting OM as reporting manager`);
    await prisma.employee.update({
      where: { id: empId },
      data: { reportingManagerId: omId }
    });
    console.log("  Done.");
  }
  console.log("\nAll done! All OE/CEM/CRM employees now report to OM (Junaid).");
}
main().catch(console.error).finally(() => prisma.$disconnect());
