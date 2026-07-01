import { PrismaClient, UserRole, EmployeeStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding executive users...");

  const deptExec = await prisma.department.findUnique({ where: { code: 'EXEC' } });
  const deptEng = await prisma.department.findUnique({ where: { code: 'ENG' } });
  const deptHr = await prisma.department.findUnique({ where: { code: 'HR' } });

  const DEV_PASSWORD = "ChangeMe123!";
  const DEV_PASSWORD_HASH = bcrypt.hashSync(DEV_PASSWORD, 10);

  const usersToSeed = [
    {
      empId: 'EMP-0001',
      firstName: 'Pradeep',
      lastName: 'Chandra',
      email: 'pradeep.chandra@naprocs.com',
      dept: deptExec?.id,
      role: UserRole.CEO,
    },
    {
      empId: 'EMP-0002',
      firstName: 'Lokesh',
      lastName: '',
      email: 'lokesh@naprocs.com',
      dept: deptExec?.id,
      role: UserRole.CTO,
    },
    {
      empId: 'EMP-0003',
      firstName: 'Tejesh',
      lastName: 'Kumar',
      email: 'tejesh@naprocs.com',
      dept: deptHr?.id,
      role: UserRole.CHRO,
    }
  ];

  for (const u of usersToSeed) {
    const employee = await prisma.employee.upsert({
      where: { employeeId: u.empId },
      update: { departmentId: u.dept },
      create: {
        employeeId: u.empId,
        firstName: u.firstName,
        lastName: u.lastName,
        officialEmail: u.email,
        departmentId: u.dept,
        status: EmployeeStatus.ACTIVE,
        joiningDate: new Date('2022-01-01'),
      }
    });

    await prisma.user.upsert({
      where: { email: employee.officialEmail },
      update: { role: u.role, passwordHash: DEV_PASSWORD_HASH },
      create: {
        employeeId: employee.id,
        email: employee.officialEmail,
        passwordHash: DEV_PASSWORD_HASH,
        role: u.role,
      }
    });
    console.log(`Seeded user: ${u.email}`);
  }

  console.log("Successfully seeded executive users!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
