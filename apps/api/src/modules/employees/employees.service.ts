import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { getPaginationOptions, createPaginatedResponse, PaginationParams, PaginatedResult } from "../../common/utils/pagination.util";
import { Employee } from "@naprocs/database";

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async createEmployee(dto: CreateEmployeeDto): Promise<Employee> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Check uniqueness of officialEmail
      const existingEmail = await tx.employee.findUnique({
        where: { officialEmail: dto.officialEmail },
      });

      if (existingEmail) {
        throw new ConflictException("An employee with this official email already exists.");
      }

      if (dto.designationId) {
        const designation = await tx.designation.findUnique({
          where: { id: dto.designationId }
        });
        if (!designation) {
          throw new NotFoundException(`Designation with ID ${dto.designationId} not found.`);
        }
        if (designation.departmentId !== dto.departmentId) {
          throw new ConflictException("The selected designation does not belong to the selected department.");
        }
      }

      // 2. Generate employeeId (EMP-0001 format)
      // TODO: Concurrency Limitation - If two requests execute this transaction at the exact
      // same time, they may both read the same lastEmployee ID. The first to commit will
      // succeed, while the second will fail with a Prisma Unique Constraint Violation (P2002) 
      // on the employeeId field. We will revisit this and implement a safer pattern 
      // (like a retry loop or Redis increment) after MVP frontend integration.
      const lastEmployee = await tx.employee.findFirst({
        orderBy: { createdAt: "desc" },
        select: { employeeId: true },
      });

      let nextIdNumber = 1;
      if (lastEmployee && lastEmployee.employeeId.startsWith("EMP-")) {
        const lastIdNumStr = lastEmployee.employeeId.replace("EMP-", "");
        const lastIdNum = parseInt(lastIdNumStr, 10);
        if (!isNaN(lastIdNum)) {
          nextIdNumber = lastIdNum + 1;
        }
      }

      const employeeId = `EMP-${nextIdNumber.toString().padStart(4, "0")}`;

      // 3. Create the employee record
      const employee = await tx.employee.create({
        data: {
          employeeId,
          ...dto,
        },
      });

      return employee;
    });
  }

  async getEmployees(params: PaginationParams): Promise<PaginatedResult<Employee>> {
    const { skip, take, page, limit } = getPaginationOptions(params);

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.employee.count(),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async getEmployeeById(id: string): Promise<Employee> {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found.`);
    }

    return employee;
  }

  async updateEmployee(id: string, dto: UpdateEmployeeDto): Promise<Employee> {
    // Verify the employee exists
    const employee = await this.getEmployeeById(id);

    // If updating designation or department, ensure they match
    if (dto.designationId !== undefined || dto.departmentId !== undefined) {
      const targetDesignationId = dto.designationId !== undefined ? dto.designationId : employee.designationId;
      const targetDepartmentId = dto.departmentId !== undefined ? dto.departmentId : employee.departmentId;

      if (targetDesignationId) {
        const designation = await this.prisma.designation.findUnique({
          where: { id: targetDesignationId }
        });
        if (!designation) {
          throw new NotFoundException(`Designation with ID ${targetDesignationId} not found.`);
        }
        if (designation.departmentId !== targetDepartmentId) {
          throw new ConflictException("The selected designation does not belong to the selected department.");
        }
      }
    }

    // If updating official email, check uniqueness
    if (dto.officialEmail) {
      const existingEmail = await this.prisma.employee.findUnique({
        where: { officialEmail: dto.officialEmail },
      });

      if (existingEmail && existingEmail.id !== id) {
        throw new ConflictException("An employee with this official email already exists.");
      }
    }

    const updatedEmployee = await this.prisma.employee.update({
      where: { id },
      data: dto,
    });

    return updatedEmployee;
  }
}
