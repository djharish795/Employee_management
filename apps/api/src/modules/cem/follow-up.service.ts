import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { UpdateFollowUpOutcomeDto } from './dto/update-follow-up-outcome.dto';

@Injectable()
export class FollowUpService {
  constructor(private prisma: PrismaService) {}

  async getFollowUps(filters: { status?: string; stage?: string }) {
    const where: any = {};
    if (filters.status && filters.status !== 'All') where.status = filters.status;
    if (filters.stage && filters.stage !== 'All') where.currentStage = filters.stage;

    return this.prisma.followUp.findMany({
      where,
      orderBy: { dueDate: 'asc' }
    });
  }

  async getSummaryMetrics() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [todayCount, missedCount, qualifiedCount] = await Promise.all([
      this.prisma.followUp.count({
        where: {
          dueDate: { gte: todayStart, lte: todayEnd },
          status: { in: ['Pending', 'Qualified'] }
        }
      }),
      this.prisma.followUp.count({
        where: { status: 'Missed' }
      }),
      this.prisma.followUp.count({
        where: {
          OR: [
            { currentStage: 'Qualified' },
            { status: 'Qualified' }
          ]
        }
      })
    ]);

    return {
      todayCount,
      missedCount,
      qualifiedCount
    };
  }

  async createFollowUp(dto: CreateFollowUpDto, actorId?: string) {
    const notesHistory = dto.lastNote ? [dto.lastNote] : [];
    
    return this.prisma.followUp.create({
      data: {
        leadName: dto.leadName,
        role: dto.role,
        company: dto.company,
        email: dto.email,
        phone: dto.phone,
        currentStage: dto.currentStage,
        type: dto.type,
        nextAction: dto.nextAction,
        dueDate: new Date(dto.dueDate),
        priority: dto.priority,
        lastNote: dto.lastNote,
        assignedCem: actorId || 'System',
        notesHistory
      }
    });
  }

  async logOutcome(id: string, dto: UpdateFollowUpOutcomeDto, actorId?: string) {
    const followUp = await this.prisma.followUp.findUnique({ where: { id } });
    if (!followUp) {
      throw new NotFoundException(`Follow-up ${id} not found`);
    }

    let nextStage = followUp.currentStage;
    let nextStatus = 'Completed';

    if (dto.outcome === 'Qualified') {
      nextStage = 'Qualified';
      nextStatus = 'Qualified';
    } else if (dto.outcome === 'Needs Follow Up' || dto.outcome === 'Meeting Required') {
      nextStage = 'Follow Up';
      nextStatus = 'Pending';
    }

    const updatedNotes = dto.outcomeNote 
      ? [...followUp.notesHistory, `Outcome: ${dto.outcome} - ${dto.outcomeNote}`]
      : followUp.notesHistory;

    return this.prisma.followUp.update({
      where: { id },
      data: {
        status: nextStatus,
        outcome: dto.outcome,
        currentStage: nextStage,
        lastNote: dto.outcomeNote || `Follow-up complete. Outcome: ${dto.outcome}`,
        notesHistory: updatedNotes
      }
    });
  }
}
