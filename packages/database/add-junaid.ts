import { PrismaClient, UserRole, EmployeeStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Adding Junaid as Operations Head...");

  const deptOps = await prisma.department.findUnique({ where: { code: 'OPS' } });
  if (!deptOps) throw new Error("Operations department not found!");

  const ceo = await prisma.employee.findFirst({ where: { officialEmail: 'pradeep.chandra@naprocs.in' }});
  
  const empId = 'EMP-0016';
  
  const employee = await prisma.employee.upsert({
    where: { employeeId: empId },
    update: {},
    create: {
      employeeId: empId,
      firstName: 'Junaid',
      lastName: '',
      officialEmail: 'junaid@naprocs.in',
      departmentId: deptOps.id,
      status: EmployeeStatus.ACTIVE,
      joiningDate: new Date('2023-01-01'),
      reportingManagerId: ceo?.id,
    }
  });

  const DEV_PASSWORD = "ChangeMe123!";
  const DEV_PASSWORD_HASH = bcrypt.hashSync(DEV_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: employee.officialEmail },
    update: { role: 'OPERATIONS_HEAD' as UserRole },
    create: {
      employeeId: employee.id,
      email: employee.officialEmail,
      passwordHash: DEV_PASSWORD_HASH,
      role: 'OPERATIONS_HEAD' as UserRole,
    }
  });

  console.log("Successfully added Junaid as Operations Head!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
