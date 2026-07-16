import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function getOrCreateDept(name: string) {
  let dept = await prisma.department.findFirst({ where: { name } });
  if (!dept) {
    const code = name.split(' ').map(w => w[0]).join('').toUpperCase() + Math.floor(Math.random() * 100);
    dept = await prisma.department.create({ data: { name, code } });
  }
  return dept;
}

async function getOrCreateDesignation(title: string, deptId: string) {
  let desig = await prisma.designation.findFirst({ where: { title, departmentId: deptId } });
  if (!desig) {
    desig = await prisma.designation.create({ data: { title, departmentId: deptId } });
  }
  return desig;
}

async function main() {
  const engineering = await getOrCreateDept("Engineering");
  const qaDesig = await getOrCreateDesignation("QA Engineer", engineering.id);
  const backendDesig = await getOrCreateDesignation("Backend Developer", engineering.id);

  const girish = await prisma.employee.findFirst({ where: { firstName: { contains: 'Girish', mode: 'insensitive' } }});
  if (girish) {
    await prisma.employee.update({ where: { id: girish.id }, data: { departmentId: engineering.id, designationId: qaDesig.id }});
    console.log(`Updated Girish to QA Engineer`);
  }

  const charani = await prisma.employee.findFirst({ where: { firstName: { contains: 'Charani', mode: 'insensitive' } }});
  if (charani) {
    await prisma.employee.update({ where: { id: charani.id }, data: { departmentId: engineering.id, designationId: backendDesig.id }});
    console.log(`Updated Charani to Backend Developer`);
  }
}
main().finally(() => prisma.$disconnect());
