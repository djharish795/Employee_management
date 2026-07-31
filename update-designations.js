const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const p = new PrismaClient();

const updates = [
  { name: "Harshitha Chandireddy", title: "Full Stack Developer" },
  { name: "Ajay M N V V", title: "Frontend Software Engineer" }, // Covers "only Software Engineer" + "frontend"
  { name: "Sai Boyapati", title: "Backend Developer" },
  { name: "Kumara Karella", title: "Frontend Developer" },
  { name: "Imthiyaz Shaik", title: "Backend Developer" },
  { name: "Pavani Addepalli", title: "Full Stack Developer" },
  { name: "Girish Karriyavula", title: "QA Engineer" },
  { name: "Varsha Degala Sri", title: "Backend Developer" },
  { name: "Salman Shaik", title: "Full Stack Developer" },
  { name: "Tulasi K", title: "Backend Developer" },
  { name: "Harsha Danthu Venkata", title: "AI Automation Engineer" },
  { name: "Tejesh Boga", title: "Full Stack Developer" },
  { name: "Sai Kondapalli", title: "Full Stack Developer" },
  { name: "Charani Boga", title: "Frontend Developer" },
  { name: "Harish Eppili", title: "Frontend Developer" }
];

async function run() {
  for (const update of updates) {
    const firstName = update.name.split(' ')[0];
    const lastName = update.name.split(' ').slice(1).join(' ');

    const emp = await p.employee.findFirst({
      where: { firstName: firstName, lastName: lastName }
    });

    if (emp) {
      // Find or create designation
      let desig = await p.designation.findFirst({
        where: { title: update.title }
      });
      if (!desig) {
        desig = await p.designation.create({
          data: {
            title: update.title,
            departmentId: emp.departmentId // Associate with their current dept
          }
        });
      }
      
      // Update employee
      await p.employee.update({
        where: { id: emp.id },
        data: { designationId: desig.id }
      });
      console.log(`Updated ${update.name} to ${update.title}`);
    } else {
      console.log(`Could not find employee ${update.name}`);
    }
  }
}

run().then(() => {
  p.$disconnect();
  process.exit(0);
});
