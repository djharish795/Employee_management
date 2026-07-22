import { PrismaClient, UserRole, EmployeeStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Restoring specific users and cleaning mock data...');

  // 1. Delete the mock data
  await prisma.followUp.deleteMany({});
  await prisma.meeting.deleteMany({});
  await prisma.cemLead.deleteMany({});
  await prisma.workReport.deleteMany({});
  await prisma.fieldWorkRequest.deleteMany({});
  console.log('Deleted mock operational data.');

  // 2. Add CRM (divya) and CEM (swetha)
  const passwordHash = await bcrypt.hash('ChangeMe123!', 10);

  const createUser = async (email: string, role: UserRole, firstName: string, lastName: string, empId: string) => {
    let deptCode = 'SALES';
    let department = await prisma.department.findUnique({ where: { code: deptCode } });
    if (!department) {
      department = await prisma.department.create({ data: { name: deptCode, code: deptCode } });
    }

    const employee = await prisma.employee.upsert({
      where: { employeeId: empId },
      update: {
        firstName,
        lastName,
        officialEmail: email,
      },
      create: {
        employeeId: empId,
        firstName,
        lastName,
        officialEmail: email,
        status: EmployeeStatus.ACTIVE,
        departmentId: department.id,
      },
    });

    const user = await prisma.user.upsert({
      where: { email },
      update: { role, passwordHash, employeeId: employee.id },
      create: {
        email,
        passwordHash,
        role,
        employeeId: employee.id,
      },
    });

    console.log(`Restored: ${email} as ${role}`);
    return { employee, user };
  };

  await createUser('divya@naprocs.in', UserRole.CRM, 'Divya', '', 'EMP-CRM-DIVYA');
  await createUser('swetha@naprocs.in', UserRole.CEM, 'Swetha', '', 'EMP-CEM-SWETHA');

  console.log('Done restoring users.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
