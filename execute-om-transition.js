const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const p = new PrismaClient();
const crypto = require('crypto');

async function run() {
  // 1. Fetch Junaid and Swetha
  const junaid = await p.employee.findFirst({
    where: { firstName: { contains: 'Junaid' } },
    include: { user: true, designation: true, department: true }
  });

  const swetha = await p.employee.findFirst({
    where: { firstName: { contains: 'Swetha' } },
    include: { user: true, designation: true, department: true }
  });

  if (!junaid || !swetha) {
    console.error('Could not find Junaid or Swetha');
    process.exit(1);
  }

  const swethaOldDesignationId = swetha.designationId;
  const swethaOldDepartmentId = swetha.departmentId;

  // 2. Reassign Junaid's subordinates to Swetha
  const updatedSubs = await p.employee.updateMany({
    where: { reportingManagerId: junaid.id },
    data: { reportingManagerId: swetha.id }
  });
  console.log(`Reassigned ${updatedSubs.count} subordinates from Junaid to Swetha.`);

  // 3. Promote Swetha
  await p.employee.update({
    where: { id: swetha.id },
    data: {
      designationId: junaid.designationId,
      departmentId: junaid.departmentId
    }
  });
  
  if (junaid.user && swetha.user) {
    await p.user.update({
      where: { id: swetha.user.id },
      data: { role: junaid.user.role }
    });
  }
  console.log('Promoted Swetha to', junaid.designation.title);

  // 4. Offboard Junaid
  await p.employee.update({
    where: { id: junaid.id },
    data: {
      status: 'EXITED',
      exitDate: new Date()
    }
  });
  
  if (junaid.user) {
    await p.user.update({
      where: { id: junaid.user.id },
      data: { status: 'SUSPENDED' } // Disable login
    });
  }
  console.log('Offboarded Junaid.');

  // 5. Create Vacant CRM Executive
  const vacantId = 'EMP-VAC-' + Date.now().toString().slice(-4);
  const vacantEmail = `vacant.crm.${Date.now()}@naprocs.in`;
  
  const vacantEmp = await p.employee.create({
    data: {
      id: crypto.randomUUID(),
      employeeId: vacantId,
      firstName: 'Vacant',
      lastName: 'CRM',
      officialEmail: vacantEmail,
      gender: 'MALE',
      joiningDate: new Date(),
      status: 'ACTIVE',
      departmentId: swethaOldDepartmentId,
      designationId: swethaOldDesignationId,
      workLocation: swetha.workLocation,
      reportingManagerId: swetha.id,
      user: {
        create: {
          email: vacantEmail,
          passwordHash: 'no-password', // Placeholder
          role: swetha.user ? swetha.user.role : 'EMPLOYEE',
          status: 'ACTIVE'
        }
      }
    }
  });
  
  console.log('Created Vacant CRM role:', vacantEmp.firstName, vacantEmp.lastName);
}

run().then(() => {
  p.$disconnect();
  process.exit(0);
});
