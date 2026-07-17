import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const hr = await prisma.employee.findFirst({
    where: { department: { code: 'HR' } }
  });
  const om = await prisma.employee.findFirst({
    where: { user: { role: 'MANAGER' } }
  });

  console.log('HR found:', hr?.id);
  console.log('OM found:', om?.id);

  if (hr && om) {
    const res = await prisma.employee.updateMany({
      data: {
        assignedHrId: hr.id,
        reportingManagerId: om.id
      }
    });
    console.log('Updated employees:', res.count);
  } else {
    console.log('HR or OM not found. Searching fallback...');
    const anyHr = await prisma.employee.findFirst({ where: { designation: { title: 'HRE' } }});
    const anyOm = await prisma.employee.findFirst({ where: { designation: { title: 'OM' } }});
    if (anyHr && anyOm) {
      const res = await prisma.employee.updateMany({
        data: { assignedHrId: anyHr.id, reportingManagerId: anyOm.id }
      });
      console.log('Updated employees using fallback:', res.count);
    }
  }
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
