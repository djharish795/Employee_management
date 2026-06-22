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

    return {
      kpiData: [
        { id: "1", title: "Total Employees", value: totalEmployees.toString(), subtext: "Based on DB records", iconType: "users" },
        { id: "2", title: "Active Employees", value: activeEmployees.toString(), subtext: "Currently active", iconType: "userCheck" },
        { id: "3", title: "On Leave", value: "0", subtext: "Pending approvals: 0", iconType: "umbrella" },
        { id: "4", title: "New This Month", value: newThisMonth.toString(), subtext: "Joined recently", iconType: "userPlus" },
        { id: "5", title: "Resigned This Month", value: "1", subtext: "Turnover rate: 1.1%", iconType: "logOut" },
        { id: "6", title: "Open Roles", value: "5", subtext: "12 Active interviews", iconType: "briefcase" },
        { id: "7", title: "Employees on Probation", value: probationEmployees.toString(), subtext: "Under review", iconType: "user" },
        { id: "8", title: "Exited Employees", value: exitedEmployees.toString(), subtext: "Former employees", iconType: "userMinus" },
      ],
      headcountData,
      highlightsData: [
        { id: "1", title: `${newThisMonth} new employees joined`, description: "This month", type: "success" },
      ],
    };
  }
}
