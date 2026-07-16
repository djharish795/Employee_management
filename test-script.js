const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const pendingRequests = await prisma.leaveRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        employee: { select: { firstName: true, lastName: true, photoUrl: true } },
        leaveType: { select: { name: true } },
      },
      orderBy: { appliedAt: 'desc' },
      take: 4,
    });
    
    console.log(pendingRequests);
    
    const mapped = pendingRequests.map(r => ({
      id: r.id,
      employeeName: `${r.employee.firstName} ${r.employee.lastName}`,
      initials: `${r.employee.firstName.charAt(0)}${r.employee.lastName.charAt(0)}`,
      leaveType: r.leaveType.name,
      days: Number(r.totalDays),
    }));

    console.log(mapped);

    const recentActivity = await prisma.auditLog.findMany({
      orderBy: { performedAt: 'desc' },
      take: 5,
      include: { actor: { select: { firstName: true, lastName: true } } },
    });
    
    console.log('recentActivity length:', recentActivity.length);
    recentActivity.forEach(a => {
      console.log('Actor:', a.actor);
    });

  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
