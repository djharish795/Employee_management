import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MeetingService {
  constructor(private prisma: PrismaService) {}

  async getMeetings(filters: { status?: string; type?: string; employee?: string; date?: string }) {
    const where: any = {};
    if (filters.status && filters.status !== 'All') where.status = filters.status;
    if (filters.type && filters.type !== 'All') where.type = filters.type;
    if (filters.employee && filters.employee !== 'All') where.assignedEmployee = filters.employee;
    if (filters.date) where.date = filters.date;

    return this.prisma.meeting.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  async createMeeting(data: any, actorId: string) {
    const previousMeetings = await this.prisma.meeting.count({
      where: { leadId: data.leadId }
    });

    return this.prisma.meeting.create({
      data: {
        client: data.client,
        leadId: data.leadId,
        leadName: data.leadName,
        date: data.date,
        time: data.time,
        type: data.type,
        assignedEmployee: data.assignedEmployee,
        status: data.status || 'SCHEDULED',
        clientPhone: data.clientPhone,
        interactionCount: previousMeetings + 1
      }
    });
  }

  async updateMeeting(id: string, data: any, actorId: string) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id } });
    if (!meeting) throw new NotFoundException('Meeting not found');

    return this.prisma.meeting.update({
      where: { id },
      data: {
        status: data.status,
        outcome: data.outcome,
        nextAction: data.nextAction,
        nextFollowUpDate: data.nextFollowUpDate,
        nextActionOwner: data.nextActionOwner,
        notes: data.notes,
        requirements: data.requirements,
        concerns: data.concerns,
        decisionMakers: data.decisionMakers,
        handoffCompleted: data.handoffCompleted,
        date: data.date,
        time: data.time
      }
    });
  }

  async deleteMeeting(id: string, actorId: string) {
    return this.prisma.meeting.delete({ where: { id } });
  }
}
