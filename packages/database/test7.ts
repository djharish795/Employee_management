import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const approverId = 'cmr1mln00001t3y1wzqsnibt9';

  const approver = await prisma.employee.findUnique({
    where: { id: approverId },
    include: { department: true, designation: true }
  });

  if (!approver) {
    console.log('Approver not found');
    return;
  }

  const role = approver.designation?.title || 'EMPLOYEE';

  const requests = await prisma.leaveRequest.findMany({
    where: { status: 'PENDING' },
    include: { employee: true, leaveType: true }
  });

  console.log(`Found ${requests.length} pending requests total`);

  const filtered = requests.filter(req => {
    const reqData = req as any;
    if (!reqData.approvalQueue) return false;
    const queue = reqData.approvalQueue;
    const currentStep = queue[reqData.currentStep];
    
    console.log(`Checking request ${req.id} - currentStep index: ${reqData.currentStep}, step data:`, currentStep);
    
    if (!currentStep) return false;
    if (currentStep.status !== 'PENDING') return false;

    if (currentStep.approverId) {
      console.log(`Has approverId: ${currentStep.approverId}, comparing to ${approverId} =>`, currentStep.approverId === approverId);
      return currentStep.approverId === approverId;
    }

    console.log(`Has role: ${currentStep.role}, comparing to ${role} =>`, currentStep.role === role);
    return currentStep.role === role;
  });

  console.log(`Final filtered count: ${filtered.length}`);
  console.log(JSON.stringify(filtered.map(f => f.id), null, 2));
}

main().finally(() => prisma.$disconnect());
