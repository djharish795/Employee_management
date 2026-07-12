import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { UpdateDepartmentDto } from "./dto/update-department.dto";
import { getPaginationOptions, createPaginatedResponse, PaginationParams, PaginatedResult } from "../../common/utils/pagination.util";
import { Department } from "@naprocs/database";

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createDepartment(dto: CreateDepartmentDto): Promise<Department> {
    const existingName = await this.prisma.department.findUnique({
      where: { name: dto.name },
    });
    if (existingName) throw new ConflictException("Department name already exists.");

    const existingCode = await this.prisma.department.findUnique({
      where: { code: dto.code },
    });
    if (existingCode) throw new ConflictException("Department code already exists.");

    return this.prisma.department.create({
      data: dto,
    });
  }

  async getDepartments(params: PaginationParams): Promise<PaginatedResult<Department>> {
    const { skip, take, page, limit } = getPaginationOptions(params);

    const [data, total] = await Promise.all([
      this.prisma.department.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          head: true,
          _count: {
            select: { employees: true, designations: true }
          }
        }
      }),
      this.prisma.department.count(),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async getDesignations() {
    const data = await this.prisma.designation.findMany({
      orderBy: { title: "asc" },
      include: {
        department: {
          select: { id: true, name: true, code: true }
        }
      }
    });
    return { data };
  }

  async getDepartmentById(id: string): Promise<Department> {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        head: true,
        parentDepartment: true,
        childDepartments: true,
        _count: {
          select: { employees: true, designations: true }
        }
      }
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found.`);
    }

    return department;
  }

  async updateDepartment(id: string, dto: UpdateDepartmentDto): Promise<Department> {
    await this.getDepartmentById(id); // verify exists

    if (dto.name) {
      const existingName = await this.prisma.department.findUnique({
        where: { name: dto.name },
      });
      if (existingName && existingName.id !== id) {
        throw new ConflictException("Department name already exists.");
      }
    }

    if (dto.code) {
      const existingCode = await this.prisma.department.findUnique({
        where: { code: dto.code },
      });
      if (existingCode && existingCode.id !== id) {
        throw new ConflictException("Department code already exists.");
      }
    }

    if (dto.headId !== undefined) {
      if (dto.headId === "") {
        dto.headId = null as any;
      } else {
        const headEmployee = await this.prisma.employee.findFirst({
          where: {
            OR: [
              { id: dto.headId },
              { employeeId: dto.headId }
            ]
          }
        });
        if (!headEmployee) {
          throw new NotFoundException(`Employee with ID or UUID ${dto.headId} not found.`);
        }
        dto.headId = headEmployee.id;
      }
    }

    return this.prisma.department.update({
      where: { id },
      data: dto,
    });
  }

  async getOrganisationDashboardStats() {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const departments = await this.prisma.department.findMany({
      include: {
        head: true,
        employees: {
          select: {
            id: true,
            status: true,
            joiningDate: true,
            exitDate: true,
          }
        }
      }
    });

    let totalHeadcount = 0;
    let largestDepartment = { name: '', count: 0 };
    
    const processedDepartments = departments.map(dept => {
      // Current active employees
      const activeEmployees = dept.employees.filter(emp => 
        emp.status !== 'EXITED' && (!emp.exitDate || emp.exitDate > new Date())
      );
      
      const count = activeEmployees.length;
      totalHeadcount += count;

      if (count > largestDepartment.count) {
        largestDepartment = { name: dept.name, count };
      }

      // Active employees one year ago
      const activeOneYearAgo = dept.employees.filter(emp => {
        if (!emp.joiningDate || emp.joiningDate > oneYearAgo) return false;
        if (emp.exitDate && emp.exitDate <= oneYearAgo) return false;
        return true;
      });

      const countOneYearAgo = activeOneYearAgo.length;
      const growthNumber = count - countOneYearAgo;
      const growthStr = growthNumber >= 0 ? `+${growthNumber}` : `${growthNumber}`;
      const growthType = growthNumber >= 0 ? 'growing' : 'stable';

      return {
        id: dept.id,
        name: dept.name,
        headInitials: dept.head ? `${dept.head.firstName[0]}${dept.head.lastName?.[0] || ''}`.toUpperCase() : 'NA',
        headName: dept.head ? `${dept.head.firstName} ${dept.head.lastName || ''}`.trim() : 'Not Assigned',
        headColor: this.getDepartmentColor(dept.name),
        count,
        growth: growthStr,
        growthType
      };
    });

    const avgDepartmentSize = departments.length > 0 
      ? (totalHeadcount / departments.length).toFixed(1) 
      : '0';

    // Calculate chart data (percentages)
    const chartData = processedDepartments.map(dept => ({
      name: dept.name,
      percentage: totalHeadcount > 0 ? Math.round((dept.count / totalHeadcount) * 100) : 0,
      color: this.getChartColor(dept.name)
    })).sort((a, b) => b.percentage - a.percentage); // Sort largest to smallest

    return {
      summary: {
        totalDepartments: departments.length,
        totalHeadcount,
        largestDepartment: largestDepartment.name,
        largestDepartmentCount: largestDepartment.count,
        avgDepartmentSize
      },
      departments: processedDepartments,
      chartData
    };
  }

  private getDepartmentColor(name: string) {
    const colors: Record<string, string> = {
      'Engineering': 'bg-blue-100 text-blue-700',
      'Sales': 'bg-orange-100 text-orange-700',
      'Human Resources': 'bg-purple-100 text-purple-700',
      'Operations': 'bg-emerald-100 text-emerald-700',
      'Finance': 'bg-teal-100 text-teal-700',
      'Executive': 'bg-indigo-100 text-indigo-700',
    };
    return colors[name] || 'bg-slate-100 text-slate-700';
  }

  private getChartColor(name: string) {
    const colors: Record<string, string> = {
      'Engineering': '#0f2c4a',
      'Sales': '#1f73d6',
      'Operations': '#3b93f0',
      'Human Resources': '#78baf8',
      'Finance': '#b3daf9',
      'Executive': '#def0fc',
    };
    return colors[name] || '#94a3b8';
  }
}
