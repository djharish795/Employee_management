import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WfhService {
  constructor(private prisma: PrismaService) { }

  async applyWfh(employeeId: string, date: string, reason: string): Promise<any> {
    const employee = await this.prisma.employee.findUnique({
      where: { employeeId },
      include: { projectAssignments: true }
    });

    if (!employee) throw new NotFoundException('Employee not found');

    const targetDate = new Date(date);
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

    // 1. Employee limit: Max 1 WFH per month
    const employeeWfhCount = await this.prisma.workFromHomeRequest.count({
      where: {
        employeeId: employee.id,
        status: { in: ['APPROVED', 'PENDING'] },
        date: { gte: startOfMonth, lte: endOfMonth }
      }
    });

    if (employeeWfhCount >= 1) {
      throw new BadRequestException('You can only avail a maximum of 1 Work From Home day per month.');
    }

    // 2. Project limit: Max 3 WFH per team/project per month
    // Find project IDs for this employee
    const projectIds = employee.projectAssignments.map(p => p.projectId);

    if (projectIds.length > 0) {
      for (const pid of projectIds) {
        const projectAssignments = await this.prisma.projectAssignment.findMany({
          where: { projectId: pid },
          select: { employeeId: true }
        });

        const teamMemberIds = projectAssignments.map(pa => pa.employeeId);

        const projectWfhCount = await this.prisma.workFromHomeRequest.count({
          where: {
            employeeId: { in: teamMemberIds },
            status: { in: ['APPROVED', 'PENDING'] },
            date: { gte: startOfMonth, lte: endOfMonth }
          }
        });

        if (projectWfhCount >= 3) {
          throw new BadRequestException('Your project team has already reached the maximum of 3 Work From Home days this month.');
        }
      }
    }

    // Create the request
    const approvalQueue = [
      { role: 'TR', status: 'PENDING' },
      { role: 'HR', status: 'PENDING' }
    ];

    return this.prisma.workFromHomeRequest.create({
      data: {
        employeeId: employee.id,
        date: targetDate,
        reason,
        status: 'PENDING',
        approvalQueue: approvalQueue as any,
        currentStep: 0
      }
    });
  }
}
