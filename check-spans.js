const fs = require('fs');
const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const reqs = await prisma.leaveRequest.findMany({
    where: { status: 'APPROVED' },
    include: { employee: true }
  });

  let out = '';
  for (const r of reqs) {
    const daysSpan = (new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / (1000 * 60 * 60 * 24) + 1;
    out += `${r.employee.employeeId} | ${r.startDate.toISOString().split('T')[0]} to ${r.endDate.toISOString().split('T')[0]} | Span: ${daysSpan} | Paid: ${r.paidDays} | Total: ${r.totalDays}\n`;
  }
  
  fs.writeFileSync('leave-spans.txt', out);
  console.log("Done");
}

main().then(() => prisma.$disconnect()).catch(console.error);
