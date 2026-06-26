import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getOrCreateDept(name: string) {
  let dept = await prisma.department.findFirst({ where: { name } });
  if (!dept) {
    const code = name.split(' ').map(w => w[0]).join('').toUpperCase() + Math.floor(Math.random() * 100);
    dept = await prisma.department.create({
      data: {
        name,
        code
      }
    });
  }
  return dept;
}

async function getOrCreateDesignation(title: string, deptId: string) {
  let desig = await prisma.designation.findFirst({ where: { title, departmentId: deptId } });
  if (!desig) {
    desig = await prisma.designation.create({
      data: {
        title,
        departmentId: deptId
      }
    });
  }
  return desig;
}

async function main() {
  console.log("Setting up Departments and Designations...");
  
  const engineering = await getOrCreateDept("Engineering");
  const rd = await getOrCreateDept("Research and Development");

  const backendDesig = await getOrCreateDesignation("Backend Developer", engineering.id);
  const frontendDesig = await getOrCreateDesignation("Frontend Developer", engineering.id);
  const fullstackDesig = await getOrCreateDesignation("Full Stack Developer", engineering.id);
  const rdDesig = await getOrCreateDesignation("Research and Development", rd.id);

  console.log("Updating employees...");

  const updateEmp = async (nameMatches: string[], deptId: string | null, desigId: string | null) => {
    for (const match of nameMatches) {
      const emps = await prisma.employee.findMany({
        where: {
          OR: [
            { firstName: { contains: match, mode: 'insensitive' } },
            { lastName: { contains: match, mode: 'insensitive' } }
          ]
        }
      });
      
      for (const emp of emps) {
        await prisma.employee.update({
          where: { id: emp.id },
          data: {
            departmentId: deptId,
            designationId: desigId
          }
        });
        console.log(`Updated ${emp.firstName} ${emp.lastName}`);
      }
    }
  };

  await updateEmp(["Imthiyaz", "Varsha", "Sumanth"], engineering.id, backendDesig.id);
  await updateEmp(["Harshitha", "Harish", "Pavani", "Tejesh"], engineering.id, fullstackDesig.id);
  await updateEmp(["Ajay", "Salman", "Rahima", "Vinay", "Kumar Sai"], engineering.id, frontendDesig.id);
  await updateEmp(["Sandeep"], rd.id, rdDesig.id);
  await updateEmp(["Sandya"], null, null);

  console.log("Done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
