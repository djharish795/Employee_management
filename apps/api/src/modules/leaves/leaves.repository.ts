import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class LeavesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async applyLeave(data: any): Promise<any> {
    const employee = await this.prisma.employee.findUnique({
      where: {
        employeeId: data.employeeId,
      },
    });

    if (!employee) {
      throw new NotFoundException("Employee not found");
    }

    const leaveType = await this.prisma.leaveType.findUnique({
      where: {
        code: data.leaveTypeId,
      },
    });

    if (!leaveType) {
      throw new NotFoundException("Leave type not found");
    }

    return this.prisma.leaveRequest.create({
      data: {
        employeeId: employee.id,
        leaveTypeId: leaveType.id,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
        totalDays: data.totalDays,
      },
    });
  }
}
