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
}
