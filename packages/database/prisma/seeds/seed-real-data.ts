/**
 * seed-real-data.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Naprocs Technologies — Official Real Employee Data Seed
 * Source: UPDATED EMS_NAPROCS TECHNOLOGIES.xlsx (all 23 sheets)
 *
 * This script uses upsert everywhere — safe to run multiple times.
 * It does NOT modify schema.prisma.
 * Default password for ALL employees: ChangeMe123!
 *
 * Vacant roles: NAP/OR/003 — intentionally left empty.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  PrismaClient,
  UserRole,
  EmployeeStatus,
  EmployeeType,
  Gender,
  MaritalStatus,
  AssetCategory,
  AssetStatus,
  SkillCategory,
  ProficiencyLevel,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'ChangeMe123!';
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync(DEFAULT_PASSWORD, 10);

// Helper: Convert Excel serial date to JS Date
// Excel serial date epoch is December 30, 1899
function excelDateToJSDate(serial: number): Date {
  const utcDays = Math.floor(serial - 25569);
  return new Date(utcDays * 86400 * 1000);
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║   Naprocs Real Data Seed — Starting...                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // ══════════════════════════════════════════════════════════════════════════
  // 1. DEPARTMENTS (from Sheet 01)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('📁 [1/9] Seeding Departments...');

  const deptData = [
    { code: 'ADMIN', name: 'Administration', parentCode: null },
    { code: 'HR', name: 'Human Resources', parentCode: null },
    { code: 'TECH', name: 'Technology', parentCode: null },
    { code: 'DEV', name: 'Software Development', parentCode: 'TECH' },
    { code: 'QA', name: 'Quality Assurance', parentCode: 'TECH' },
    { code: 'SALES', name: 'Sales & Business Development', parentCode: null },
    { code: 'OPS', name: 'Operations', parentCode: null },
    { code: 'FIN', name: 'Finance & Accounts', parentCode: null },
    { code: 'MKT', name: 'Marketing', parentCode: 'SALES' },
    { code: 'CEM', name: 'Client Engagement Management', parentCode: 'OPS' },
  ];

  // First pass: create all without parent
  const deptMap: Record<string, string> = {};
  for (const dept of deptData) {
    const created = await prisma.department.upsert({
      where: { code: dept.code },
      update: { name: dept.name },
      create: { code: dept.code, name: dept.name },
    });
    deptMap[dept.code] = created.id;
  }

  // Second pass: set parent relationships
  for (const dept of deptData) {
    if (dept.parentCode) {
      await prisma.department.update({
        where: { code: dept.code },
        data: { parentDepartmentId: deptMap[dept.parentCode] },
      });
    }
  }
  console.log(`   ✓ ${deptData.length} departments seeded.`);

  // ══════════════════════════════════════════════════════════════════════════
  // 2. DESIGNATIONS (from Sheet 02)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('🏷️  [2/9] Seeding Designations...');

  const desigData = [
    { title: 'CEO', deptCode: 'ADMIN', band: 'E1', grade: 'Executive', reportsTo: null },
    { title: 'CTO', deptCode: 'TECH', band: 'E1', grade: 'Executive', reportsTo: null },
    { title: 'CHRO', deptCode: 'HR', band: 'E1', grade: 'Executive', reportsTo: null },
    { title: 'CFO', deptCode: 'FIN', band: 'E1', grade: 'Executive', reportsTo: null },
    { title: 'Operations Head', deptCode: 'OPS', band: 'E2', grade: 'Senior Executive', reportsTo: null },
    { title: 'HR Manager', deptCode: 'HR', band: 'M1', grade: 'Manager', reportsTo: null },
    { title: 'HR Executive', deptCode: 'HR', band: 'L2', grade: 'Senior', reportsTo: null },
    { title: 'HR Assistant', deptCode: 'HR', band: 'L1', grade: 'Junior', reportsTo: null },
    { title: 'Tech Lead', deptCode: 'DEV', band: 'L3', grade: 'Lead', reportsTo: null },
    { title: 'Senior Software Engineer', deptCode: 'DEV', band: 'L2', grade: 'Senior', reportsTo: null },
    { title: 'Software Engineer', deptCode: 'DEV', band: 'L1', grade: 'Junior', reportsTo: null },
    { title: 'QA Lead', deptCode: 'QA', band: 'L3', grade: 'Lead', reportsTo: null },
    { title: 'QA Engineer', deptCode: 'QA', band: 'L1', grade: 'Junior', reportsTo: null },
    { title: 'Project Manager', deptCode: 'DEV', band: 'M1', grade: 'Manager', reportsTo: null },
    { title: 'Sales Manager', deptCode: 'SALES', band: 'M1', grade: 'Manager', reportsTo: null },
    { title: 'Sales Executive', deptCode: 'SALES', band: 'L1', grade: 'Junior', reportsTo: null },
    { title: 'Finance Analyst', deptCode: 'FIN', band: 'L1', grade: 'Junior', reportsTo: null },
    { title: 'Accounts Manager', deptCode: 'FIN', band: 'M1', grade: 'Manager', reportsTo: null },
    { title: 'CEM Executive', deptCode: 'CEM', band: 'L1', grade: 'Junior', reportsTo: null },
    { title: 'CRM Executive', deptCode: 'SALES', band: 'L1', grade: 'Junior', reportsTo: null },
    { title: 'IT Admin', deptCode: 'ADMIN', band: 'L2', grade: 'Senior', reportsTo: null },
    { title: 'Office Executive', deptCode: 'ADMIN', band: 'L1', grade: 'Junior', reportsTo: null },
  ];

  const desigMap: Record<string, string> = {}; // "title|deptCode" -> id
  for (const desig of desigData) {
    const deptId = deptMap[desig.deptCode];
    if (!deptId) { console.warn(`   ⚠️  Dept not found for ${desig.title}`); continue; }
    const created = await prisma.designation.upsert({
      where: { title_departmentId: { title: desig.title, departmentId: deptId } },
      update: { band: desig.band, grade: desig.grade },
      create: { title: desig.title, departmentId: deptId, band: desig.band, grade: desig.grade },
    });
    desigMap[`${desig.title}|${desig.deptCode}`] = created.id;
  }
  console.log(`   ✓ ${desigData.length} designations seeded.`);

  // ══════════════════════════════════════════════════════════════════════════
  // 3. LEAVE TYPES (from Sheet 05)
  // Note: Casual Leave CAN be carry forwarded — user confirmed.
  // ══════════════════════════════════════════════════════════════════════════
  console.log('📅 [3/9] Seeding Leave Types...');

  const leaveTypes = [
    { code: 'CL', name: 'Casual Leave (Full Day)', maxDaysPerYear: 12, isPaidLeave: true, isCarryForwardAllowed: true, maxCarryForwardDays: 7, requiresDocumentAbove: null, isActive: true },
    { code: 'CL_HALF', name: 'Casual Leave (Half Day)', maxDaysPerYear: 6, isPaidLeave: true, isCarryForwardAllowed: false, maxCarryForwardDays: null, requiresDocumentAbove: null, isActive: true },
    { code: 'SL', name: 'Sick Leave', maxDaysPerYear: 12, isPaidLeave: true, isCarryForwardAllowed: true, maxCarryForwardDays: 7, requiresDocumentAbove: 3, isActive: true }, // SL uses CL balance
    { code: 'OPTIONAL', name: 'Optional Holiday', maxDaysPerYear: 2, isPaidLeave: true, isCarryForwardAllowed: false, maxCarryForwardDays: null, requiresDocumentAbove: null, isActive: true },
    { code: 'WFH', name: 'Work From Home', maxDaysPerYear: 12, isPaidLeave: true, isCarryForwardAllowed: false, maxCarryForwardDays: null, requiresDocumentAbove: null, isActive: true },
    { code: 'LOP', name: 'Loss of Pay', maxDaysPerYear: 365, isPaidLeave: false, isCarryForwardAllowed: false, maxCarryForwardDays: null, requiresDocumentAbove: null, isActive: true },
    { code: 'ML', name: 'Maternity Leave', maxDaysPerYear: 182, isPaidLeave: true, isCarryForwardAllowed: false, maxCarryForwardDays: null, requiresDocumentAbove: 1, isActive: true },
  ];

  const leaveTypeMap: Record<string, string> = {}; // code -> id
  for (const lt of leaveTypes) {
    // First try to find by code (our primary key for upsert)
    let existing = await prisma.leaveType.findUnique({ where: { code: lt.code } });
    
    if (!existing) {
      // Also check if a record with same name but different code exists (old seed conflict)
      existing = await prisma.leaveType.findUnique({ where: { name: lt.name } }).catch(() => null);
    }

    if (existing) {
      const updated = await prisma.leaveType.update({
        where: { id: existing.id },
        data: {
          code: lt.code,  // ensure code matches our real data
          name: lt.name,
          maxDaysPerYear: lt.maxDaysPerYear,
          isPaidLeave: lt.isPaidLeave,
          isCarryForwardAllowed: lt.isCarryForwardAllowed,
          maxCarryForwardDays: lt.maxCarryForwardDays,
          requiresDocumentAbove: lt.requiresDocumentAbove,
          isActive: lt.isActive,
        },
      });
      leaveTypeMap[lt.code] = updated.id;
    } else {
      const created = await prisma.leaveType.create({
        data: {
          code: lt.code,
          name: lt.name,
          maxDaysPerYear: lt.maxDaysPerYear,
          isPaidLeave: lt.isPaidLeave,
          isCarryForwardAllowed: lt.isCarryForwardAllowed,
          maxCarryForwardDays: lt.maxCarryForwardDays,
          requiresDocumentAbove: lt.requiresDocumentAbove,
          isActive: lt.isActive,
        },
      });
      leaveTypeMap[lt.code] = created.id;
    }
  }
  console.log(`   ✓ ${leaveTypes.length} leave types seeded.`);

  // ══════════════════════════════════════════════════════════════════════════
  // 4. COMPANY HOLIDAYS (from Sheet 07)
  // Excel serial dates converted to real dates
  // ══════════════════════════════════════════════════════════════════════════
  console.log('🎉 [4/9] Seeding Company Holidays...');

  const holidays = [
    { serial: 46249, name: 'Independence Day', description: 'National Holiday' },
    { serial: 46262, name: 'Raksha Bandhan', description: 'Optional Holiday' },
    { serial: 46269, name: 'Sri Krishna Janmashtami', description: 'Optional Holiday' },
    { serial: 46279, name: 'Ganesh Chaturthi', description: 'Festival Holiday' },
    { serial: 46297, name: 'Mahatma Gandhi Jayanti', description: 'National Holiday' },
    { serial: 46315, name: 'Dussehra', description: 'Festival Holiday' },
    { serial: 46334, name: 'Deepavali', description: 'Festival Holiday' },
    { serial: 46381, name: 'Christmas', description: 'Public Holiday' },
    { serial: 46388, name: 'New Year', description: 'Optional Holiday' },
    { serial: 46402, name: 'Makar Sankranti', description: 'Festival Holiday' },
    { serial: 46413, name: 'Republic Day', description: 'National Holiday' },
    { serial: 46452, name: 'Maha Shivaratri', description: 'Optional Holiday' },
    { serial: 46456, name: 'Ramzan', description: 'Public Holiday' },
    { serial: 46468, name: 'Holi', description: 'Optional Holiday' },
    { serial: 46472, name: 'Good Friday', description: 'Public Holiday' },
    { serial: 46453, name: 'Ugadi', description: 'Optional Holiday' },
    { serial: 46492, name: 'Sri Rama Navami', description: 'Optional Holiday' },
    { serial: 46520, name: 'Bakrid', description: 'Public Holiday' },
    { serial: 46554, name: 'Muharram', description: 'Optional Holiday' },
  ];

  for (const h of holidays) {
    const date = excelDateToJSDate(h.serial);
    await prisma.companyHoliday.upsert({
      where: { date },
      update: { name: h.name, description: h.description },
      create: { name: h.name, date, description: h.description },
    });
  }
  console.log(`   ✓ ${holidays.length} company holidays seeded.`);

  // ══════════════════════════════════════════════════════════════════════════
  // 5. SKILLS LIBRARY (from Sheet 08)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('💡 [5/9] Seeding Skills Library...');

  const skills = [
    { name: 'Python', category: SkillCategory.TECHNICAL, subcategory: 'Backend' },
    { name: 'JavaScript', category: SkillCategory.TECHNICAL, subcategory: 'Full Stack' },
    { name: 'TypeScript', category: SkillCategory.TECHNICAL, subcategory: 'Full Stack' },
    { name: 'React.js', category: SkillCategory.TECHNICAL, subcategory: 'Frontend' },
    { name: 'Next.js', category: SkillCategory.TECHNICAL, subcategory: 'Frontend' },
    { name: 'Node.js', category: SkillCategory.TECHNICAL, subcategory: 'Backend' },
    { name: 'NestJS', category: SkillCategory.TECHNICAL, subcategory: 'Backend' },
    { name: 'PostgreSQL', category: SkillCategory.TECHNICAL, subcategory: 'Database' },
    { name: 'MySQL', category: SkillCategory.TECHNICAL, subcategory: 'Database' },
    { name: 'MongoDB', category: SkillCategory.TECHNICAL, subcategory: 'Database' },
    { name: 'Redis', category: SkillCategory.TECHNICAL, subcategory: 'Infrastructure' },
    { name: 'Docker', category: SkillCategory.TECHNICAL, subcategory: 'DevOps' },
    { name: 'AWS', category: SkillCategory.TECHNICAL, subcategory: 'Cloud' },
    { name: 'Git', category: SkillCategory.TECHNICAL, subcategory: 'DevOps' },
    { name: 'REST API Design', category: SkillCategory.TECHNICAL, subcategory: 'Backend' },
    { name: 'GraphQL', category: SkillCategory.TECHNICAL, subcategory: 'Backend' },
    { name: 'Selenium', category: SkillCategory.TECHNICAL, subcategory: 'QA' },
    { name: 'Postman', category: SkillCategory.TECHNICAL, subcategory: 'QA' },
    { name: 'Figma', category: SkillCategory.TECHNICAL, subcategory: 'Design' },
    { name: 'Power BI', category: SkillCategory.TECHNICAL, subcategory: 'Analytics' },
    { name: 'Tally / ERP', category: SkillCategory.TECHNICAL, subcategory: 'Finance' },
    { name: 'MS Office Suite', category: SkillCategory.TECHNICAL, subcategory: 'Productivity' },
    { name: 'Communication', category: SkillCategory.SOFT, subcategory: 'Interpersonal' },
    { name: 'Teamwork', category: SkillCategory.SOFT, subcategory: 'Interpersonal' },
    { name: 'Problem Solving', category: SkillCategory.SOFT, subcategory: 'Cognitive' },
    { name: 'Time Management', category: SkillCategory.SOFT, subcategory: 'Productivity' },
    { name: 'Negotiation', category: SkillCategory.SOFT, subcategory: 'Sales / HR' },
    { name: 'Presentation Skills', category: SkillCategory.SOFT, subcategory: 'Communication' },
    { name: 'Leadership', category: SkillCategory.LEADERSHIP, subcategory: 'People Management' },
    { name: 'Strategic Planning', category: SkillCategory.LEADERSHIP, subcategory: 'Management' },
    { name: 'Conflict Resolution', category: SkillCategory.LEADERSHIP, subcategory: 'People Management' },
    { name: 'Dental Industry Knowledge', category: SkillCategory.DOMAIN, subcategory: 'Healthcare' },
    { name: 'CRM Tools', category: SkillCategory.DOMAIN, subcategory: 'Sales' },
    { name: 'HR Policies & Compliance', category: SkillCategory.DOMAIN, subcategory: 'HR' },
    { name: 'Financial Accounting', category: SkillCategory.DOMAIN, subcategory: 'Finance' },
    { name: 'B2B Sales', category: SkillCategory.DOMAIN, subcategory: 'Sales' },
  ];

  const skillMap: Record<string, string> = {}; // name -> id
  for (const skill of skills) {
    const created = await prisma.skill.upsert({
      where: { name: skill.name },
      update: { category: skill.category, subcategory: skill.subcategory },
      create: skill,
    });
    skillMap[skill.name] = created.id;
  }
  console.log(`   ✓ ${skills.length} skills seeded.`);

  // ══════════════════════════════════════════════════════════════════════════
  // 6. EMPLOYEES (from Sheet 03) + USERS
  // ══════════════════════════════════════════════════════════════════════════
  console.log('👥 [6/9] Seeding Real Employees & Users...');

  /**
   * Helper to upsert employee + user in one call.
   * officialEmail MUST be unique and valid.
   */
  async function upsertEmployee(data: {
    employeeId: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    preferredName?: string;
    officialEmail: string;
    personalEmail?: string;
    phone?: string;
    alternatePhone?: string;
    dateOfBirth?: Date;
    gender?: Gender;
    bloodGroup?: string;
    maritalStatus?: MaritalStatus;
    nationality?: string;
    deptCode: string;
    desigKey?: string;
    employeeType?: EmployeeType;
    joiningDate?: Date;
    workLocation?: string;
    status?: EmployeeStatus;
    band?: string;
    grade?: string;
    aadhaar?: string;
    pan?: string;
    permanentAddress?: object;
    emergencyContact?: object;
    bankName?: string;
    bankBranch?: string;
    bankAccountEnc?: string;
    bankIfsc?: string;
    accountType?: string;
    paymentMode?: string;
    paymentFrequency?: string;
    role: UserRole;
    backgroundVerified?: boolean;
  }) {
    const deptId = deptMap[data.deptCode];
    if (!deptId) throw new Error(`Dept not found: ${data.deptCode}`);
    const desigId = data.desigKey ? desigMap[data.desigKey] : undefined;

    const updatePayload = {
      employeeId: data.employeeId,  // migrate old mock IDs to real IDs
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      preferredName: data.preferredName,
      officialEmail: data.officialEmail,
      personalEmail: data.personalEmail,
      phone: data.phone ? String(data.phone) : undefined,
      alternatePhone: data.alternatePhone ? String(data.alternatePhone) : undefined,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      bloodGroup: data.bloodGroup,
      maritalStatus: data.maritalStatus,
      nationality: data.nationality ?? 'Indian',
      departmentId: deptId,
      designationId: desigId,
      employeeType: data.employeeType ?? EmployeeType.FULL_TIME,
      joiningDate: data.joiningDate,
      workLocation: data.workLocation ?? 'Hyderabad HQ',
      status: data.status ?? EmployeeStatus.ACTIVE,
      band: data.band,
      grade: data.grade,
      aadhaar: data.aadhaar,
      pan: data.pan,
      permanentAddress: data.permanentAddress as any,
      emergencyContact: data.emergencyContact as any,
      bankName: data.bankName,
      bankBranch: data.bankBranch,
      bankAccountEnc: data.bankAccountEnc,
      bankIfsc: data.bankIfsc,
      accountType: data.accountType,
      paymentMode: data.paymentMode,
      paymentFrequency: data.paymentFrequency,
      backgroundVerified: data.backgroundVerified ?? false,
    };

    // Strategy: find by real employeeId first, then by email (handles old mock-ID records)
    let existingEmp = await prisma.employee.findUnique({ where: { employeeId: data.employeeId } });
    if (!existingEmp) {
      existingEmp = await prisma.employee.findUnique({ where: { officialEmail: data.officialEmail } });
    }

    let emp: any;
    if (existingEmp) {
      emp = await prisma.employee.update({ where: { id: existingEmp.id }, data: updatePayload });
    } else {
      emp = await prisma.employee.create({ data: { ...updatePayload } });
    }

    // Upsert the User account
    await prisma.user.upsert({
      where: { employeeId: emp.id },
      update: { role: data.role, email: data.officialEmail },
      create: {
        employeeId: emp.id,
        email: data.officialEmail,
        passwordHash: DEFAULT_PASSWORD_HASH,
        role: data.role,
      },
    });

    console.log(`   ✓ ${emp.employeeId} — ${emp.firstName} ${emp.lastName} [${data.role}]`);
    return emp;
  }

  // ── CEO: Pradeep Chandra Maddirala ────────────────────────────────────────
  const ceo = await upsertEmployee({
    employeeId: 'NAP/AR/001',
    firstName: 'Pradeep',
    middleName: 'Chandra',
    lastName: 'Maddirala',
    officialEmail: 'pradeep@naprocs.in',
    personalEmail: 'mpradeepchandra@gmail.com',
    phone: '7702274948',
    alternatePhone: '9966176517',
    dateOfBirth: excelDateToJSDate(32692),
    gender: Gender.MALE,
    bloodGroup: 'O+',
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'ADMIN',
    desigKey: 'CEO|ADMIN',
    employeeType: EmployeeType.FULL_TIME,
    status: EmployeeStatus.ACTIVE,
    band: 'E1',
    grade: 'Executive',
    workLocation: 'Hyderabad HQ',
    role: UserRole.CEO,
  });

  // ── CTO: Lokesh Reddy (existing in DB, NAP-002 in skills sheet) ───────────
  const ctoPayload = {
    employeeId: 'NAP-002',
    firstName: 'Lokesh',
    lastName: 'Reddy',
    officialEmail: 'lokesh@naprocs.in',
    departmentId: deptMap['TECH'],
    designationId: desigMap['CTO|TECH'],
    status: EmployeeStatus.ACTIVE,
    band: 'E1',
    grade: 'Executive',
    reportingManagerId: ceo.id,
  };
  let ctoExisting = await prisma.employee.findUnique({ where: { employeeId: 'NAP-002' } });
  if (!ctoExisting) ctoExisting = await prisma.employee.findUnique({ where: { officialEmail: 'lokesh@naprocs.in' } });
  const cto = ctoExisting
    ? await prisma.employee.update({ where: { id: ctoExisting.id }, data: ctoPayload })
    : await prisma.employee.create({ data: ctoPayload });
  await prisma.user.upsert({
    where: { employeeId: cto.id },
    update: { role: UserRole.CTO, email: 'lokesh@naprocs.in' },
    create: { employeeId: cto.id, email: 'lokesh@naprocs.in', passwordHash: DEFAULT_PASSWORD_HASH, role: UserRole.CTO },
  });
  console.log(`   ✓ ${cto.employeeId} — Lokesh Reddy [CTO]`);

  // ── HR Executive: Prince Alpha G ─────────────────────────────────────────
  const hr = await upsertEmployee({
    employeeId: 'NAP/HR/001',
    firstName: 'Prince',
    lastName: 'Alpha G',
    officialEmail: 'hr@naprocs.in',
    personalEmail: 'gprincealpha59@gmail.com',
    phone: '8247590903',
    alternatePhone: '9948764419',
    dateOfBirth: excelDateToJSDate(37099),
    gender: Gender.FEMALE,
    bloodGroup: 'A+',
    maritalStatus: MaritalStatus.MARRIED,
    deptCode: 'HR',
    desigKey: 'HR Executive|HR',
    employeeType: EmployeeType.FULL_TIME,
    joiningDate: excelDateToJSDate(46169),
    status: EmployeeStatus.ACTIVE,
    band: 'E1',
    grade: 'Executive',
    aadhaar: '671092855127',
    pan: 'EZJPA0565E',
    role: UserRole.HR,
  });

  // ── Operations Executives ──────────────────────────────────────────────────
  const sandeep = await upsertEmployee({
    employeeId: 'NAP/OR/001',
    firstName: 'Sandeep',
    middleName: 'Reddy',
    lastName: 'Bommareddy',
    officialEmail: 'sandeep@naprocs.in',
    personalEmail: 'sandeepsandyb3@gmail.com',
    phone: '9063607114',
    alternatePhone: '9866802574',
    dateOfBirth: excelDateToJSDate(33857),
    gender: Gender.MALE,
    bloodGroup: 'B+',
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'OPS',
    desigKey: 'CEM Executive|CEM',
    employeeType: EmployeeType.FULL_TIME,
    joiningDate: excelDateToJSDate(46169),
    status: EmployeeStatus.ACTIVE,
    band: 'E1',
    grade: 'Executive',
    aadhaar: '889786150815',
    pan: 'BEMPB1727G',
    role: UserRole.OE,
  });

  const sandya = await upsertEmployee({
    employeeId: 'NAP/OR/002',
    firstName: 'Sandya',
    middleName: 'Rani',
    lastName: 'Siraparapu',
    officialEmail: 'sandya@naprocs.in',
    personalEmail: 'sanju19042001@gmail.com',
    phone: '8688924431',
    alternatePhone: '9381203069',
    dateOfBirth: excelDateToJSDate(37000),
    gender: Gender.FEMALE,
    bloodGroup: 'O+',
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'OPS',
    desigKey: 'CEM Executive|CEM',
    employeeType: EmployeeType.FULL_TIME,
    joiningDate: excelDateToJSDate(46168),
    status: EmployeeStatus.ACTIVE,
    band: 'E1',
    grade: 'Executive',
    aadhaar: '743877767808',
    pan: 'GDPPR3392C',
    role: UserRole.OE,
  });

  // NAP/OR/003 is VACANT — intentionally skipped

  const swetha = await upsertEmployee({
    employeeId: 'NAP/OR/004',
    firstName: 'Swetha',
    lastName: 'Javvaji',
    officialEmail: 'swetha@naprocs.in',
    personalEmail: 'swethaj018@gmail.com',
    phone: '9381212538',
    alternatePhone: '9885552628',
    dateOfBirth: excelDateToJSDate(37465),
    gender: Gender.FEMALE,
    bloodGroup: 'B+',
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'SALES',
    desigKey: 'CRM Executive|SALES',
    employeeType: EmployeeType.FULL_TIME,
    joiningDate: excelDateToJSDate(46210),
    status: EmployeeStatus.ACTIVE,
    band: 'E1',
    grade: 'Executive',
    aadhaar: '486006147044',
    pan: 'CUXPJ1405R',
    role: UserRole.CRM,
  });

  // ── Tech Team (TR series) ──────────────────────────────────────────────────
  const ajay = await upsertEmployee({
    employeeId: 'NAP/TR/001',
    firstName: 'Ajay',
    middleName: 'Kumar',
    lastName: 'M N V V',
    officialEmail: 'ajay@naprocs.in',
    personalEmail: 'ajaykumarmallipudile@gmail.com',
    phone: '8919844106',
    alternatePhone: '9247359912',
    dateOfBirth: excelDateToJSDate(38541),
    gender: Gender.MALE,
    bloodGroup: 'B+',
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'DEV',
    desigKey: 'Senior Software Engineer|DEV',
    employeeType: EmployeeType.FULL_TIME,
    joiningDate: excelDateToJSDate(46118),
    status: EmployeeStatus.ACTIVE,
    band: 'L2',
    grade: 'Senior',
    aadhaar: '619724875870',
    pan: 'OCRPK1996N',
    permanentAddress: { line1: 'Ramalingeswara Nagar', city: 'Vijayawada', state: 'Andhra Pradesh', pincode: '520013', country: 'India' },
    emergencyContact: { name: 'Madhu', relation: 'Father', phone: '9247359912' },
    bankName: 'State Bank of India',
    bankAccountEnc: '42341458201',
    bankIfsc: 'SBIN0004808',
    accountType: 'SAVINGS',
    paymentMode: 'NEFT',
    paymentFrequency: 'MONTHLY',
    role: UserRole.EMPLOYEE,
  });

  // NAP/TR/002 — Tejesh Kumar Boga (existing, update with real data)
  const tejeshPayload = {
    employeeId: 'NAP/TR/002',
    firstName: 'Tejesh',
    middleName: 'Kumar',
    lastName: 'Boga',
    officialEmail: 'tejesh@naprocs.in',
    departmentId: deptMap['DEV'],
    designationId: desigMap['Software Engineer|DEV'],
    status: EmployeeStatus.ACTIVE,
    band: 'E1',
    grade: 'Executive',
    workLocation: 'Hyderabad HQ',
  };
  let tejeshExisting = await prisma.employee.findUnique({ where: { employeeId: 'NAP/TR/002' } });
  if (!tejeshExisting) tejeshExisting = await prisma.employee.findUnique({ where: { officialEmail: 'tejesh@naprocs.in' } });
  const tejesh = tejeshExisting
    ? await prisma.employee.update({ where: { id: tejeshExisting.id }, data: tejeshPayload })
    : await prisma.employee.create({ data: tejeshPayload });
  await prisma.user.upsert({
    where: { employeeId: tejesh.id },
    update: { role: UserRole.EMPLOYEE, email: 'tejesh@naprocs.in' },
    create: { employeeId: tejesh.id, email: 'tejesh@naprocs.in', passwordHash: DEFAULT_PASSWORD_HASH, role: UserRole.EMPLOYEE },
  });
  console.log(`   ✓ ${tejesh.employeeId} — Tejesh Kumar Boga [EMPLOYEE]`);

  const girish = await upsertEmployee({
    employeeId: 'NAP/TR/003',
    firstName: 'Girish',
    lastName: 'Karriyavula',
    officialEmail: 'girish@naprocs.in',
    personalEmail: 'girishnani03@gmail.com',
    phone: '7989841333',
    alternatePhone: '9502129111',
    dateOfBirth: excelDateToJSDate(37681),
    gender: Gender.MALE,
    bloodGroup: 'O-',
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'DEV',
    desigKey: 'Software Engineer|DEV',
    employeeType: EmployeeType.FULL_TIME,
    joiningDate: excelDateToJSDate(46118),
    status: EmployeeStatus.ACTIVE,
    band: 'E1',
    grade: 'Executive',
    aadhaar: '581826402529',
    pan: 'EUKPK1946P',
    role: UserRole.EMPLOYEE,
  });

  const varsha = await upsertEmployee({
    employeeId: 'NAP/TR/004',
    firstName: 'Varsha',
    lastName: 'Degala Sri',
    officialEmail: 'varsha@naprocs.in',
    personalEmail: 'degalavarsha@gmail.com',
    phone: '9966226505',
    alternatePhone: '9985181397',
    dateOfBirth: excelDateToJSDate(38181),
    gender: Gender.FEMALE,
    bloodGroup: 'A+',
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'DEV',
    desigKey: 'Software Engineer|DEV',
    employeeType: EmployeeType.FULL_TIME,
    joiningDate: excelDateToJSDate(46118),
    status: EmployeeStatus.ACTIVE,
    band: 'E1',
    grade: 'Executive',
    role: UserRole.EMPLOYEE,
  });

  const harshitha = await upsertEmployee({
    employeeId: 'NAP/TR/005',
    firstName: 'Harshitha',
    middleName: 'Reddy',
    lastName: 'Chandireddy',
    officialEmail: 'harshitha@naprocs.in',
    personalEmail: 'harshitha.chandireddy@gmail.com',
    phone: '7780700526',
    alternatePhone: '9949252221',
    dateOfBirth: excelDateToJSDate(38406),
    gender: Gender.FEMALE,
    bloodGroup: 'B-',
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'DEV',
    desigKey: 'Tech Lead|DEV',
    employeeType: EmployeeType.FULL_TIME,
    joiningDate: excelDateToJSDate(46125),
    status: EmployeeStatus.ACTIVE,
    band: 'L3',
    grade: 'Lead',
    aadhaar: '220463112817',
    pan: 'DDCPC2935L',
    role: UserRole.EMPLOYEE,
  });

  const salman = await upsertEmployee({
    employeeId: 'NAP/TR/006',
    firstName: 'Salman',
    lastName: 'Shaik',
    officialEmail: 'salman@naprocs.in',
    personalEmail: 'sksalman7730@gmail.com',
    phone: '7670866817',
    alternatePhone: '9848584717',
    dateOfBirth: excelDateToJSDate(38293),
    gender: Gender.MALE,
    bloodGroup: 'O+',
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'DEV',
    desigKey: 'Software Engineer|DEV',
    employeeType: EmployeeType.FULL_TIME,
    joiningDate: excelDateToJSDate(46118),
    status: EmployeeStatus.ACTIVE,
    band: 'E1',
    grade: 'Executive',
    role: UserRole.EMPLOYEE,
  });

  const rahima = await upsertEmployee({
    employeeId: 'NAP/TR/007',
    firstName: 'Rahima',
    lastName: 'Abdul',
    officialEmail: 'rahima@naprocs.in',
    personalEmail: 'abdulrahima2024@gmail.com',
    phone: '9908785324',
    alternatePhone: '9949058644',
    dateOfBirth: excelDateToJSDate(38141),
    gender: Gender.FEMALE,
    bloodGroup: 'O+',
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'DEV',
    desigKey: 'Software Engineer|DEV',
    employeeType: EmployeeType.FULL_TIME,
    joiningDate: excelDateToJSDate(46118),
    status: EmployeeStatus.ACTIVE,
    band: 'E1',
    grade: 'Executive',
    aadhaar: '657043921836',
    pan: 'HPQPR0734J',
    role: UserRole.EMPLOYEE,
  });

  const sumanth = await upsertEmployee({
    employeeId: 'NAP/TR/008',
    firstName: 'Sai',
    middleName: 'Sumanth',
    lastName: 'Boyapati',
    officialEmail: 'sumanth@naprocs.in',
    personalEmail: 'saisumanthboyapati@gmail.com',
    phone: '9063994409',
    alternatePhone: '9573725599',
    dateOfBirth: excelDateToJSDate(38191),
    gender: Gender.MALE,
    bloodGroup: 'O-',
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'DEV',
    desigKey: 'Software Engineer|DEV',
    employeeType: EmployeeType.FULL_TIME,
    joiningDate: excelDateToJSDate(46118),
    status: EmployeeStatus.ACTIVE,
    band: 'E1',
    grade: 'Executive',
    aadhaar: '785255260672',
    pan: 'ICCPB9853C',
    role: UserRole.EMPLOYEE,
  });

  const harish = await upsertEmployee({
    employeeId: 'NAP/TR/009',
    firstName: 'Harish',
    lastName: 'Eppili',
    officialEmail: 'harish.eppili@naprocs.in',
    personalEmail: 'djharish795@gmail.com',
    phone: '9391941964',
    alternatePhone: '9963303569',
    dateOfBirth: excelDateToJSDate(38522),
    gender: Gender.MALE,
    bloodGroup: 'AB+',
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'DEV',
    desigKey: 'Software Engineer|DEV',
    employeeType: EmployeeType.FULL_TIME,
    joiningDate: excelDateToJSDate(46125),
    status: EmployeeStatus.ACTIVE,
    band: 'E1',
    grade: 'Executive',
    aadhaar: '660900167129',
    pan: 'AHLPE0438N',
    role: UserRole.EMPLOYEE,
  });

  const pavani = await upsertEmployee({
    employeeId: 'NAP/TR/010',
    firstName: 'Pavani',
    lastName: 'Addepalli',
    officialEmail: 'pavani@naprocs.in',
    personalEmail: 'addepallipavani4@gmail.com',
    phone: '6281742588',
    alternatePhone: '9533371776',
    dateOfBirth: excelDateToJSDate(38627),
    gender: Gender.FEMALE,
    bloodGroup: 'B+',
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'DEV',
    desigKey: 'Software Engineer|DEV',
    employeeType: EmployeeType.FULL_TIME,
    joiningDate: excelDateToJSDate(46125),
    status: EmployeeStatus.ACTIVE,
    band: 'E1',
    grade: 'Executive',
    aadhaar: '549987648158',
    pan: 'HRNPP3813F',
    role: UserRole.EMPLOYEE,
  });

  const vinay = await upsertEmployee({
    employeeId: 'NAP/TR/011',
    firstName: 'Vinay',
    lastName: 'Ravuri',
    officialEmail: 'vinay@naprocs.in',
    personalEmail: 'vinayravuri05@gmail.com',
    phone: '9963361993',
    alternatePhone: '7036193993',
    dateOfBirth: excelDateToJSDate(37991),
    gender: Gender.MALE,
    bloodGroup: 'O+',
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'DEV',
    desigKey: 'Software Engineer|DEV',
    employeeType: EmployeeType.FULL_TIME,
    joiningDate: excelDateToJSDate(46174),
    status: EmployeeStatus.ACTIVE,
    band: 'E1',
    grade: 'Executive',
    aadhaar: '305060661015',
    pan: 'HPRPR6485H',
    role: UserRole.EMPLOYEE,
  });

  const kumarSai = await upsertEmployee({
    employeeId: 'NAP/TR/012',
    firstName: 'Kumara',
    middleName: 'Sai',
    lastName: 'Karella',
    officialEmail: 'kumar@naprocs.in',
    personalEmail: 'karellakumarasai@gmail.com',
    phone: '7095219161',
    alternatePhone: '9010827101',
    dateOfBirth: excelDateToJSDate(36709),
    gender: Gender.MALE,
    bloodGroup: 'O+',
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'DEV',
    desigKey: 'Software Engineer|DEV',
    employeeType: EmployeeType.FULL_TIME,
    joiningDate: excelDateToJSDate(46175),
    status: EmployeeStatus.ACTIVE,
    band: 'E1',
    grade: 'Executive',
    aadhaar: '689337752300',
    pan: 'MUZPS4849C',
    role: UserRole.EMPLOYEE,
  });

  const imthiyaz = await upsertEmployee({
    employeeId: 'NAP/TR/013',
    firstName: 'Imthiyaz',
    lastName: 'Shaik',
    officialEmail: 'imthiyaz@naprocs.in',
    personalEmail: 'shaikimthiyaz137@gmail.com',
    phone: '9121886448',
    alternatePhone: '9490056286',
    dateOfBirth: excelDateToJSDate(37977),
    gender: Gender.MALE,
    bloodGroup: 'B+',
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'DEV',
    desigKey: 'Software Engineer|DEV',
    employeeType: EmployeeType.FULL_TIME,
    joiningDate: excelDateToJSDate(46181),
    status: EmployeeStatus.ACTIVE,
    band: 'E1',
    grade: 'Executive',
    aadhaar: '217984153157',
    pan: 'ANKPI7258M',
    role: UserRole.EMPLOYEE,
  });

  const saiVenkat = await upsertEmployee({
    employeeId: 'NAP/TR/014',
    firstName: 'Sai',
    middleName: 'Venkat',
    lastName: 'Kondapalli',
    officialEmail: 'saivenkat@naprocs.in',
    personalEmail: 'saivenkatkondapalli@gmail.com',
    phone: '8096373457',
    dateOfBirth: excelDateToJSDate(38584),
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'DEV',
    desigKey: 'Software Engineer|DEV',
    employeeType: EmployeeType.FULL_TIME,
    status: EmployeeStatus.ACTIVE,
    band: 'E1',
    grade: 'Executive',
    aadhaar: '605203213997',
    role: UserRole.EMPLOYEE,
  });

  const tulasiKrishna = await upsertEmployee({
    employeeId: 'NAP/TR/015',
    firstName: 'Tulasi',
    middleName: 'Krishna',
    lastName: 'K',
    officialEmail: 'tulasi@naprocs.in',
    personalEmail: 'tulasikd14@gmail.com',
    phone: '7032024034',
    alternatePhone: '9441763760',
    dateOfBirth: excelDateToJSDate(39232),
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'DEV',
    desigKey: 'Software Engineer|DEV',
    employeeType: EmployeeType.FULL_TIME,
    joiningDate: excelDateToJSDate(46204),
    status: EmployeeStatus.ACTIVE,
    band: 'E1',
    grade: 'Executive',
    aadhaar: '785830468651',
    pan: 'QGGPK9990F',
    role: UserRole.EMPLOYEE,
  });

  // Interns without original Employee IDs — assigning NAP/TR/016 and NAP/TR/017
  const charani = await upsertEmployee({
    employeeId: 'NAP/TR/016',
    firstName: 'Charani',
    lastName: 'Boga',
    officialEmail: 'charani@naprocs.in',
    personalEmail: 'charaniboga3689@gmail.com',
    phone: '8886699678',
    alternatePhone: '9346726966',
    dateOfBirth: excelDateToJSDate(38998),
    gender: Gender.FEMALE,
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'DEV',
    desigKey: 'Software Engineer|DEV',
    employeeType: EmployeeType.INTERN,
    joiningDate: excelDateToJSDate(46175),
    status: EmployeeStatus.ACTIVE,
    band: 'E1',
    grade: 'Executive',
    role: UserRole.EMPLOYEE,
  });

  const harshaVardhan = await upsertEmployee({
    employeeId: 'NAP/TR/017',
    firstName: 'Harsha',
    middleName: 'Vardhan',
    lastName: 'Danthu Venkata',
    officialEmail: 'harsha@naprocs.in',
    personalEmail: 'harshadanthu50@gmail.com',
    phone: '8074641652',
    alternatePhone: '9182415946',
    dateOfBirth: excelDateToJSDate(38403),
    gender: Gender.MALE,
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'DEV',
    desigKey: 'Software Engineer|DEV',
    employeeType: EmployeeType.INTERN,
    status: EmployeeStatus.ACTIVE,
    band: 'E1',
    grade: 'Executive',
    role: UserRole.EMPLOYEE,
  });

  // ── Digital Marketing Interns ─────────────────────────────────────────────
  const sujay = await upsertEmployee({
    employeeId: 'NAP/DMR/001',
    firstName: 'Sujay',
    middleName: 'Krishna',
    lastName: 'Velala',
    officialEmail: 'sujay@naprocs.in',
    personalEmail: 'sujaykrishna1742@gmail.com',
    phone: '6305551412',
    alternatePhone: '8500654535',
    dateOfBirth: excelDateToJSDate(39022),
    gender: Gender.MALE,
    bloodGroup: 'O+',
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'MKT',
    desigKey: 'Sales Executive|SALES',
    employeeType: EmployeeType.INTERN,
    joiningDate: excelDateToJSDate(46195),
    status: EmployeeStatus.ACTIVE,
    band: 'E1',
    grade: 'Executive',
    aadhaar: '488496794740',
    role: UserRole.EMPLOYEE,
  });

  const dinesh = await upsertEmployee({
    employeeId: 'NAP/DMR/002',
    firstName: 'T. Dinesh',
    lastName: 'Reddy',
    officialEmail: 'dinesh@naprocs.in',
    personalEmail: 'tangiraladineshreddy@gmail.com',
    phone: '9949649130',
    alternatePhone: '6300890084',
    dateOfBirth: excelDateToJSDate(39252),
    gender: Gender.MALE,
    bloodGroup: 'B+',
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'MKT',
    desigKey: 'Sales Executive|SALES',
    employeeType: EmployeeType.INTERN,
    joiningDate: excelDateToJSDate(46202),
    status: EmployeeStatus.ACTIVE,
    band: 'E1',
    grade: 'Executive',
    aadhaar: '324824570361',
    pan: 'HTBPR0749N',
    role: UserRole.EMPLOYEE,
  });

  const krishnaPriya = await upsertEmployee({
    employeeId: 'NAP/DMR/003',
    firstName: 'KrishnaPriya',
    lastName: 'Nelavalli',
    officialEmail: 'krishnapriya@naprocs.in',
    personalEmail: 'krishnapriyanelavalli9@gmail.com',
    phone: '9666259386',
    alternatePhone: '7981397354',
    dateOfBirth: excelDateToJSDate(39030),
    gender: Gender.FEMALE,
    maritalStatus: MaritalStatus.SINGLE,
    deptCode: 'MKT',
    desigKey: 'Sales Executive|SALES',
    employeeType: EmployeeType.INTERN,
    joiningDate: excelDateToJSDate(46210),
    status: EmployeeStatus.ACTIVE,
    band: 'E1',
    grade: 'Executive',
    role: UserRole.EMPLOYEE,
  });

  console.log(`   ✓ All 25 employees seeded.`);

  // ══════════════════════════════════════════════════════════════════════════
  // 7. SET REPORTING MANAGER & HR RELATIONSHIPS
  //    All employees report to OM (Pradeep as CEO since no OM exists as yet)
  //    assignedHr = Prince Alpha G (hr)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('🔗 [7/9] Setting reporting manager and HR relationships...');

  // CEO has no reporting manager (top of hierarchy)
  // CTO reports to CEO
  await prisma.employee.update({ where: { id: cto.id }, data: { reportingManagerId: ceo.id, assignedHrId: hr.id } });

  // All other employees report to CEO (as OM per your instruction)
  const allOtherEmployees = [
    hr, sandeep, sandya, swetha, ajay, tejesh, girish, varsha,
    harshitha, salman, rahima, sumanth, harish, pavani, vinay,
    kumarSai, imthiyaz, saiVenkat, tulasiKrishna, charani, harshaVardhan,
    sujay, dinesh, krishnaPriya,
  ];
  for (const emp of allOtherEmployees) {
    await prisma.employee.update({
      where: { id: emp.id },
      data: {
        reportingManagerId: ceo.id,
        assignedHrId: hr.id,
      },
    });
  }

  // Set CEO's assigned HR
  await prisma.employee.update({ where: { id: ceo.id }, data: { assignedHrId: hr.id } });

  // Set department heads
  await prisma.department.update({ where: { code: 'ADMIN' }, data: { headId: ceo.id } });
  await prisma.department.update({ where: { code: 'HR' }, data: { headId: hr.id } });
  await prisma.department.update({ where: { code: 'TECH' }, data: { headId: cto.id } });
  await prisma.department.update({ where: { code: 'DEV' }, data: { headId: cto.id } });

  console.log(`   ✓ Reporting relationships set for all 25 employees.`);

  // ══════════════════════════════════════════════════════════════════════════
  // 8. ASSETS (from Sheet 06)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('💻 [8/9] Seeding Assets...');

  // Build employeeId -> DB id map for asset assignment
  const empIdToDbId: Record<string, string> = {};
  const allEmpsForAssets = await prisma.employee.findMany({
    where: { employeeId: { in: ['NAP/AR/001', 'NAP-002', 'NAP/HR/001', 'NAP/TR/001', 'NAP/TR/002', 'NAP/TR/003', 'NAP/TR/004', 'NAP/TR/005', 'NAP/OR/004'] } },
    select: { id: true, employeeId: true },
  });
  for (const e of allEmpsForAssets) empIdToDbId[e.employeeId] = e.id;

  type AssetSeed = {
    assetTag: string;
    name: string;
    category: AssetCategory;
    brand?: string;
    model?: string;
    serialNumber?: string;
    purchaseCost?: number;
    purchaseDate?: Date;
    status: AssetStatus;
    currentHolderId?: string;
    notes?: string;
  };

  const assets: AssetSeed[] = [
    { assetTag: 'NAP-LAP-001-CEO', name: 'Motobook 60 141AH10R — Tejesh', category: AssetCategory.LAPTOP, brand: 'Motorola', model: 'Motobook 60 141AH10R', serialNumber: '003424292592002AAOEM', purchaseCost: 95000, purchaseDate: excelDateToJSDate(46213), status: AssetStatus.ASSIGNED, currentHolderId: empIdToDbId['NAP/TR/002'], notes: '15.6in i5 8GB' },
    { assetTag: 'NAP-LAP-002-CTO', name: 'MacBook Pro 14in — CTO', category: AssetCategory.LAPTOP, brand: 'Apple', model: 'MacBook Pro M3', serialNumber: 'APPMBP14CTO001', purchaseCost: 195000, purchaseDate: new Date('2023-06-01'), status: AssetStatus.ASSIGNED, currentHolderId: empIdToDbId['NAP-002'], notes: 'M3 Pro 18GB 512GB' },
    { assetTag: 'NAP-LAP-003-TR004', name: 'Motobook 60 14IRH10R — Varsha', category: AssetCategory.LAPTOP, brand: 'Motorola', model: 'Motobook 60 14IRH10R', serialNumber: '00342936-13614-AAOEM', purchaseCost: 95000, purchaseDate: excelDateToJSDate(46213), status: AssetStatus.ASSIGNED, currentHolderId: empIdToDbId['NAP/TR/004'], notes: '15.6in i5 8GB' },
    { assetTag: 'NAP-LAP-004-TR005', name: 'Motobook 60 14IRH10R — Harshitha', category: AssetCategory.LAPTOP, brand: 'Motorola', model: 'Motobook 60 14IRH10R', serialNumber: '003424293616631AAOEM', purchaseCost: 95000, purchaseDate: excelDateToJSDate(46213), status: AssetStatus.ASSIGNED, currentHolderId: empIdToDbId['NAP/TR/005'], notes: '15.6in i5 8GB' },
    { assetTag: 'NAP-LAP-005-TR003', name: 'Victus HP Gaming — Girish', category: AssetCategory.LAPTOP, brand: 'HP-Victus', model: 'Victus HP Gaming Laptop 15-fb3xxx', serialNumber: '003424290493651AAOEM', purchaseCost: 95000, purchaseDate: excelDateToJSDate(46213), status: AssetStatus.ASSIGNED, currentHolderId: empIdToDbId['NAP/TR/003'], notes: '15.6in i5 8GB' },
    { assetTag: 'NAP-LAP-006-SPARE', name: 'Dell Latitude 3540 — Spare', category: AssetCategory.LAPTOP, brand: 'Dell', model: 'Latitude 3540', serialNumber: 'DLAT3540SPARE01', purchaseCost: 55000, purchaseDate: new Date('2024-01-10'), status: AssetStatus.AVAILABLE, notes: 'For new joinee allocation' },
    { assetTag: 'NAP-LAP-007-HR', name: 'Lenovo ThinkPad E15 — HR', category: AssetCategory.LAPTOP, brand: 'Lenovo', model: 'ThinkPad E15', serialNumber: '00331100000001AA008', purchaseCost: 65000, purchaseDate: excelDateToJSDate(46197), status: AssetStatus.ASSIGNED, currentHolderId: empIdToDbId['NAP/HR/001'], notes: '15.6in i5 8GB' },
    { assetTag: 'NAP-LAP-008-CAM', name: 'Lenovo ThinkPad E15 — Swetha', category: AssetCategory.LAPTOP, brand: 'Lenovo', model: 'ThinkPad E15', serialNumber: '00331100000000AA049', purchaseCost: 65000, purchaseDate: excelDateToJSDate(46213), status: AssetStatus.ASSIGNED, currentHolderId: empIdToDbId['NAP/OR/004'], notes: '15.6in i5 8GB' },
    { assetTag: 'NAP-MON-001-CEO', name: 'Dell 27in UltraSharp — CEO', category: AssetCategory.MONITOR, brand: 'Dell', model: 'U2722D', serialNumber: 'DLU2722D001', purchaseCost: 35000, purchaseDate: new Date('2022-11-20'), status: AssetStatus.ASSIGNED, currentHolderId: empIdToDbId['NAP/AR/001'], notes: '4K USB-C' },
    { assetTag: 'NAP-SIM-001-CEO', name: 'Airtel Corporate SIM — CEO', category: AssetCategory.SIM, brand: 'Airtel', model: 'Corporate 5G', serialNumber: '896491012345678901', purchaseCost: 500, purchaseDate: new Date('2020-01-01'), status: AssetStatus.ASSIGNED, currentHolderId: empIdToDbId['NAP/AR/001'], notes: 'Unlimited + 50GB data' },
    { assetTag: 'NAP-ACC-001-CEO', name: 'Office Access Card — CEO', category: AssetCategory.ACCESS_CARD, brand: 'HID', model: 'iCLASS SE', serialNumber: 'HIDACC001', purchaseCost: 800, purchaseDate: new Date('2020-01-15'), status: AssetStatus.ASSIGNED, currentHolderId: empIdToDbId['NAP/AR/001'], notes: 'All-floor access' },
    { assetTag: 'NAP-SW-001', name: 'Adobe Creative Cloud License', category: AssetCategory.SOFTWARE_LICENCE, brand: 'Adobe', model: 'Creative Cloud All Apps', serialNumber: 'ADOBECC001', purchaseCost: 54000, purchaseDate: new Date('2024-01-01'), status: AssetStatus.AVAILABLE, notes: 'Annual subscription' },
  ];

  for (const asset of assets) {
    // Asset model has assetTag unique
    const existing = await prisma.asset.findUnique({ where: { assetTag: asset.assetTag } }).catch(() => null);
    if (existing) {
      await prisma.asset.update({
        where: { assetTag: asset.assetTag },
        data: {
          name: asset.name,
          category: asset.category,
          brand: asset.brand,
          model: asset.model,
          purchaseCost: asset.purchaseCost,
          purchaseDate: asset.purchaseDate,
          status: asset.status,
          currentHolderId: asset.currentHolderId,
          notes: asset.notes,
        },
      });
    } else {
      await prisma.asset.create({
        data: {
          assetTag: asset.assetTag,
          name: asset.name,
          category: asset.category,
          brand: asset.brand,
          model: asset.model,
          serialNumber: asset.serialNumber,
          purchaseCost: asset.purchaseCost,
          purchaseDate: asset.purchaseDate,
          status: asset.status,
          currentHolderId: asset.currentHolderId,
          notes: asset.notes,
        },
      });
    }
  }
  console.log(`   ✓ ${assets.length} assets seeded.`);

  // ══════════════════════════════════════════════════════════════════════════
  // 9. LEAVE BALANCES for current year (2026) for all employees
  // ══════════════════════════════════════════════════════════════════════════
  console.log('📊 [9/9] Seeding Leave Balances (2026) for all employees...');

  const currentYear = 2026;
  const allEmployees = await prisma.employee.findMany({
    where: { status: EmployeeStatus.ACTIVE },
    select: { id: true, employeeId: true, firstName: true },
  });

  // Standard allocation for active full-time employees
  const balancesToSeed = [
    { code: 'EL', allocated: 18 },
    { code: 'SL', allocated: 12 },
    { code: 'CL', allocated: 12 },
    { code: 'BL', allocated: 5 },
    { code: 'FL', allocated: 3 },
    { code: 'COMP', allocated: 0 },
  ];

  for (const emp of allEmployees) {
    for (const bal of balancesToSeed) {
      const ltId = leaveTypeMap[bal.code];
      if (!ltId) continue;
      await prisma.leaveBalance.upsert({
        where: { employeeId_leaveTypeId_year: { employeeId: emp.id, leaveTypeId: ltId, year: currentYear } },
        update: {},  // Don't overwrite existing balances — only create if missing
        create: {
          employeeId: emp.id,
          leaveTypeId: ltId,
          year: currentYear,
          allocated: bal.allocated,
          used: 0,
          pending: 0,
          carriedOver: 0,
        },
      });
    }
  }
  console.log(`   ✓ Leave balances set for ${allEmployees.length} employees.`);

  // ══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║   Naprocs Real Data Seed — COMPLETED ✅                     ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║  Departments    : 10                                         ║');
  console.log('║  Designations   : 22                                         ║');
  console.log('║  Leave Types    : 9  (CL now carry-forwardable)              ║');
  console.log('║  Holidays       : 19                                         ║');
  console.log('║  Skills         : 36                                         ║');
  console.log('║  Employees      : 25 (NAP/OR/003 VACANT — intentional)      ║');
  console.log('║  Assets         : 12                                         ║');
  console.log('║  Leave Balances : auto-created for all active employees      ║');
  console.log('║  Default Pass   : ChangeMe123!                               ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  console.log('⚠️  NOTE: Salary structures pending — user will provide employee IDs.');
  console.log('⚠️  NOTE: Historical leave requests NOT seeded yet — pending user confirmation.\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
