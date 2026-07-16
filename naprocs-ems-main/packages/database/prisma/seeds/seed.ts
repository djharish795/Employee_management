import { PrismaClient, WorkflowType } from '@prisma/client';

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
  const leaveTypesData = [
    { code: 'CL', name: 'Casual Leave', maxDaysPerYear: 8, isCarryForwardAllowed: false, isPaidLeave: true },
    { code: 'SL', name: 'Sick Leave', maxDaysPerYear: 6, isCarryForwardAllowed: false, isPaidLeave: true, requiresDocumentAbove: 2 },
    { code: 'EL', name: 'Earned Leave', maxDaysPerYear: 12, isCarryForwardAllowed: true, maxCarryForwardDays: 6, isPaidLeave: true },
    { code: 'ML', name: 'Maternity Leave', maxDaysPerYear: 182, isCarryForwardAllowed: false, isPaidLeave: true },
    { code: 'PL', name: 'Paternity Leave', maxDaysPerYear: 15, isCarryForwardAllowed: false, isPaidLeave: true },
    { code: 'BL', name: 'Bereavement Leave', maxDaysPerYear: 5, isCarryForwardAllowed: false, isPaidLeave: true },
    { code: 'COMP', name: 'Compensatory Leave', maxDaysPerYear: 12, isCarryForwardAllowed: false, isPaidLeave: true },
  ];

  for (const lt of leaveTypesData) {
    await prisma.leaveType.upsert({
      where: { code: lt.code },
      update: {},
      create: lt,
    });
  }
  console.log('Leave Types seeded.');

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
