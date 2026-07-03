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
      data: {
        status,
        ...(eventId && { eventId }),
        ...(meetLink && { meetLink })
      },
      include: {
        participants: { include: { employee: true } },
        requester: true,
        assignee: true,
      }
    });
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

  async getBusySlots(employeeId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

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
    let settings = await this.prisma.connectSettings.findUnique({
      where: { employeeId }
    });
    if (!settings) {
      settings = await this.prisma.connectSettings.create({
        data: { employeeId }
      });
    }
    return settings;
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
