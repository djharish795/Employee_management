import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSuccessionPlanDto, UpdateSuccessionPlanDto } from '@naprocs/types';
import { SuccessionPlan } from '@naprocs/database';

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
}