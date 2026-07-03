import { PrismaClient, WorkflowType } from '@prisma/client';

export async function seedWorkflowsExtra(prisma: PrismaClient) {
  console.log('Seeding extra workflow instances...');

  // Get some employee
  const employee = await prisma.employee.findFirst();

  if (!employee) return;

  // Ensure workflow types exist
  const offboarding = await prisma.workflow.findFirst({ where: { type: WorkflowType.OFFBOARDING } });
  const recruitment = await prisma.workflow.findFirst({ where: { type: WorkflowType.RECRUITMENT } });

  if (offboarding) {
    await prisma.workflowInstance.create({
      data: {
        workflowId: offboarding.id,
        initiatedById: employee.id,
        resourceId: employee.id,
        resourceType: 'EMPLOYEE',
        status: 'PENDING'
      }
    });
  }

  if (recruitment) {
    await prisma.workflowInstance.create({
      data: {
        workflowId: recruitment.id,
        initiatedById: employee.id,
        resourceId: employee.id,
        resourceType: 'EMPLOYEE',
        status: 'IN_PROGRESS'
      }
    });
  }

  console.log('Extra workflow instances seeded.');
}
