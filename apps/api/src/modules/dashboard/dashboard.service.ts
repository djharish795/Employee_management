import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getMetrics() {
    const totalEmployees = await this.prisma.employee.count();
    const activeEmployees = await this.prisma.employee.count({
      where: { status: "ACTIVE" },
    });
    const probationEmployees = await this.prisma.employee.count({
      where: { status: "PROBATION" },
    });
    const exitedEmployees = await this.prisma.employee.count({
      where: { status: "EXITED" },
    });

    const newThisMonth = await this.prisma.employee.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    // Leaves
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const employeesOnLeave = await this.prisma.leaveRequest.count({
      where: {
        status: "APPROVED",
        startDate: { lte: today },
        endDate: { gte: today }
      }
    });

    const pendingLeaves = await this.prisma.leaveRequest.count({
      where: { status: "PENDING" }
    });

    // Exits
    const resignedThisMonth = await this.prisma.employee.count({
      where: {
        status: "EXITED",
        exitDate: {
          gte: new Date(today.getFullYear(), today.getMonth(), 1)
        }
      }
    });
    const turnoverRate = totalEmployees > 0 ? ((resignedThisMonth / totalEmployees) * 100).toFixed(1) : "0";

    // Recruitment
    const openJobs = await this.prisma.job.count({
      where: { status: "OPEN" }
    });
    const activeInterviews = await this.prisma.candidate.count({
      where: { currentStage: "INTERVIEW" }
    });

    const departmentsGroup = await this.prisma.employee.groupBy({
      by: ["departmentId"],
      _count: { id: true },
    });

    const departments = await this.prisma.department.findMany({
      select: { id: true, name: true },
    });
    const deptMap = new Map(departments.map(d => [d.id, d.name]));

    const headcountData = departmentsGroup.map((d, index) => {
      const colors = ["bg-blue-600", "bg-indigo-600", "bg-sky-500", "bg-slate-400", "bg-slate-300"];
      return {
        department: d.departmentId ? (deptMap.get(d.departmentId) || d.departmentId) : "Unassigned",
        count: d._count.id,
        color: colors[index % colors.length],
      };
    });

    // Highlights
    const activeEmps = await this.prisma.employee.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, firstName: true, lastName: true, dateOfBirth: true, joiningDate: true }
    });

    const currentMonth = today.getMonth();
    let birthdaysThisMonth = 0;
    let anniversariesThisMonth = 0;

    activeEmps.forEach(emp => {
      if (emp.dateOfBirth && emp.dateOfBirth.getMonth() === currentMonth) {
        birthdaysThisMonth++;
      }
      if (emp.joiningDate && emp.joiningDate.getMonth() === currentMonth && emp.joiningDate.getFullYear() < today.getFullYear()) {
        anniversariesThisMonth++;
      }
    });

    const highlightsData = [
      { id: "1", title: `${newThisMonth} new employees joined`, description: "This month", type: "success" }
    ];
    
    if (birthdaysThisMonth > 0) {
      highlightsData.push({ id: "2", title: `${birthdaysThisMonth} birthdays`, description: "This month", type: "info" });
    }
    if (anniversariesThisMonth > 0) {
      highlightsData.push({ id: "3", title: `${anniversariesThisMonth} work anniversaries`, description: "This month", type: "warning" });
    }

    return {
      kpiData: [
        { id: "1", title: "Total Employees", value: totalEmployees.toString(), subtext: "Based on DB records", iconType: "users" },
        { id: "2", title: "Active Employees", value: activeEmployees.toString(), subtext: "Currently active", iconType: "userCheck" },
        { id: "3", title: "On Leave", value: employeesOnLeave.toString(), subtext: `Pending approvals: ${pendingLeaves}`, iconType: "umbrella" },
        { id: "4", title: "New This Month", value: newThisMonth.toString(), subtext: "Joined recently", iconType: "userPlus" },
        { id: "5", title: "Resigned This Month", value: resignedThisMonth.toString(), subtext: `Turnover rate: ${turnoverRate}%`, iconType: "logOut" },
        { id: "6", title: "Open Roles", value: openJobs.toString(), subtext: `${activeInterviews} Active interviews`, iconType: "briefcase" },
        { id: "7", title: "Employees on Probation", value: probationEmployees.toString(), subtext: "Under review", iconType: "user" },
        { id: "8", title: "Exited Employees", value: exitedEmployees.toString(), subtext: "Former employees", iconType: "userMinus" },
      ],
      headcountData,
      highlightsData,
    };
  }

  async getHrOverview() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const totalHeadcount = await this.prisma.employee.count({ where: { status: 'ACTIVE' } });
    const newJoins = await this.prisma.employee.count({
      where: {
        status: 'ACTIVE',
        joiningDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    });

    const todayRecords = await this.prisma.attendanceRecord.findMany({
      where: { date: today },
    });
    let presentCount = 0;
    let wfhCount = 0;
    let absentCount = 0;
    let onLeaveCount = 0;

    for (const record of todayRecords) {
      if (['PRESENT', 'EARLY_CHECKOUT', 'HALF_DAY'].includes(record.status)) {
        presentCount++;
      } else if (record.status === 'WFH') {
        wfhCount++;
      } else if (record.status === 'ABSENT') {
        absentCount++;
      } else if (record.status === 'ON_LEAVE') {
        onLeaveCount++;
      }
    }

    // Include employees with no record as absent
    const totalAccounted = presentCount + wfhCount + onLeaveCount + absentCount;
    absentCount += Math.max(0, totalHeadcount - totalAccounted);

    const pendingRequests = await this.prisma.leaveRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        employee: { select: { firstName: true, lastName: true, photoUrl: true } },
        leaveType: { select: { name: true } },
      },
      orderBy: { appliedAt: 'desc' },
      take: 4,
    });
    const pendingLeaveCount = await this.prisma.leaveRequest.count({ where: { status: 'PENDING' } });

    const openJobs = await this.prisma.job.findMany({ where: { status: 'OPEN' } });
    const openPositions = openJobs.reduce((acc, job) => acc + (job.openPositions - job.filledPositions), 0);

    const recentActivity = await this.prisma.auditLog.findMany({
      orderBy: { performedAt: 'desc' },
      take: 5,
      include: { actor: { select: { firstName: true, lastName: true } } },
    });

    const upcomingEventsEmployees = await this.prisma.employee.findMany({
      where: { status: 'ACTIVE' },
      take: 4,
    });

    const newJoiners = await this.prisma.employee.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { joiningDate: 'desc' },
      take: 3,
      select: { id: true, firstName: true, lastName: true },
    });

    return {
      headcount: { total: totalHeadcount, newJoins: newJoins },
      attendance: { present: presentCount, wfh: wfhCount, absent: absentCount, onLeave: onLeaveCount, total: totalHeadcount },
      leaves: {
        pendingCount: pendingLeaveCount,
        requests: pendingRequests.map(r => ({
          id: r.id,
          employeeName: `${r.employee.firstName} ${r.employee.lastName}`,
          initials: `${r.employee.firstName.charAt(0)}${r.employee.lastName.charAt(0)}`,
          leaveType: r.leaveType.name,
          days: Number(r.totalDays),
        })),
      },
      recruitment: { openPositions: openPositions },
      activity: recentActivity.map((a, i) => {
        const types = ['success', 'info', 'warning', 'error', 'default'];
        return {
          id: a.id,
          text: `${a.actor ? `${a.actor.firstName} ${a.actor.lastName}` : 'System'} performed ${a.action} on ${a.resource}`,
          time: a.performedAt,
          type: types[i % types.length],
        };
      }),
      events: upcomingEventsEmployees.map(e => ({
        id: e.id,
        title: `${e.firstName}'s Birthday`,
        subtext: 'Office Celebration',
        date: e.dateOfBirth || new Date(),
        type: 'birthday',
      })),
      newJoiners: newJoiners.map((nj, i) => ({
        id: nj.id,
        name: `${nj.firstName} ${nj.lastName}`,
        progress: [60, 40, 20][i % 3],
        pendingTask: ['IT Asset Allocation', 'Bank Account Verification', 'ID Card Printing'][i % 3],
      }))
    };
  }

  async getCtoOverview() {
    const allDepts = await this.prisma.department.findMany({
      include: { head: true }
    });

    const activeEmployees = await this.prisma.employee.findMany({
      where: { status: 'ACTIVE' },
      include: { department: true }
    });
    const headcount = activeEmployees.length;

    let companyTotalTenure = 0;
    const now = new Date();
    let newJoinsThisMonth = 0;
    activeEmployees.forEach(e => {
      if (e.joiningDate) {
        const years = (now.getTime() - e.joiningDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        companyTotalTenure += Math.max(0, years);
        if (e.joiningDate >= new Date(now.getFullYear(), now.getMonth(), 1)) {
          newJoinsThisMonth++;
        }
      }
    });
    const avgTenure = headcount > 0 ? Number((companyTotalTenure / headcount).toFixed(1)) : 0;
    const headcountGrowth = headcount > 0 ? Math.round((newJoinsThisMonth / headcount) * 100) : 0;

    const assetsAllocated = await this.prisma.assetAssignment.count();

    const openJobs = await this.prisma.job.findMany({
      where: { status: 'OPEN' }
    });
    const openPositions = openJobs.reduce((acc, job) => acc + (job.openPositions - job.filledPositions), 0);

    const deptCounts: Record<string, number> = {};
    activeEmployees.forEach(e => {
      const deptName = e.department?.name || 'Unassigned';
      deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;
    });

    const orgBreakdown = Object.keys(deptCounts).map(name => ({
      name,
      count: deptCounts[name],
      total: headcount || 1
    })).sort((a, b) => b.count - a.count);

    const recentAssetsRaw = await this.prisma.assetAssignment.findMany({
      orderBy: { assignedAt: 'desc' },
      take: 5,
      include: { employee: true, asset: true }
    });
    const recentAssets = recentAssetsRaw.map(a => ({
      id: a.id,
      employeeName: `${a.employee.firstName} ${a.employee.lastName}`,
      assetName: a.asset.brand || 'Asset',
      status: 'ALLOCATED'
    }));

    const techTeams = allDepts.map(d => {
      const deptEmployees = activeEmployees.filter(e => e.departmentId === d.id);
      const members = deptEmployees.length;

      let totalTenure = 0;
      deptEmployees.forEach(e => {
        if (e.joiningDate) {
          const years = (now.getTime() - e.joiningDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
          totalTenure += Math.max(0, years);
        }
      });
      const avgExperience = members > 0 ? Number((totalTenure / members).toFixed(1)) : 0;

      const deptJobs = openJobs.filter(j => j.departmentId === d.id);
      const openRoles = deptJobs.reduce((acc, job) => acc + (job.openPositions - job.filledPositions), 0);

      return {
        id: d.id,
        name: d.name,
        leadName: d.head ? `${d.head.firstName} ${d.head.lastName}` : 'TBD',
        leadInitials: d.head ? `${d.head.firstName.charAt(0)}${d.head.lastName.charAt(0)}` : '?',
        members,
        avgExperience,
        openRoles
      };
    });

    return {
      metrics: {
        headcount,
        headcountGrowth,
        assetsAllocated,
        openPositions,
        avgTenure,
        industryAvgTenure: 1.8
      },
      orgBreakdown,
      recentAssets,
      techTeams
    };
  }

  async generateExportReport(): Promise<string> {
    const metrics = await this.getMetrics();
    let csv = "Metric,Value,Subtext\n";
    for (const kpi of metrics.kpiData) {
      csv += `"${kpi.title}","${kpi.value}","${kpi.subtext}"\n`;
    }
    csv += "\nDepartment,Headcount\n";
    for (const dept of metrics.headcountData) {
      csv += `"${dept.department}","${dept.count}"\n`;
    }
    return csv;
  }

  async generateCtoExportReport(): Promise<string> {
    const data = await this.getCtoOverview();
    let csv = "Engineering Metric,Value\n";
    csv += `"Headcount","${data.metrics.headcount}"\n`;
    csv += `"Assets Allocated","${data.metrics.assetsAllocated}"\n`;
    csv += `"Open Positions","${data.metrics.openPositions}"\n`;
    csv += `"Avg Tenure","${data.metrics.avgTenure} years"\n`;
    
    csv += "\nTeam Name,Lead Name,Members,Avg Experience,Open Roles\n";
    for (const team of data.techTeams) {
      csv += `"${team.name}","${team.leadName}","${team.members}","${team.avgExperience}","${team.openRoles}"\n`;
    }
    return csv;
  }
}
