import { PrismaClient, EmployeeStatus, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Fixing Designations and Adding COO placeholder...");

  // 1. Get or create departments
  const deptOps = await prisma.department.findUnique({ where: { code: 'OPS' } });
  const deptHr = await prisma.department.findUnique({ where: { code: 'HR' } });
  const deptExec = await prisma.department.findUnique({ where: { code: 'EXEC' } });

  if (!deptOps || !deptHr || !deptExec) throw new Error("Missing base departments!");

  // 2. Get or create Designations
  const desigOpsHead = await prisma.designation.upsert({
    where: { title_departmentId: { title: 'Operations Head', departmentId: deptOps.id } },
    update: {},
    create: { title: 'Operations Head', departmentId: deptOps.id }
  });

  const desigHrDir = await prisma.designation.upsert({
    where: { title_departmentId: { title: 'HR Manager', departmentId: deptHr.id } },
    update: {},
    create: { title: 'HR Manager', departmentId: deptHr.id }
  });

  const desigCoo = await prisma.designation.upsert({
    where: { title_departmentId: { title: 'Chief Operating Officer', departmentId: deptExec.id } },
    update: {},
    create: { title: 'Chief Operating Officer', departmentId: deptExec.id }
  });

  // 3. Update Junaid and Prince
  const junaid = await prisma.employee.findFirst({ where: { officialEmail: 'junaid@naprocs.in' } });
  if (junaid) {
    await prisma.employee.update({
      where: { id: junaid.id },
      data: { designationId: desigOpsHead.id, departmentId: deptOps.id }
    });
    console.log("Updated Junaid's designation to Operations Head");
  }

  const prince = await prisma.employee.findFirst({ where: { officialEmail: 'hr@naprocs.in' } });
  if (prince) {
    await prisma.employee.update({
      where: { id: prince.id },
      data: { designationId: desigHrDir.id, departmentId: deptHr.id }
    });
    console.log("Updated Prince's designation to HR Manager");
  }

  // 4. Add "None" as COO reporting to CEO
  const ceo = await prisma.employee.findFirst({ where: { officialEmail: 'pradeep.chandra@naprocs.in' } });
  if (ceo) {
    await prisma.employee.upsert({
      where: { employeeId: 'EMP-COO-NONE' },
      update: { reportingManagerId: ceo.id },
      create: {
        employeeId: 'EMP-COO-NONE',
        firstName: 'Vacant',
        lastName: '(None)',
        officialEmail: 'coo@naprocs.in',
        departmentId: deptExec.id,
        designationId: desigCoo.id,
        status: EmployeeStatus.INACTIVE,
        joiningDate: new Date(),
        reportingManagerId: ceo.id,
      }
    });
    console.log("Added Vacant (None) as COO reporting to CEO");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
