const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();
prisma.leaveRequest.findMany().then(requests => {
  const mapped = requests.map((r) => ({
      ...r,
      totalDays: r.totalDays?.toNumber(),
      paidDays: r.paidDays?.toNumber(),
      unpaidDays: r.unpaidDays?.toNumber()
  }));
  console.log(mapped);
}).catch(console.error).finally(() => prisma.$disconnect());
