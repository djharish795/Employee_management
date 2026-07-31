const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const p = new PrismaClient();
const updates = [
  { name: 'Harsha Danthu Venkata', title: 'Backend Developer' },
  { name: 'Tejesh Boga', title: 'AI Automation Engineer' },
  { name: 'Charani Boga', title: 'Full Stack Engineer' },
  { name: 'Harish Eppili', title: 'Full Stack Developer' }
];
async function run() {
  for (const update of updates) {
    const firstName = update.name.split(' ')[0];
    const lastName = update.name.split(' ').slice(1).join(' ');
    const emp = await p.employee.findFirst({
      where: { firstName: firstName, lastName: lastName }
    });
    if (emp) {
      let desig = await p.designation.findFirst({
        where: { title: update.title }
      });
      if (!desig) {
        desig = await p.designation.create({
          data: { title: update.title, departmentId: emp.departmentId }
        });
      }
      await p.employee.update({
        where: { id: emp.id },
        data: { designationId: desig.id }
      });
      console.log('Updated', update.name, 'to', update.title);
    }
  }
}
run().then(() => {
  p.$disconnect();
  process.exit(0);
});
