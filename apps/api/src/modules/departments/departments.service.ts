import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const departments = await this.prisma.department.findMany({
      include: {
        head: true,
        employees: {
          where: { status: 'ACTIVE' },
          select: { firstName: true }
        }
      }
    });

    const totalDepartments = departments.length;
    let totalHeadcount = 0;
    let totalVacant = 0;
    let largestDepartment = '';
    let largestDepartmentCount = 0;

    const formattedDepartments = departments.map((dept: any, index: number) => {
      const activeEmployees = dept.employees || [];
      const filledCount = activeEmployees.filter((e: any) => e.firstName !== 'Vacant').length;
      const vacantCount = activeEmployees.filter((e: any) => e.firstName === 'Vacant').length;

      totalHeadcount += filledCount;
      totalVacant += vacantCount;

      if (filledCount > largestDepartmentCount) {
        largestDepartmentCount = filledCount;
        largestDepartment = dept.name;
      }

      // Assign deterministic color based on index
      const colors = ["bg-slate-900 text-slate-100", "bg-emerald-500 text-emerald-50", "bg-violet-500 text-violet-50", "bg-amber-500 text-amber-50", "bg-rose-500 text-rose-50", "bg-blue-500 text-blue-50", "bg-cyan-500 text-cyan-50"];
      const headColor = colors[index % colors.length];

      let headInitials = 'NA';
      let headName = 'Not Assigned';
      if (dept.head) {
        headInitials = `${dept.head.firstName?.[0] || ''}${dept.head.lastName?.[0] || ''}`.toUpperCase() || 'UN';
        headName = `${dept.head.firstName} ${dept.head.lastName || ''}`.trim();
      }

      return {
        id: dept.id,
        name: dept.name,
        headName,
        headInitials,
        headColor,
        count: filledCount,
        vacantCount,
        // Mocking growth logic
        growth: filledCount > 0 ? '+5%' : '0%',
        growthType: filledCount > 0 ? 'growing' : 'stable'
      };
    });

    // Sort by largest department first
    formattedDepartments.sort((a: any, b: any) => b.count - a.count);

    const avgDepartmentSize = totalDepartments > 0 ? Math.round(totalHeadcount / totalDepartments) : 0;

    // Chart data mapping
    const chartColors = ["#0f172a", "#10b981", "#8b5cf6", "#f59e0b", "#f43f5e", "#3b82f6", "#06b6d4"];
    const chartData = formattedDepartments.slice(0, 6).map((dept: any, idx: number) => ({
      name: dept.name,
      percentage: totalHeadcount > 0 ? Math.round((dept.count / totalHeadcount) * 100) : 0,
      color: chartColors[idx % chartColors.length]
    }));

    if (formattedDepartments.length > 6) {
      const othersCount = formattedDepartments.slice(6).reduce((sum: number, dept: any) => sum + dept.count, 0);
      chartData.push({
        name: 'Others',
        percentage: totalHeadcount > 0 ? Math.round((othersCount / totalHeadcount) * 100) : 0,
        color: "#94a3b8"
      });
    }

    return {
      summary: {
        totalDepartments,
        totalHeadcount,
        totalVacant,
        largestDepartment,
        largestDepartmentCount,
        avgDepartmentSize
      },
      departments: formattedDepartments,
      chartData
    };
  }
}
