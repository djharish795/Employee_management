const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const types = await prisma.leaveType.findMany();
  console.log('--- LEAVE TYPES ---');
  types.forEach(t => console.log(`${t.code}: ${t.id} - ${t.name}`));
  
  const employee = await prisma.employee.findFirst({ where: { employeeId: 'NAP/OR/002' } });
  
  const balances = await prisma.leaveBalance.findMany({ 
    where: { employeeId: employee.id },
    include: { leaveType: true }
  });
  console.log('\n--- BALANCES NAP/OR/002 ---');
  balances.forEach(b => console.log(`${b.leaveType.code} (${b.leaveType.name}): Alloc=${b.allocated}, Used=${b.used}, Pend=${b.pending}, Avail=${Number(b.allocated)-Number(b.used)-Number(b.pending)}`));
}

main().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); });
