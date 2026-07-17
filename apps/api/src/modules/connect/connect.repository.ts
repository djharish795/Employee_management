import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma, MeetStatus } from "@naprocs/database";

@Injectable()
export class ConnectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMeetRequest(data: Prisma.MeetRequestUncheckedCreateInput, participantIds: string[]) {
    return this.prisma.meetRequest.create({
      data: {
        ...data,
        participants: {
          create: participantIds.map(id => ({
            employeeId: id,
          }))
        }
      },
      include: {
        participants: { include: { employee: true } },
        requester: true,
        assignee: true,
      }
    });
  }

  async getMeetRequestById(id: string) {
    return this.prisma.meetRequest.findUnique({
      where: { id },
      include: {
        participants: { include: { employee: true } },
        requester: true,
        assignee: true,
      }
    });
  }

  async updateMeetStatus(id: string, status: MeetStatus, eventId?: string, meetLink?: string) {
    return this.prisma.meetRequest.update({
      where: { id },
      data: { status, eventId, meetLink },
      include: { requester: true, participants: { include: { employee: true } } }
    });
  }

  async getQuickContacts(employeeId: string) {
    // 1. Get user to find manager
    const me = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      select: { reportingManagerId: true }
    });

    const contactIds = new Set<string>();

    if (me?.reportingManagerId) {
      contactIds.add(me.reportingManagerId);
    }

    // 2. Get direct reports
    const reports = await this.prisma.employee.findMany({
      where: { reportingManagerId: employeeId, status: "ACTIVE" },
      select: { id: true },
      take: 3
    });
    reports.forEach(r => contactIds.add(r.id));

    // 3. Get recent meeting participants if we need more
    if (contactIds.size < 4) {
      const recentMeets = await this.prisma.meetRequest.findMany({
        where: {
          OR: [
            { requesterId: employeeId },
            { participants: { some: { employeeId: employeeId } } }
          ]
        },
        orderBy: { startTime: 'desc' },
        take: 10,
        include: {
          requester: { select: { id: true } },
          participants: { select: { employeeId: true } }
        }
      });

      for (const meet of recentMeets) {
        if (meet.requesterId !== employeeId) contactIds.add(meet.requesterId);
        for (const p of meet.participants) {
          if (p.employeeId !== employeeId) contactIds.add(p.employeeId);
        }
        if (contactIds.size >= 4) break;
      }
    }

    // Now fetch the actual employee profiles
    const contacts = await this.prisma.employee.findMany({
      where: { id: { in: Array.from(contactIds).slice(0, 4) } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        photoUrl: true,
        designation: { select: { title: true } },
        department: { select: { name: true } }
      }
    });

    return contacts;
  }

  async updateWorkspace(id: string, agenda: any, actionItems: any) {
    return this.prisma.meetRequest.update({
      where: { id },
      data: { agenda, actionItems } as any, // Cast to any because Prisma generate failed due to VPN restrictions
      include: {
        participants: { include: { employee: true } },
        requester: true,
        assignee: true,
      }
    } as any);
  }

  async updateMeetTime(id: string, startTime: string, endTime: string) {
    return this.prisma.meetRequest.update({
      where: { id },
      data: {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: MeetStatus.RESCHEDULED
      },
      include: {
        participants: { include: { employee: true } },
        requester: true,
        assignee: true,
      }
    });
  }

  async getMyMeetings(employeeId: string) {
    return this.prisma.meetRequest.findMany({
      where: {
        OR: [
          { requesterId: employeeId },
          { assigneeId: employeeId },
          { participants: { some: { employeeId } } }
        ]
      },
      include: {
        requester: true,
        assignee: true,
      },
      orderBy: { startTime: 'asc' }
    });
  }

  async getMyGoals(employeeId: string): Promise<any> {
    return (this.prisma as any).goal?.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' }
    }) || [];
  }

  async getBusySlots(employeeId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    return this.prisma.meetRequest.findMany({
      where: {
        status: { in: [MeetStatus.ACCEPTED, MeetStatus.PENDING, MeetStatus.RESCHEDULED] },
        startTime: { gte: startOfDay },
        endTime: { lte: endOfDay },
        OR: [
          { assigneeId: employeeId },
          { requesterId: employeeId },
          { participants: { some: { employeeId } } }
        ]
      },
      select: {
        startTime: true,
        endTime: true,
      }
    });
  }

  async getSettings(employeeId: string) {
    return this.prisma.connectSettings.upsert({
      where: { employeeId },
      update: {},
      create: { employeeId }
    });
  }

  async updateSettings(employeeId: string, data: Prisma.ConnectSettingsUpdateInput) {
    return this.prisma.connectSettings.upsert({
      where: { employeeId },
      update: data,
      create: {
        employeeId,
        ...(data as any)
      }
    });
  }
}
