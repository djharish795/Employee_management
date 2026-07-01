import { PrismaClient, UserRole, EmployeeStatus, AttendanceStatus, CheckInMethod, Gender, MaritalStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const DEV_PASSWORD = 'ChangeMe123!';
const DEV_PASSWORD_HASH = bcrypt.hashSync(DEV_PASSWORD, 10);

async function main() {
  console.log('Starting seed for official employees with leave balances...');

  const deptExec = await prisma.department.findUnique({ where: { code: 'EXEC' } });
  const deptEng = await prisma.department.findUnique({ where: { code: 'ENG' } });
  const deptHr = await prisma.department.findUnique({ where: { code: 'HR' } });
  const deptFin = await prisma.department.findUnique({ where: { code: 'FIN' } });
  const deptOps = await prisma.department.findUnique({ where: { code: 'OPS' } });

  if (!deptExec || !deptEng || !deptHr || !deptFin || !deptOps) {
    throw new Error('Please run the base seed script first to populate departments.');
  }

  const getDesig = async (title: string, deptId: string) => {
    return prisma.designation.findUnique({
      where: { title_departmentId: { title, departmentId: deptId } },
    });
  };

  const desigCeo = await getDesig('Chief Executive Officer', deptExec.id);
  const desigCto = await getDesig('Chief Technology Officer', deptExec.id);
  const desigLeadArch = await getDesig('Lead Architect', deptEng.id);
  const desigBackend = await getDesig('Backend Developer', deptEng.id);
  const desigFrontend = await getDesig('Frontend Developer', deptEng.id);
  const desigQa = await getDesig('QA Engineer', deptEng.id);
  const desigHrExec = await getDesig('HR Executive', deptHr.id);
  const desigOpsHead = await getDesig('Operations Head', deptOps.id);
  const desigOpsExec = await getDesig('Operations Executive', deptOps.id);

  async function upsertEmployeeAndUser({ emp, userRole }: { emp: any; userRole: UserRole }) {
    const employee = await prisma.employee.upsert({
      where: { employeeId: emp.employeeId },
      update: emp,
      create: emp,
    });
    await prisma.user.upsert({
      where: { employeeId: employee.id },
      update: { role: userRole, email: employee.officialEmail },
      create: {
        employeeId: employee.id,
        email: employee.officialEmail,
        passwordHash: DEV_PASSWORD_HASH,
        role: userRole,
      },
    });
    return employee;
  }

  const ceo = await upsertEmployeeAndUser({
    emp: { employeeId: 'NAP/EX/001', firstName: 'Pradeep', lastName: 'Chandra', officialEmail: 'pradeep@naprocs.in', departmentId: deptExec.id, designationId: desigCeo?.id, status: EmployeeStatus.ACTIVE, joiningDate: new Date('2021-01-01'), gender: Gender.MALE, maritalStatus: MaritalStatus.MARRIED },
    userRole: UserRole.CEO,
  });

  const cto = await upsertEmployeeAndUser({
    emp: { employeeId: 'NAP/EX/002', firstName: 'Lokesh', lastName: 'Kumar', officialEmail: 'lokesh@naprocs.in', departmentId: deptExec.id, designationId: desigCto?.id, status: EmployeeStatus.ACTIVE, reportingManagerId: ceo.id, joiningDate: new Date('2021-02-01'), gender: Gender.MALE, maritalStatus: MaritalStatus.MARRIED },
    userRole: UserRole.CTO,
  });

  const opsHead = await upsertEmployeeAndUser({
    emp: { employeeId: 'NAP/OH/001', firstName: 'Junaid', lastName: '', officialEmail: 'junaid@naprocs.in', departmentId: deptOps.id, designationId: desigOpsHead?.id, status: EmployeeStatus.ACTIVE, reportingManagerId: ceo.id, joiningDate: new Date('2022-01-01'), gender: Gender.MALE, maritalStatus: MaritalStatus.MARRIED },
    userRole: UserRole.MANAGER,
  });

  const leadArch = await upsertEmployeeAndUser({
    emp: { employeeId: 'NAP/TR/002', firstName: 'Tejesh', lastName: 'Kumar', officialEmail: 'tejesh@naprocs.in', departmentId: deptEng.id, designationId: desigLeadArch?.id, status: EmployeeStatus.ACTIVE, reportingManagerId: cto.id, joiningDate: new Date('2022-01-15'), gender: Gender.MALE, maritalStatus: MaritalStatus.MARRIED },
    userRole: UserRole.EMPLOYEE,
  });

  const emps = [
    { id: 'NAP/TR/001', f: 'Ajay', l: 'Kumar', email: 'ajay@naprocs.in', d: deptEng, dg: desigBackend, m: leadArch.id, r: UserRole.EMPLOYEE, g: Gender.MALE, ms: MaritalStatus.MARRIED },
    { id: 'NAP/TR/003', f: 'Girish', l: '', email: 'girish@naprocs.in', d: deptEng, dg: desigFrontend, m: leadArch.id, r: UserRole.EMPLOYEE, g: Gender.MALE, ms: MaritalStatus.SINGLE },
    { id: 'NAP/TR/004', f: 'Varsha', l: '', email: 'varsha@naprocs.in', d: deptEng, dg: desigBackend, m: leadArch.id, r: UserRole.EMPLOYEE, g: Gender.FEMALE, ms: MaritalStatus.MARRIED },
    { id: 'NAP/TR/005', f: 'Harshitha', l: '', email: 'harshitha@naprocs.in', d: deptEng, dg: desigQa, m: leadArch.id, r: UserRole.EMPLOYEE, g: Gender.FEMALE, ms: MaritalStatus.SINGLE },
    { id: 'NAP/TR/006', f: 'Salman', l: '', email: 'salman@naprocs.in', d: deptEng, dg: desigBackend, m: leadArch.id, r: UserRole.EMPLOYEE, g: Gender.MALE, ms: MaritalStatus.SINGLE },
    { id: 'NAP/TR/007', f: 'Rahima', l: '', email: 'rahima@naprocs.in', d: deptEng, dg: desigFrontend, m: leadArch.id, r: UserRole.EMPLOYEE, g: Gender.FEMALE, ms: MaritalStatus.MARRIED },
    { id: 'NAP/TR/008', f: 'Sumanth', l: '', email: 'sumanth@naprocs.in', d: deptEng, dg: desigBackend, m: leadArch.id, r: UserRole.EMPLOYEE, g: Gender.MALE, ms: MaritalStatus.SINGLE },
    { id: 'NAP/TR/009', f: 'Harish', l: '', email: 'harish@naprocs.in', d: deptEng, dg: desigQa, m: leadArch.id, r: UserRole.EMPLOYEE, g: Gender.MALE, ms: MaritalStatus.SINGLE },
    { id: 'NAP/TR/010', f: 'Pavani', l: '', email: 'pavani@naprocs.in', d: deptEng, dg: desigFrontend, m: leadArch.id, r: UserRole.EMPLOYEE, g: Gender.FEMALE, ms: MaritalStatus.SINGLE },
    { id: 'NAP/TR/011', f: 'Vinay', l: '', email: 'vinay@naprocs.in', d: deptEng, dg: desigBackend, m: leadArch.id, r: UserRole.EMPLOYEE, g: Gender.MALE, ms: MaritalStatus.SINGLE },
    { id: 'NAP/TR/012', f: 'Kumar', l: 'Sai', email: 'kumar@naprocs.in', d: deptEng, dg: desigFrontend, m: leadArch.id, r: UserRole.EMPLOYEE, g: Gender.MALE, ms: MaritalStatus.SINGLE },
    { id: 'NAP/TR/013', f: 'Imthiyaz', l: '', email: 'imthiyaz@naprocs.in', d: deptEng, dg: desigBackend, m: leadArch.id, r: UserRole.EMPLOYEE, g: Gender.MALE, ms: MaritalStatus.SINGLE },
    { id: 'NAP/HR/001', f: 'Prince', l: 'Alpha', email: 'hr@naprocs.in', d: deptHr, dg: desigHrExec, m: ceo.id, r: UserRole.HR, g: Gender.MALE, ms: MaritalStatus.SINGLE },
    { id: 'NAP/OR/001', f: 'Sandeep', l: '', email: 'sandeep@naprocs.in', d: deptOps, dg: desigOpsExec, m: opsHead.id, r: UserRole.EMPLOYEE, g: Gender.MALE, ms: MaritalStatus.SINGLE },
    { id: 'NAP/OR/002', f: 'Sandya', l: 'Rani', email: 'sandya@naprocs.in', d: deptOps, dg: desigOpsExec, m: opsHead.id, r: UserRole.EMPLOYEE, g: Gender.FEMALE, ms: MaritalStatus.MARRIED }
  ];

  const allInsertedEmployees = [ceo, cto, opsHead, leadArch];

  for (const re of emps) {
    const inserted = await upsertEmployeeAndUser({
      emp: {
        employeeId: re.id,
        firstName: re.f,
        lastName: re.l,
        officialEmail: re.email,
        departmentId: re.d.id,
        designationId: re.dg?.id,
        status: EmployeeStatus.ACTIVE,
        reportingManagerId: re.m,
        joiningDate: new Date('2023-01-01'),
        gender: re.g,
        maritalStatus: re.ms
      },
      userRole: re.r,
    });
    allInsertedEmployees.push(inserted);
  }

  const currentYear = new Date().getFullYear();
  const clFullType = await prisma.leaveType.findUnique({ where: { code: 'CL_FULL' } });
  const clHalfType = await prisma.leaveType.findUnique({ where: { code: 'CL_HALF' } });
  const maternityType = await prisma.leaveType.findUnique({ where: { code: 'MATERNITY' } });
  const optionalType = await prisma.leaveType.findUnique({ where: { code: 'OPTIONAL' } });
  const compType = await prisma.leaveType.findUnique({ where: { code: 'COMP' } });

  for (const emp of allInsertedEmployees) {
    const balancesToUpsert = [];
    if (clFullType) balancesToUpsert.push({ type: clFullType, allocated: 12 });
    if (clHalfType) balancesToUpsert.push({ type: clHalfType, allocated: 6 });
    if (optionalType) balancesToUpsert.push({ type: optionalType, allocated: 2 });
    if (compType) balancesToUpsert.push({ type: compType, allocated: 0 });

    if (maternityType && emp.gender === 'FEMALE' && emp.maritalStatus === 'MARRIED') {
      balancesToUpsert.push({ type: maternityType, allocated: 180 });
    }

    for (const b of balancesToUpsert) {
      await prisma.leaveBalance.upsert({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: emp.id,
            leaveTypeId: b.type.id,
            year: currentYear
          }
        },
        update: {},
        create: {
          employeeId: emp.id,
          leaveTypeId: b.type.id,
          year: currentYear,
          allocated: b.allocated,
          used: 0,
          pending: b.allocated
        }
      });
    }
  }

  console.log('Official employee data and leave balances seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
