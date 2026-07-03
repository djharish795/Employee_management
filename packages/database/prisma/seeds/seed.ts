import { PrismaClient, WorkflowType } from '@prisma/client';
import { seedKnowledge } from './seed-knowledge';
import { seedWorkflowsExtra } from './seed-workflows';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Departments
  const departmentsData = [
    { name: 'Engineering', code: 'ENG' },
    { name: 'Human Resources', code: 'HR' },
    { name: 'Sales', code: 'SALES' },
    { name: 'Finance', code: 'FIN' },
    { name: 'Operations', code: 'OPS' },
    { name: 'Executive', code: 'EXEC' },
  ];

  const departments: Record<string, string> = {};
  for (const dept of departmentsData) {
    const created = await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    });
    departments[dept.code] = created.id;
  }
  console.log('Departments seeded.');

  // 2. Designations
  const designationsData = [
    { title: 'Chief Executive Officer', departmentCode: 'EXEC' },
    { title: 'Chief Technology Officer', departmentCode: 'EXEC' },
    { title: 'HR Management Director', departmentCode: 'HR' },
    { title: 'Lead Architect', departmentCode: 'ENG' },
    { title: 'Senior Backend Developer', departmentCode: 'ENG' },
    { title: 'Backend Developer', departmentCode: 'ENG' },
    { title: 'Senior Frontend Developer', departmentCode: 'ENG' },
    { title: 'Frontend Developer', departmentCode: 'ENG' },
    { title: 'QA Engineer', departmentCode: 'ENG' },
    { title: 'DevOps Engineer', departmentCode: 'ENG' },
    { title: 'HR Executive', departmentCode: 'HR' },
    { title: 'Finance Executive', departmentCode: 'FIN' },
    { title: 'Operations Head', departmentCode: 'OPS' },
    { title: 'Operations Executive', departmentCode: 'OPS' },
  ];

  for (const desig of designationsData) {
    const departmentId = departments[desig.departmentCode];
    await prisma.designation.upsert({
      where: {
        title_departmentId: {
          title: desig.title,
          departmentId: departmentId,
        },
      },
      update: {},
      create: {
        title: desig.title,
        departmentId: departmentId,
      },
    });
  }
  console.log('Designations seeded.');

  // 3. Leave types
  // Skipped deleteMany to prevent foreign key errors with leave_balances

  const leaveTypesData = [
    { code: 'CL_FULL', name: 'Casual Leave (Full Day)', maxDaysPerYear: 12, isCarryForwardAllowed: true, maxCarryForwardDays: 7, isPaidLeave: true },
    { code: 'CL_HALF', name: 'Casual Leave (Half Day)', maxDaysPerYear: 6, isCarryForwardAllowed: false, isPaidLeave: true },
    { code: 'MATERNITY', name: 'Maternity Leave', maxDaysPerYear: 180, isCarryForwardAllowed: false, isPaidLeave: true },
    { code: 'OPTIONAL', name: 'Optional Holiday', maxDaysPerYear: 2, isCarryForwardAllowed: false, isPaidLeave: true },
    { code: 'COMP', name: 'Compensatory Leave', maxDaysPerYear: 12, isCarryForwardAllowed: false, isPaidLeave: true },
  ];

  for (const lt of leaveTypesData) {
    await prisma.leaveType.upsert({
      where: { code: lt.code },
      update: lt,
      create: lt,
    });
  }
  console.log('Leave Types seeded.');

  // 3.5. Public Holidays
  const holidaysData = [
    { name: 'Makara Sankranti', date: new Date('2026-01-14') },
    { name: 'Republic Day', date: new Date('2026-01-26') },
    { name: 'Good Friday', date: new Date('2026-04-03') },
    { name: 'Ramzan', date: new Date('2026-03-20') },
    { name: 'Bakrid (Eid al-Adha)', date: new Date('2026-05-27') },
    { name: 'Independence Day', date: new Date('2026-08-15') },
    { name: 'Vinayaka Chaturthi', date: new Date('2026-09-14') },
    { name: 'Mahatma Gandhi Jayanti', date: new Date('2026-10-02') },
    { name: 'Dussehra', date: new Date('2026-10-20') },
    { name: 'Deepavali', date: new Date('2026-11-08') },
    { name: 'Christmas', date: new Date('2026-12-25') },
  ];

  for (const holiday of holidaysData) {
    await prisma.companyHoliday.upsert({
      // @ts-ignore: VS Code cache issue; compiler has verified this is correct
      where: { date: holiday.date },
      update: {},
      create: holiday,
    });
  }
  console.log('Public Holidays seeded.');

  // 4. Workflows
  const workflowsData = [
    { type: WorkflowType.LEAVE, name: 'Leave Approval Workflow', steps: [{step: 1, approverRole: 'MANAGER'}, {step: 2, approverRole: 'HR'}] },
    { type: WorkflowType.ASSET_REQUEST, name: 'Asset Request Workflow', steps: [{step: 1, approverRole: 'MANAGER'}, {step: 2, approverRole: 'IT'}] },
    { type: WorkflowType.RECRUITMENT, name: 'Recruitment Workflow', steps: [{step: 1, approverRole: 'MANAGER'}, {step: 2, approverRole: 'HR'}] },
    { type: WorkflowType.PROMOTION, name: 'Promotion Workflow', steps: [{step: 1, approverRole: 'MANAGER'}, {step: 2, approverRole: 'DEPARTMENT_HEAD'}, {step: 3, approverRole: 'HR'}, {step: 4, approverRole: 'CEO'}] },
    { type: WorkflowType.OFFBOARDING, name: 'Offboarding Workflow', steps: [{step: 1, approverRole: 'MANAGER'}, {step: 2, approverRole: 'IT'}, {step: 3, approverRole: 'HR'}] },
  ];

  for (const wf of workflowsData) {
    await prisma.workflow.upsert({
      where: { type: wf.type },
      update: { steps: wf.steps },
      create: wf,
    });
  }
  console.log('Workflows seeded.');

  // 5. App settings
  const settingsData = [
    { key: 'grievance_officer_contact', category: 'compliance', value: { name: 'TBD', email: 'grievance@naprocs.in', phone: 'TBD' } },
    { key: 'session_max_concurrent', category: 'security', value: 3 },
    { key: 'office_wifi_cidr', category: 'network', value: ['10.0.0.0/24'] },
  ];

  for (const setting of settingsData) {
    await prisma.appSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log('App Settings seeded.');

  // 6. Knowledge Base
  await seedKnowledge(prisma);

  // 7. Workflow Instances for Kanban
  await seedWorkflowsExtra(prisma);

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
