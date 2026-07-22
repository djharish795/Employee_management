const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();
const getCalendar = async (employeeId) => {
    let teamIds = undefined;
    if (employeeId) {
      const hrSubordinates = await prisma.employee.findMany({
        where: { reportingManagerId: employeeId, status: { not: "EXITED" } },
        select: { id: true }
      });

      const tlProjects = await prisma.projectAssignment.findMany({
        where: { employeeId: employeeId, projectRole: "TL", releasedAt: null },
        select: { projectId: true }
      });
      const tlProjectIds = tlProjects.map(p => p.projectId);

      const projectMembers = await prisma.projectAssignment.findMany({
        where: {
          projectId: { in: tlProjectIds },
          projectRole: { in: ["TR", "TS"] },
          releasedAt: null,
          employeeId: { not: employeeId }
        },
        select: { employeeId: true }
      });

      const ids = new Set();
      ids.add(employeeId); // ALWAYS include the employee themselves
      hrSubordinates.forEach(emp => ids.add(emp.id));
      projectMembers.forEach(pm => ids.add(pm.employeeId));

      teamIds = Array.from(ids);
    }

    const requests = await prisma.leaveRequest.findMany({
      where: {
        status: { in: ['APPROVED', 'PENDING'] },
        ...(teamIds ? { employeeId: { in: teamIds } } : {})
      },
      include: {
        employee: { include: { department: true } },
        leaveType: true
      },
      orderBy: { startDate: 'asc' }
    });

    return requests.map(r => ({
      ...r,
      totalDays: typeof r.totalDays === 'object' && r.totalDays.toNumber ? r.totalDays.toNumber() : r.totalDays,
      paidDays: typeof r.paidDays === 'object' && r.paidDays.toNumber ? r.paidDays.toNumber() : r.paidDays,
      unpaidDays: typeof r.unpaidDays === 'object' && r.unpaidDays.toNumber ? r.unpaidDays.toNumber() : r.unpaidDays
    }));
};

getCalendar('cmruoh6wa000xjpd1b678r041').then(r => console.log(JSON.stringify(r, null, 2))).catch(console.error).finally(() => prisma.$disconnect());
