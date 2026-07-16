import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting exact hierarchy seed...');

  // 1. Create Departments
  const deps = {
    executive: await prisma.department.upsert({
      where: { code: 'EXEC' },
      update: {},
      create: { name: 'Executive', code: 'EXEC' },
    }),
    tech: await prisma.department.upsert({
      where: { code: 'TECH' },
      update: {},
      create: { name: 'Technology', code: 'TECH' },
    }),
    finance: await prisma.department.upsert({
      where: { code: 'FIN' },
      update: {},
      create: { name: 'Finance', code: 'FIN' },
    }),
    operations: await prisma.department.upsert({
      where: { code: 'OPS' },
      update: {},
      create: { name: 'Operations', code: 'OPS' },
    }),
    hr: await prisma.department.upsert({
      where: { code: 'HR' },
      update: {},
      create: { name: 'Human Resources', code: 'HR' },
    }),
    marketing: await prisma.department.upsert({
      where: { code: 'MKTG' },
      update: {},
      create: { name: 'Marketing & Sales', code: 'MKTG' },
    })
  };

  // Helper to create designation
  const createDesig = async (title: string, depId: string) => {
    const existing = await prisma.designation.findFirst({
      where: { title, departmentId: depId }
    });
    if (existing) return existing;
    return prisma.designation.create({
      data: { title, departmentId: depId }
    });
  };

  const desigs = {
    CEO: await createDesig('Chief Executive Officer', deps.executive.id),
    CTO: await createDesig('Chief Technology Officer', deps.tech.id),
    CFO: await createDesig('Chief Financial Officer', deps.finance.id),
    COO: await createDesig('Chief Operating Officer', deps.operations.id),
    CRO: await createDesig('Chief Risk/HR Officer', deps.hr.id),
    CMO: await createDesig('Chief Marketing Officer', deps.marketing.id),

    // Tech
    QM: await createDesig('Quality Manager', deps.tech.id),
    QA: await createDesig('Quality Analyst', deps.tech.id),
    QE: await createDesig('Quality Engineer', deps.tech.id),
    DM: await createDesig('Delivery Manager', deps.tech.id),
    SPM: await createDesig('Senior Project Manager', deps.tech.id),
    PM: await createDesig('Project Manager', deps.tech.id),
    TL: await createDesig('Team Lead', deps.tech.id),
    TR: await createDesig('Technical Resource', deps.tech.id),
    TS: await createDesig('Technical Support', deps.tech.id),
    SDM: await createDesig('Service Delivery Manager', deps.tech.id),
    ITM: await createDesig('IT Manager', deps.tech.id),
    ITE: await createDesig('IT Executive', deps.tech.id),

    // Finance
    FM: await createDesig('Finance Manager', deps.finance.id),
    AC: await createDesig('Accountant', deps.finance.id),

    // Operations
    OM: await createDesig('Operations Manager', deps.operations.id),
    CEM: await createDesig('Client Acquisition Manager', deps.operations.id),
    OE: await createDesig('Operations Executive', deps.operations.id),
    CRM: await createDesig('Client Relation Manager', deps.operations.id),
    TAM: await createDesig('Talent Acquisition Manager', deps.operations.id),

    // HR
    HRM: await createDesig('HR Manager', deps.hr.id),
    HRE: await createDesig('HR Executive', deps.hr.id),

    // Marketing
    PMM: await createDesig('Physical Marketing Manager', deps.marketing.id),
    PME: await createDesig('Physical Marketing Executive', deps.marketing.id),
    DMM: await createDesig('Digital Marketing Manager', deps.marketing.id),
    DME: await createDesig('Digital Marketing Executive', deps.marketing.id),
    SM: await createDesig('Sales Manager', deps.marketing.id),
    SE: await createDesig('Sales Executive', deps.marketing.id),
  };

  // Helper to create employee
  const createEmp = async (code: string, desigId: string, depId: string, managerId: string | null = null, firstName: string = 'Vacant', lastName: string = '') => {
    return prisma.employee.upsert({
      where: { employeeId: `EMP-${code}` },
      update: { reportingManagerId: managerId },
      create: {
        employeeId: `EMP-${code}`,
        firstName,
        lastName: lastName || code,
        officialEmail: `${code.toLowerCase()}@naprocs.in`,
        designationId: desigId,
        departmentId: depId,
        reportingManagerId: managerId,
        status: 'ACTIVE'
      }
    });
  };

  console.log('Creating CEO...');
  const ceo = await createEmp('CEO', desigs.CEO.id, deps.executive.id, null, 'Pradeep', 'Chandra');

  console.log('Creating C-Level...');
  const cto = await createEmp('CTO', desigs.CTO.id, deps.tech.id, ceo.id, 'Lokesh');
  const cfo = await createEmp('CFO', desigs.CFO.id, deps.finance.id, ceo.id);
  const coo = await createEmp('COO', desigs.COO.id, deps.operations.id, ceo.id);
  const cro = await createEmp('CRO', desigs.CRO.id, deps.hr.id, ceo.id);
  const cmo = await createEmp('CMO', desigs.CMO.id, deps.marketing.id, ceo.id);

  console.log('Creating Tech Hierarchy...');
  const qm = await createEmp('QM', desigs.QM.id, deps.tech.id, cto.id);
  const qa = await createEmp('QA', desigs.QA.id, deps.tech.id, qm.id);
  await createEmp('QE', desigs.QE.id, deps.tech.id, qa.id);

  const dm = await createEmp('DM', desigs.DM.id, deps.tech.id, cto.id);
  const spm = await createEmp('SPM', desigs.SPM.id, deps.tech.id, dm.id);
  const pm = await createEmp('PM', desigs.PM.id, deps.tech.id, spm.id);
  const tl = await createEmp('TL', desigs.TL.id, deps.tech.id, pm.id);
  await createEmp('TR', desigs.TR.id, deps.tech.id, tl.id);
  await createEmp('TS', desigs.TS.id, deps.tech.id, tl.id);

  const sdm = await createEmp('SDM', desigs.SDM.id, deps.tech.id, cto.id);
  const itm = await createEmp('ITM', desigs.ITM.id, deps.tech.id, sdm.id);
  await createEmp('ITE', desigs.ITE.id, deps.tech.id, itm.id);

  console.log('Creating Finance Hierarchy...');
  const fm = await createEmp('FM', desigs.FM.id, deps.finance.id, cfo.id);
  await createEmp('AC', desigs.AC.id, deps.finance.id, fm.id);

  console.log('Creating Operations Hierarchy...');
  const om = await createEmp('OM', desigs.OM.id, deps.operations.id, coo.id);
  const cem = await createEmp('CEM', desigs.CEM.id, deps.operations.id, om.id);
  await createEmp('OE', desigs.OE.id, deps.operations.id, cem.id);
  const crm = await createEmp('CRM', desigs.CRM.id, deps.operations.id, om.id);
  await createEmp('TAM', desigs.TAM.id, deps.operations.id, crm.id);

  console.log('Creating HR Hierarchy...');
  const hrm = await createEmp('HRM', desigs.HRM.id, deps.hr.id, cro.id);
  await createEmp('HRE', desigs.HRE.id, deps.hr.id, hrm.id);

  console.log('Creating Marketing Hierarchy...');
  const pmm = await createEmp('PMM', desigs.PMM.id, deps.marketing.id, cmo.id);
  await createEmp('PME', desigs.PME.id, deps.marketing.id, pmm.id);

  const dmm = await createEmp('DMM', desigs.DMM.id, deps.marketing.id, cmo.id);
  await createEmp('DME', desigs.DME.id, deps.marketing.id, dmm.id);

  const sm = await createEmp('SM', desigs.SM.id, deps.marketing.id, cmo.id);
  await createEmp('SE', desigs.SE.id, deps.marketing.id, sm.id);

  console.log('Hierarchy seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
