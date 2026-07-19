import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSuccessionPlanDto, UpdateSuccessionPlanDto } from '@naprocs/types';
import { SuccessionPlan } from '@naprocs/database';
import { RbacRoles } from '../../common/rbac/rbac.config';

@Injectable()
export class SuccessionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.successionPlan.findMany({
      include: {
        incumbent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
            designation: { select: { title: true } }
          }
        },
        successor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
            designation: { select: { title: true } }
          }
        }
      },
      orderBy: { roleTitle: 'asc' }
    });
  }

  async create(data: CreateSuccessionPlanDto): Promise<SuccessionPlan> {
    return this.prisma.successionPlan.create({
      data: {
        roleTitle: data.roleTitle,
        incumbentId: data.incumbentId,
        successorId: data.successorId,
        readinessLevel: data.readinessLevel,
        gapAnalysis: data.gapAnalysis,
        developmentPlan: data.developmentPlan,
      },
      include: {
        incumbent: true,
        successor: true,
      }
    });
  }

  async update(id: string, data: UpdateSuccessionPlanDto): Promise<SuccessionPlan> {
    const plan = await this.prisma.successionPlan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`Succession plan with id ${id} not found`);
    }

    return this.prisma.successionPlan.update({
      where: { id },
      data,
      include: {
        incumbent: true,
        successor: true,
      }
    });
  }

  async remove(id: string) {
    const plan = await this.prisma.successionPlan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`Succession plan with id ${id} not found`);
    }
    
    return this.prisma.successionPlan.delete({ where: { id } });
  }

  async transferCEO(newCeoEmployeeId: string, currentUserId: string) {
    const currentCeo = await this.prisma.user.findFirst({ where: { role: RbacRoles.CEO } });
    if (!currentCeo || currentCeo.employeeId !== currentUserId) {
      throw new BadRequestException('Only the current CEO can initiate succession transfer');
    }

    const newCeo = await this.prisma.employee.findUnique({ where: { id: newCeoEmployeeId } });
    if (!newCeo) {
      throw new NotFoundException('New CEO employee record not found');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Revoke all active sessions of outgoing CEO
      await tx.session.updateMany({
        where: { userId: currentCeo.id, isActive: true },
        data: { isActive: false, revokedAt: new Date() }
      });

      // 2. Reassign pending Leaves and Tasks
      await tx.task.updateMany({
        where: { assigneeId: currentUserId },
        data: { assigneeId: newCeoEmployeeId }
      });

      await tx.leaveRequest.updateMany({
        where: { approverId: currentUserId, status: 'PENDING' },
        data: { approverId: newCeoEmployeeId }
      });

      await tx.meetRequest.updateMany({
        where: { assigneeId: currentUserId },
        data: { assigneeId: newCeoEmployeeId }
      });

      // 3. Swap Roles
      await tx.user.update({
        where: { employeeId: currentUserId },
        data: { role: RbacRoles.EMPLOYEE }
      });

      await tx.user.update({
        where: { employeeId: newCeoEmployeeId },
        data: { role: RbacRoles.CEO }
      });

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          action: 'CEO_SUCCESSION_TRANSFER',
          actorId: currentUserId,
          resource: 'Organization',
          resourceId: 'Global',
          requestId: `tx-${Date.now()}`,
          oldValue: { previousCeo: currentUserId },
          newValue: { newCeo: newCeoEmployeeId },
        }
      });

      return { success: true, message: 'CEO Role transferred successfully' };
    });
  }
}