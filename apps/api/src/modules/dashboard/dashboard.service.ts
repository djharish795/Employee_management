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

    const newThisMonth = await this.prisma.employee.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    const departmentsGroup = await this.prisma.employee.groupBy({
      by: ["departmentId"],
      _count: { id: true },
    });

    const headcountData = departmentsGroup.map((d, index) => {
      const colors = ["bg-blue-600", "bg-indigo-600", "bg-sky-500", "bg-slate-400", "bg-slate-300"];
      return {
        department: d.departmentId || "Unassigned",
        count: d._count.id,
        color: colors[index % colors.length],
      };
    });

    const onLeave = await this.prisma.leaveRequest.count().catch(() => 0);
    const presentToday = await this.prisma.attendanceRecord.count().catch(() => 0);

    return {
      kpiData: [
        { id: "1", title: "Total Employees", value: totalEmployees.toString(), subtext: "Based on DB records", iconType: "users" },
        { id: "2", title: "Active Employees", value: activeEmployees.toString(), subtext: "Currently active", iconType: "userCheck" },
        { id: "3", title: "On Leave", value: onLeave.toString(), subtext: "Pending approvals: 0", iconType: "umbrella" },
        { id: "4", title: "New This Month", value: newThisMonth.toString(), subtext: "Joined recently", iconType: "userPlus" },
      ],
      headcountData,
      highlightsData: [
        { id: "1", title: `${newThisMonth} new employees joined`, description: "This month", type: "success" },
      ],
    };
  }
}
