import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function test() {
  try {
    const data = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test' + Date.now() + '@naprocs.in',
      phone: '1234567890',
      department: 'Engineering',
      employmentType: 'Full-time'
    };
    
    const DEPT_MAP: Record<string, string> = {
      "Engineering": "TR",
      "Product": "PR",
      "Design": "DS",
      "Sales": "SL",
      "HR": "HR"
    };
    const deptCode = DEPT_MAP[data.department] || "XX";
    const prefix = `NAP/${deptCode}/`;
    
    const latestEmployee = await db.employee.findFirst({
      where: { employeeId: { startsWith: prefix } },
      orderBy: { employeeId: 'desc' }
    });

    let nextNumber = 1;
    if (latestEmployee) {
      const parts = latestEmployee.employeeId.split('/');
      if (parts.length === 3) {
        const lastNumber = parseInt(parts[2], 10);
        if (!isNaN(lastNumber)) nextNumber = lastNumber + 1;
      }
    }
    const generatedEmployeeId = `${prefix}${nextNumber.toString().padStart(3, '0')}`;
    
    console.log("Generated ID:", generatedEmployeeId);

    const dept = data.department ? await db.department.findUnique({ where: { name: data.department } }) : null;
    const departmentId = dept?.id || null;
    
    const result = await db.$transaction(async (tx) => {
      const employee = await tx.employee.create({
        data: {
          employeeId: generatedEmployeeId,
          firstName: data.firstName,
          lastName: data.lastName,
          officialEmail: data.email,
          alternatePhone: data.phone,
          departmentId: departmentId,
          status: 'ONBOARDING',
          employeeType: 'FULL_TIME',
        }
      });
      console.log("Created employee:", employee.id);

      await tx.user.create({
        data: {
          email: data.email,
          passwordHash: 'dummy',
          employeeId: employee.id,
          role: 'EMPLOYEE',
          status: 'ACTIVE'
        }
      });
      console.log("Created user");

      const session = await tx.onboardingSession.create({
        data: {
          employeeId: employee.id,
          stage: 'OFFER_ACCEPTED'
        }
      });
      console.log("Created session:", session.id);

      await tx.onboardingTask.createMany({
        data: [
          { sessionId: session.id, title: 'Verify I-9', assignedTo: 'HR' }
        ]
      });
      console.log("Created tasks");
      return session;
    });

    console.log("SUCCESS!", result);
  } catch(e) {
    console.error("PRISMA ERROR:", e);
  } finally {
    await db.$disconnect();
  }
}

test();
