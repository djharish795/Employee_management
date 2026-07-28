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
      orderBy: { createdAt: 'desc' }
    });
  }

  async getSummaryMetrics() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [todayCount, missedCount, completedCount] = await Promise.all([
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
        where: { status: 'Completed' }
      })
    ]);

    return {
      todayCount,
      missedCount,
      completedCount
    };
  }

}
