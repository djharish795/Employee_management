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
    
    // Only return meetings associated with a CEM lead
    where.cemLeadId = { not: null };

    return this.prisma.meeting.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }
}
