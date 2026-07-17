import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { EmployeeStatus } from "@naprocs/database";

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getMetrics() {
    const totalEmployees = await this.prisma.employee.count({
      where: { status: { notIn: [EmployeeStatus.EXITED, EmployeeStatus.CANCELLED, EmployeeStatus.ONBOARDING] } },
    });
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
      where: { status: { notIn: [EmployeeStatus.EXITED, EmployeeStatus.CANCELLED, EmployeeStatus.ONBOARDING] } },
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
        count: (d._count as any).id,
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

    const totalCapacity = await this.prisma.employee.count({
      where: { status: { notIn: [EmployeeStatus.EXITED, EmployeeStatus.CANCELLED, EmployeeStatus.ONBOARDING] } }
    });
    const activeEmployees = await this.prisma.employee.count({ where: { status: 'ACTIVE' } });
    const newJoins = await this.prisma.employee.count({
      where: {
        status: 'ACTIVE',
        joiningDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    });

    const todayRecords = await this.prisma.attendanceRecord.findMany({
      where: { date: today },
    });
    
    // Find all employees on an approved leave today
    const todayLeaves = await this.prisma.leaveRequest.findMany({
      where: {
        status: 'APPROVED',
        startDate: { lte: today },
        endDate: { gte: today }
      }
    });

    let presentCount = 0;
    let wfhCount = 0;
    let absentCount = 0;
    
    const onLeaveCount = todayLeaves.length;

    for (const record of todayRecords) {
      if (['PRESENT', 'EARLY_CHECKOUT', 'HALF_DAY', 'LATE'].includes(record.status)) {
        presentCount++;
      } else if (record.status === 'WFH') {
        wfhCount++;
      } else if (record.status === 'ABSENT') {
        absentCount++;
      }
    }

    // Include employees with no record and no leave as "Not Punched In"
    const totalAccounted = presentCount + wfhCount + onLeaveCount + absentCount;
    const notPunchedIn = Math.max(0, activeEmployees - totalAccounted) + absentCount;

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
      where: { status: { in: ['ACTIVE', 'ONBOARDING'] } },
      orderBy: { joiningDate: 'desc' },
      take: 3,
      select: { 
        id: true, 
        firstName: true, 
        lastName: true,
        onboardingSession: {
          include: {
            tasks: {
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      },
    });

    return {
      headcount: { total: totalCapacity, active: activeEmployees, newJoins: newJoins },
      attendance: { present: presentCount, wfh: wfhCount, notPunchedIn: notPunchedIn, onLeave: onLeaveCount, total: activeEmployees },
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
      newJoiners: newJoiners.map((nj) => {
        let progress = 0;
        let pendingTask = 'All tasks completed';
        
        if (nj.onboardingSession) {
          const tasks = nj.onboardingSession.tasks || [];
          const totalTasks = tasks.length;
          if (totalTasks > 0) {
            const completedTasks = tasks.filter(t => t.isCompleted).length;
            progress = Math.round((completedTasks / totalTasks) * 100);
            const nextPending = tasks.find(t => !t.isCompleted);
            if (nextPending) {
              pendingTask = nextPending.title;
            }
          } else {
             pendingTask = 'Pending task setup';
          }
        } else {
          pendingTask = 'No onboarding session';
        }

        return {
          id: nj.id,
          name: `${nj.firstName} ${nj.lastName}`,
          progress,
          pendingTask,
        };
      })
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
    const industryAvgSetting = await this.prisma.appSetting.findUnique({
      where: { key: 'INDUSTRY_AVG_TENURE' }
    });
    const industryAvgTenure = industryAvgSetting?.value ? Number(industryAvgSetting.value) : 1.8;

    return {
      metrics: {
        headcount,
        headcountGrowth,
        assetsAllocated,
        openPositions,
        avgTenure,
        industryAvgTenure
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

  async getTeamLeadOverview(user: any): Promise<any> {
    const employeeId = user.employeeId;
    if (!employeeId) throw new BadRequestException("Employee ID is required");

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // 1. Get subordinates (Global HR)
    const hrSubordinates = await this.prisma.employee.findMany({
      where: { reportingManagerId: employeeId, status: { not: "EXITED" } },
      include: {
        department: true,
        designation: true,
        projectAssignments: {
          where: { releasedAt: null },
          include: { project: true }
        }
      }
    });

    // 1b. Get Project Members
    const tlProjects = await this.prisma.projectAssignment.findMany({
      where: { employeeId: employeeId, projectRole: "TL", releasedAt: null },
      select: { projectId: true }
    });
    const tlProjectIds = tlProjects.map((p: any) => p.projectId);

    const projectMembers = await this.prisma.projectAssignment.findMany({
      where: {
        projectId: { in: tlProjectIds },
        projectRole: { in: ["TR", "TS"] },
        releasedAt: null,
        employeeId: { not: employeeId }
      },
      include: {
        employee: {
          include: {
            department: true,
            designation: true,
            projectAssignments: {
              where: { releasedAt: null },
              include: { project: true }
            }
          }
        }
      }
    });

    // Merge them and remove duplicates
    const employeeMap = new Map();
    hrSubordinates.forEach((emp: any) => employeeMap.set(emp.id, emp));
    projectMembers.forEach((assignment: any) => {
      if (assignment.employee && !employeeMap.has(assignment.employeeId)) {
        employeeMap.set(assignment.employeeId, assignment.employee);
      }
    });

    const subordinates = Array.from(employeeMap.values());
    const directReportsCount = subordinates.length;

    // 2. Attendance Stats for Subordinates Today
    const subIds = subordinates.map(s => s.id);
    const todayRecords = await this.prisma.attendanceRecord.findMany({
      where: {
        date: today,
        employeeId: { in: subIds }
      },
      select: {
        id: true,
        employeeId: true,
        status: true,
        checkInTime: true,
        checkOutTime: true,
        date: true
      }
    });

    // Check leaves today for subordinates
    const todayLeaves = await this.prisma.leaveRequest.findMany({
      where: {
        employeeId: { in: subIds },
        startDate: { lte: today },
        endDate: { gte: today },
        status: "APPROVED"
      },
      include: { leaveType: true }
    });

    let presentTodayCount = 0;
    const recordMap = new Map(todayRecords.map(r => [r.employeeId, r]));
    const leaveMap = new Map(todayLeaves.map(l => [l.employeeId, l]));

    // Format Team Today List
    // Fetch all active tasks assigned to subordinates
    const activeTasks = await this.prisma.task.findMany({
      where: {
        assigneeId: { in: subIds },
        status: "IN_PROGRESS"
      },
      orderBy: { createdAt: "desc" }
    });
    const taskMap = new Map();
    activeTasks.forEach(t => {
      if (!taskMap.has(t.assigneeId)) {
        taskMap.set(t.assigneeId, t);
      }
    });

    const teamToday = subordinates.map(sub => {
      const record = recordMap.get(sub.id);
      const leave = leaveMap.get(sub.id);
      
      let status = "ABSENT";
      let statusClass = "bg-rose-50 text-rose-600 border-rose-100";
      let time = "—";
      let isDimmed = false;

      if (record) {
        const recordStatus = record.status as string;
        if (["PRESENT", "HALF_DAY", "EARLY_CHECKOUT", "WFH"].includes(recordStatus)) {
          status = "Present";
          statusClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
          presentTodayCount++;
        } else if (recordStatus === "LATE") {
          status = "Late";
          statusClass = "bg-orange-50 text-orange-600 border-orange-100";
          presentTodayCount++;
        }
        if (record.checkInTime) {
          time = record.checkInTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
        }
      } else if (leave) {
        status = "On leave";
        statusClass = "bg-slate-100 text-slate-500 border-slate-200";
        isDimmed = true;
      }

      const activeTask = taskMap.get(sub.id);
      const initials = `${sub.firstName.charAt(0)}${sub.lastName.charAt(0)}`.toUpperCase();

      return {
        id: sub.id,
        initials,
        name: `${sub.firstName} ${sub.lastName}`,
        bgClass: sub.gender === "FEMALE" ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700",
        status,
        statusClass,
        time,
        task: activeTask ? activeTask.title : "—",
        isDimmed
      };
    });

    const presentTodayPercentage = directReportsCount > 0 ? Math.round((presentTodayCount / directReportsCount) * 100) : 0;

    // 3. Pending Approvals Count (Leaves where user.employeeId is the current approver)
    const pendingLeaveRequests = await this.prisma.leaveRequest.findMany({
      where: { status: "PENDING" },
      include: { employee: true, leaveType: true }
    });

    // Resolve user role
    const tlEmployee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { department: true, designation: true }
    });
    const tlDesignation = tlEmployee?.designation?.title || "";
    const deptCode = tlEmployee?.department?.code || "";
    let tlRole = tlDesignation;
    if (!['TR', 'TS', 'TL', 'QA', 'QE', 'HRE', 'CTO', 'CEO'].includes(tlRole)) {
      if (deptCode === 'HR') tlRole = 'HRE';
      else tlRole = 'EMPLOYEE';
    }

    const pendingApprovals = pendingLeaveRequests.filter((req: any) => {
      if (!req.approvalQueue) return false;
      const queue = req.approvalQueue as any[];
      const currentStep = queue[req.currentStep];
      return currentStep && currentStep.role === tlRole && currentStep.status === "PENDING";
    }).map((req: any) => {
      return {
        id: req.id,
        name: `${req.employee.firstName} ${req.employee.lastName}`,
        type: `${req.leaveType.name} • ${req.totalDays} days`,
        status: "Pending"
      };
    });

    const pendingApprovalsCount = pendingApprovals.length;

    // 4. Tasks In Progress Count
    const tlProjectAssignments = await this.prisma.projectAssignment.findMany({
      where: { employeeId: employeeId, releasedAt: null }
    });
    const projectIds = tlProjectAssignments.map(pa => pa.projectId);

    const tasksInProgressCount = await this.prisma.task.count({
      where: {
        status: "IN_PROGRESS",
        OR: [
          { assigneeId: { in: subIds } },
          { projectId: { in: projectIds } }
        ]
      }
    });

    // 5. Task Board Snapshot
    const snapshotTasks = await this.prisma.task.findMany({
      where: {
        OR: [
          { assigneeId: { in: subIds } },
          { projectId: { in: projectIds } }
        ],
        status: { in: ["TODO", "IN_PROGRESS", "BLOCKED"] }
      },
      include: { assignee: true, project: true },
      orderBy: { updatedAt: "desc" }
    });

    const tasksTodo = snapshotTasks.filter(t => t.status === "TODO").slice(0, 3).map(t => ({
      id: t.id,
      title: t.title,
      tag: t.type
    }));

    const tasksInProgress = snapshotTasks.filter(t => t.status === "IN_PROGRESS").slice(0, 3).map(t => {
      const assigneeInitials = t.assignee ? `${t.assignee.firstName.charAt(0)}${t.assignee.lastName.charAt(0)}`.toUpperCase() : "—";
      return {
        id: t.id,
        title: t.title,
        tag: t.type,
        assignee: assigneeInitials,
        tagColor: t.type === "BUG" ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-blue-50 text-blue-600 border-blue-100"
      };
    });

    const tasksBlocked = snapshotTasks.filter(t => t.status === "BLOCKED").slice(0, 3).map(t => {
      const dateBlocked = t.updatedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      return {
        id: t.id,
        title: t.title,
        tag: t.type,
        dateBlocked
      };
    });

    return {
      kpiData: {
        directReportsCount,
        presentTodayCount,
        presentTodayPercentage,
        pendingApprovalsCount,
        tasksInProgressCount
      },
      teamToday,
      pendingApprovals,
      taskBoardSnapshot: {
        todo: tasksTodo,
        inProgress: tasksInProgress,
        blocked: tasksBlocked
      }
    };
  }
}
