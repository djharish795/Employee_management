import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Setting up Executive Roles...");

  const updateExec = async (name: string, role: string, designationTitle: string, deptName: string) => {
    let dept = await prisma.department.findFirst({ where: { name: deptName } });
    if (!dept) {
      const code = deptName.split(' ').map(w => w[0]).join('').toUpperCase() + Math.floor(Math.random() * 100);
      dept = await prisma.department.create({ data: { name: deptName, code } });
    }

    let desig = await prisma.designation.findFirst({ where: { title: designationTitle, departmentId: dept.id } });
    if (!desig) desig = await prisma.designation.create({ data: { title: designationTitle, departmentId: dept.id } });

    const emp = await prisma.employee.findFirst({
      where: { OR: [{ firstName: { contains: name, mode: 'insensitive' } }, { lastName: { contains: name, mode: 'insensitive' } }] }
    });

    if (emp) {
      await prisma.employee.update({
        where: { id: emp.id },
        data: { departmentId: dept.id, designationId: desig.id }
      });
      console.log(`Updated ${emp.firstName} ${emp.lastName} to ${designationTitle}`);
    } else {
      console.log(`Employee ${name} not found`);
    }
  };

  await updateExec("Pradeep", "CEO", "CEO", "Executive");
  await updateExec("Lokesh", "CTO", "CTO", "Executive");
  await updateExec("Junaid", "OPERATIONS_HEAD", "Operations Head", "Operations");
  await updateExec("Prince", "HR", "HR Manager", "Human Resources");

  // Re-run Kumar Sai
  const engineering = await prisma.department.findFirst({ where: { name: "Engineering" } });
  const frontendDesig = await prisma.designation.findFirst({ where: { title: "Frontend Developer", departmentId: engineering?.id } });

  if (engineering && frontendDesig) {
    const emp = await prisma.employee.findFirst({
      where: { lastName: { contains: "KARELLA", mode: "insensitive" } }
    });
    if (emp) {
      await prisma.employee.update({
        where: { id: emp.id },
        data: { departmentId: engineering.id, designationId: frontendDesig.id }
      });
      console.log(`Updated ${emp.firstName} ${emp.lastName} to Frontend Developer`);
    }
  }
}
main().finally(() => prisma.$disconnect());
