const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ include: { employee: true } });
  const ceo = users.find(u => u.role === 'CEO');
  const om = users.find(u => u.role === 'OM');
  
  if (ceo?.employee && om?.employee) {
    const ceoId = ceo.employee.id;
    const reports = await prisma.workReport.findMany();
    const fieldReqs = await prisma.fieldWorkRequest.findMany();
    
    console.log('CEO ID:', ceoId);
    console.log('OM ID:', om.employee.id);
    console.log('OM reportingManagerId:', om.employee.reportingManagerId);
    
    console.log('Work Reports:', reports.map(r => ({
      id: r.id, 
      employeeId: r.employeeId, 
      reviewerId: r.reviewerId,
      status: r.status
    })));
    
    console.log('Field Work Requests:', fieldReqs.map(r => ({
      id: r.id, 
      employeeId: r.employeeId, 
      approverId: r.approverId,
      status: r.status
    })));
  }
}
main().catch(console.error);
