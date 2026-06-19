import { PrismaClient, UserRole, EmployeeStatus, AttendanceStatus, CheckInMethod } from '@prisma/client';
import * as bcrypt from 'bcrypt'; // User requested to use bcrypt.hashSync. Ensure this works, otherwise we fall back.

const prisma = new PrismaClient();

// This hash must never be used in production. Dev-only placeholder.
const DEV_PASSWORD = 'ChangeMe123!';
const DEV_PASSWORD_HASH = bcrypt.hashSync(DEV_PASSWORD, 10);

async function main() {
  console.log('Starting seed for employees...');

  // 1. Fetch reference data
  const deptExec = await prisma.department.findUnique({ where: { code: 'EXEC' } });
  const deptEng = await prisma.department.findUnique({ where: { code: 'ENG' } });
  const deptHr = await prisma.department.findUnique({ where: { code: 'HR' } });
  const deptSales = await prisma.department.findUnique({ where: { code: 'SALES' } });
  const deptFin = await prisma.department.findUnique({ where: { code: 'FIN' } });
  const deptOps = await prisma.department.findUnique({ where: { code: 'OPS' } });

  if (!deptExec || !deptEng || !deptHr || !deptSales || !deptFin || !deptOps) {
    throw new Error('Please run the base seed script first to populate departments.');
  }

  const getDesig = async (title: string, deptId: string) => {
    return prisma.designation.findUnique({
      where: { title_departmentId: { title, departmentId: deptId } },
    });
  };

  const desigCeo = await getDesig('Chief Executive Officer', deptExec.id);
  const desigCto = await getDesig('Chief Technology Officer', deptExec.id);
  const desigHrDir = await getDesig('HR Management Director', deptHr.id);

  if (!desigCeo || !desigCto || !desigHrDir) {
    throw new Error('Please run the base seed script first to populate designations.');
  }

  // Helper to upsert Employee + User
  async function upsertEmployeeAndUser({ emp, userRole }: { emp: any; userRole: UserRole }) {
    const employee = await prisma.employee.upsert({
      where: { employeeId: emp.employeeId },
      update: emp,
      create: emp,
    });

    await prisma.user.upsert({
      where: { email: employee.officialEmail },
      update: { role: userRole },
      create: {
        employeeId: employee.id,
        email: employee.officialEmail,
        passwordHash: DEV_PASSWORD_HASH,
        role: userRole,
      },
    });

    return employee;
  }

  // 1. CEO
  const ceo = await upsertEmployeeAndUser({
    emp: {
      employeeId: 'EMP-0001',
      firstName: 'Pradeep',
      lastName: 'Chandra',
      officialEmail: 'pradeep.chandra@naprocs.in',
      departmentId: deptExec.id,
      designationId: desigCeo.id,
      status: EmployeeStatus.ACTIVE,
      joiningDate: new Date('2021-01-01'),
    },
    userRole: UserRole.CEO,
  });

  // 2. CTO
  const cto = await upsertEmployeeAndUser({
    emp: {
      employeeId: 'EMP-0002',
      firstName: 'Lokesh',
      lastName: 'Kumar',
      officialEmail: 'lokesh@naprocs.in',
      departmentId: deptExec.id,
      designationId: desigCto.id,
      status: EmployeeStatus.ACTIVE,
      reportingManagerId: ceo.id,
      joiningDate: new Date('2021-02-01'),
    },
    userRole: UserRole.CTO,
  });

  // 3. HR Director
  const hrDir = await upsertEmployeeAndUser({
    emp: {
      employeeId: 'EMP-0003',
      firstName: 'Tejesh',
      lastName: 'Kumar',
      officialEmail: 'tejesh.kumar@naprocs.in',
      departmentId: deptHr.id,
      designationId: desigHrDir.id,
      status: EmployeeStatus.ACTIVE,
      reportingManagerId: ceo.id,
      joiningDate: new Date('2021-03-01'),
    },
    userRole: UserRole.HR,
  });

  // 4. Additional Employees
  const desigLeadArch = await getDesig('Lead Architect', deptEng.id);
  const desigBackend = await getDesig('Backend Developer', deptEng.id);
  const desigFrontend = await getDesig('Frontend Developer', deptEng.id);
  const desigHrExec = await getDesig('HR Executive', deptHr.id);
  const desigFinExec = await getDesig('Finance Executive', deptFin.id);

  // EMP-0004: Manager (Lead Architect)
  const leadArch = await upsertEmployeeAndUser({
    emp: {
      employeeId: 'EMP-0004',
      firstName: 'Aditi',
      lastName: 'Sharma',
      officialEmail: 'aditi.sharma@naprocs.in',
      departmentId: deptEng.id,
      designationId: desigLeadArch?.id,
      status: EmployeeStatus.ACTIVE,
      reportingManagerId: cto.id,
      joiningDate: new Date('2022-01-15'),
    },
    userRole: UserRole.MANAGER,
  });

  // EMP-0005: Manager (Finance)
  const finManager = await upsertEmployeeAndUser({
    emp: {
      employeeId: 'EMP-0005',
      firstName: 'Vikram',
      lastName: 'Singh',
      officialEmail: 'vikram.singh@naprocs.in',
      departmentId: deptFin.id,
      designationId: desigFinExec?.id,
      status: EmployeeStatus.ACTIVE,
      reportingManagerId: ceo.id,
      joiningDate: new Date('2022-04-10'),
    },
    userRole: UserRole.MANAGER,
  });

  const remainingEmps = [
    { id: '0006', f: 'Rohan', l: 'Gupta', d: deptEng, dg: desigBackend, m: leadArch.id, s: EmployeeStatus.ACTIVE, j: '2022-06-01' },
    { id: '0007', f: 'Priya', l: 'Patel', d: deptEng, dg: desigFrontend, m: leadArch.id, s: EmployeeStatus.ACTIVE, j: '2022-08-15' },
    { id: '0008', f: 'Rahul', l: 'Verma', d: deptEng, dg: desigBackend, m: leadArch.id, s: EmployeeStatus.PROBATION, j: '2024-01-10' },
    { id: '0009', f: 'Sneha', l: 'Reddy', d: deptHr, dg: desigHrExec, m: hrDir.id, s: EmployeeStatus.ACTIVE, j: '2023-02-01' },
    { id: '0010', f: 'Arjun', l: 'Nair', d: deptFin, dg: desigFinExec, m: finManager.id, s: EmployeeStatus.NOTICE_PERIOD, j: '2023-05-15' },
    { id: '0011', f: 'Kavita', l: 'Joshi', d: deptSales, dg: null, m: ceo.id, s: EmployeeStatus.ACTIVE, j: '2023-09-01' },
    { id: '0012', f: 'Suresh', l: 'Kumar', d: deptOps, dg: null, m: ceo.id, s: EmployeeStatus.ACTIVE, j: '2023-11-20' },
    { id: '0013', f: 'Neha', l: 'Mishra', d: deptEng, dg: desigFrontend, m: leadArch.id, s: EmployeeStatus.ACTIVE, j: '2024-03-01' },
    { id: '0014', f: 'Karan', l: 'Malhotra', d: deptEng, dg: desigBackend, m: leadArch.id, s: EmployeeStatus.ACTIVE, j: '2024-04-15' },
    { id: '0015', f: 'Pooja', l: 'Iyer', d: deptHr, dg: desigHrExec, m: hrDir.id, s: EmployeeStatus.ACTIVE, j: '2024-05-10' },
  ];

  const createdRemaining = [];
  for (const re of remainingEmps) {
    const e = await upsertEmployeeAndUser({
      emp: {
        employeeId: `EMP-${re.id}`,
        firstName: re.f,
        lastName: re.l,
        officialEmail: `${re.f.toLowerCase()}.${re.l.toLowerCase()}@naprocs.in`,
        departmentId: re.d.id,
        designationId: re.dg?.id,
        status: re.s,
        reportingManagerId: re.m,
        joiningDate: new Date(re.j),
      },
      userRole: UserRole.EMPLOYEE,
    });
    createdRemaining.push(e);
  }

  // 6. Leave Balances for 3 employees (CEO, leadArch, and Rohan)
  const leaveTypes = await prisma.leaveType.findMany();
  const currentYear = new Date().getFullYear();
  const empsForLeave = [ceo, leadArch, createdRemaining[0]]; // createdRemaining[0] is Rohan

  for (const emp of empsForLeave) {
    for (const lt of leaveTypes) {
      // used is a random number between 0 and allocated
      const used = Math.floor(Math.random() * (Number(lt.maxDaysPerYear) + 1));
      
      await prisma.leaveBalance.upsert({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: emp.id,
            leaveTypeId: lt.id,
            year: currentYear,
          },
        },
        update: {},
        create: {
          employeeId: emp.id,
          leaveTypeId: lt.id,
          year: currentYear,
          allocated: lt.maxDaysPerYear,
          used: used,
          pending: Number(lt.maxDaysPerYear) - used,
        },
      });
    }
  }

  // 7. Attendance Records for 2 employees (Priya and Sneha)
  const empsForAttendance = [createdRemaining[1], createdRemaining[3]]; // Priya, Sneha

  const today = new Date();
  for (const emp of empsForAttendance) {
    for (let i = 0; i < 10; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      
      // Skip weekends
      if (d.getDay() === 0 || d.getDay() === 6) {
        continue;
      }

      // Check-in around 9:00 - 9:30 AM
      const checkInTime = new Date(d);
      checkInTime.setHours(9, Math.floor(Math.random() * 30), 0, 0);

      // Check-out around 6:00 - 6:30 PM (18:00 - 18:30)
      const checkOutTime = new Date(d);
      checkOutTime.setHours(18, Math.floor(Math.random() * 30), 0, 0);

      // Calculate work hours (approx 9 hours)
      const workHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

      const dStr = d.toISOString().split('T')[0] + 'T00:00:00.000Z'; // normalize to start of day

      await prisma.attendanceRecord.upsert({
        where: {
          employeeId_date: {
            employeeId: emp.id,
            date: new Date(dStr),
          },
        },
        update: {},
        create: {
          employeeId: emp.id,
          date: new Date(dStr),
          checkInTime: checkInTime,
          checkOutTime: checkOutTime,
          workHours: workHours.toFixed(2) as any,
          status: AttendanceStatus.PRESENT,
          checkInMethod: CheckInMethod.WEB,
        },
      });
    }
  }

  console.log('Sample data seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
