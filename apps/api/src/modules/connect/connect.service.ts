import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Logger } from "@nestjs/common";
import { ConnectRepository } from "./connect.repository";
import { ZoomService } from "./zoom.service";
import { EmailService } from "../notifications/email.service";
import { CreateMeetRequestDto } from "./dto/create-meet-request.dto";
import { RescheduleMeetDto } from "./dto/reschedule-meet.dto";
import { MeetStatus, MeetType, TaskStatus } from "@naprocs/database";
import { PrismaService } from "../../prisma/prisma.service";
import { TasksService } from "../tasks/tasks.service";
import { RbacRoles } from "../../common/rbac/rbac.config";

@Injectable()
export class ConnectService {
  private readonly logger = new Logger(ConnectService.name);

  constructor(
    private readonly repository: ConnectRepository,
    private readonly zoomService: ZoomService,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
    private readonly tasksService: TasksService,
  ) { }

  async createMeetRequest(requesterId: string, dto: CreateMeetRequestDto): Promise<any> {
    let participantIds: string[] = [];

    // Fetch requester for email
    const requester = await this.prisma.employee.findUnique({ where: { id: requesterId } });
    if (!requester) throw new NotFoundException("Requester not found");

    if (dto.type === MeetType.DEPARTMENT) {
      if (!dto.departmentId) throw new BadRequestException("DepartmentId required for department meets");
      const deptEmployees = await this.prisma.employee.findMany({ where: { departmentId: dto.departmentId } });
      participantIds = deptEmployees.map(e => e.id);
    } else {
      if (!dto.assigneeId) throw new BadRequestException("AssigneeId required for 1-on-1 meets");
      
      const existing = await this.prisma.meetRequest.findFirst({
        where: {
          requesterId,
          assigneeId: dto.assigneeId,
          status: { in: [MeetStatus.PENDING, MeetStatus.RESCHEDULED] }
        }
      });
      if (existing) throw new BadRequestException('A pending meet request with this employee already exists.');

      participantIds = [dto.assigneeId];
    }

    const meet = await this.repository.createMeetRequest({
      title: dto.title,
      description: dto.description,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
      type: dto.type,
      requesterId,
      assigneeId: dto.assigneeId,
      departmentId: dto.departmentId,
      status: MeetStatus.PENDING,
      linkedGoalId: dto.linkedGoalId,
    }, participantIds);

    // Send emails and system notifications to participants/assignee
    for (const participant of meet.participants) {
      await this.notifyParticipant(
        participant.employee.id,
        `New Meet Request: ${meet.title}`,
        `${requester.firstName} has requested a new meeting with you.`,
        participant.employee.officialEmail,
        "meet-request",
        { meet, requester: requester.firstName }
      );
    }

    return meet;
  }

  async acceptMeetRequest(id: string, employeeId: string): Promise<any> {
    const meet = await this.repository.getMeetRequestById(id);
    if (!meet) throw new NotFoundException("Meet not found");
    if (meet.status !== MeetStatus.PENDING && meet.status !== MeetStatus.RESCHEDULED) {
      throw new BadRequestException("Can only accept pending or rescheduled meets");
    }

    // Check if user is allowed to accept (must be assignee, or a participant)
    if (meet.assigneeId !== employeeId && !meet.participants.some(p => p.employeeId === employeeId)) {
      throw new ForbiddenException("You are not authorized to accept this meet");
    }

    const { eventId, meetLink } = await this.zoomService.createMeetEvent(
      meet.title,
      meet.description || "",
      meet.startTime,
      meet.endTime
    );

    const updatedMeet = await this.repository.updateMeetStatus(id, MeetStatus.ACCEPTED, eventId, meetLink);

    // Send Accepted emails and system notifications
    const allParticipants = [meet.requester, ...meet.participants.map(p => p.employee)];
    for (const p of allParticipants) {
      if (p.id !== employeeId) {
        await this.notifyParticipant(
          p.id,
          `Meet Confirmed: ${meet.title}`,
          `Your meeting has been accepted and a Zoom link is generated.`,
          p.officialEmail,
          "meet-accepted",
          { meet: updatedMeet, meetLink }
        );
      }
    }

    return updatedMeet;
  }

  async rescheduleMeet(id: string, employeeId: string, dto: RescheduleMeetDto): Promise<any> {
    const meet = await this.repository.getMeetRequestById(id);
    if (!meet) throw new NotFoundException("Meet not found");

    if (meet.type === MeetType.DEPARTMENT && meet.requesterId !== employeeId) {
      throw new ForbiddenException("Only the requester can reschedule a department meet");
    }

    const isRequester = meet.requesterId === employeeId;

    const updatedMeet = await this.repository.updateMeetTime(id, dto.startTime, dto.endTime);

    // If there was an existing event, we could patch it, but actually the requirement says: 
    // "a mail must be shared informing the meet it shifted ... if okay then with the same meet link"
    // So if accepted, we update the event. If not, it just updates the proposal.
    if (meet.eventId) {
      await this.zoomService.updateMeetEvent(meet.eventId, updatedMeet.startTime, updatedMeet.endTime);
    }

    // Send reschedule emails and system notifications to the other party
    const notifyEmployees = isRequester
      ? meet.participants.map(p => p.employee)
      : [meet.requester];

    for (const p of notifyEmployees) {
      await this.notifyParticipant(
        p.id,
        `Meet Rescheduled: ${meet.title}`,
        `The meeting time has been rescheduled.`,
        p.officialEmail,
        "meet-rescheduled",
        { meet: updatedMeet }
      );
    }

    return updatedMeet;
  }

  async rejectMeet(id: string, employeeId: string): Promise<any> {
    const meet = await this.repository.getMeetRequestById(id);
    if (!meet) throw new NotFoundException("Meet not found");

    if (meet.type === MeetType.DEPARTMENT && meet.requesterId !== employeeId) {
      throw new ForbiddenException("Only the requester can cancel a department meet");
    }

    const updatedMeet = await this.repository.updateMeetStatus(id, MeetStatus.REJECTED);

    if (meet.eventId) {
      await this.zoomService.cancelMeetEvent(meet.eventId);
    }

    const allParticipants = [meet.requester, ...meet.participants.map(p => p.employee)];
    const rejecter = meet.requesterId === employeeId ? meet.requester : meet.participants.find(p => p.employeeId === employeeId)?.employee;

    for (const p of allParticipants) {
      if (p.id !== employeeId) {
        await this.notifyParticipant(
          p.id,
          `Meet Cancelled: ${meet.title}`,
          `${rejecter?.firstName || "Someone"} has cancelled the meeting.`,
          p.officialEmail,
          "meet-rejected",
          { meet: updatedMeet, rejecterName: rejecter?.firstName || "Someone" }
        );
      }
    }

    return updatedMeet;
  }

  async getMyMeetings(employeeId: string): Promise<any> {
    return this.repository.getMyMeetings(employeeId);
  }

  async getMyGoals(employeeId: string): Promise<any> {
    return this.repository.getMyGoals(employeeId);
  }

  async getAvailability(employeeId: string, dateStr: string) {
    const targetDate = new Date(dateStr);
    const busySlots = await this.repository.getBusySlots(employeeId, targetDate);
    const settings = await this.repository.getSettings(employeeId);
    return { busySlots, settings };
  }

  async updateWorkspace(id: string, employeeId: string, agenda: any, actionItems: any): Promise<any> {
    const meet = await this.repository.getMeetRequestById(id);
    if (!meet) throw new NotFoundException("Meet not found");

    // Check if user is allowed to update (requester or participant)
    const isParticipant = meet.requesterId === employeeId || meet.participants.some(p => p.employeeId === employeeId);
    if (!isParticipant) {
      throw new ForbiddenException("You are not authorized to update this workspace");
    }

    // Sync action items to tasks
    if (Array.isArray(actionItems)) {
      for (const item of actionItems) {
        if (!item.taskId) {
          // It's a new action item, create it in Tasks table
          const task = await this.tasksService.createTask({ employeeId, role: 'TEAM_LEAD' }, {
            title: item.text,
            description: `From meeting: ${meet.title}`,
            status: item.completed ? TaskStatus.DONE : TaskStatus.TODO,
            assigneeId: employeeId, // Assigning to self by default for 1-on-1s
          });
          item.taskId = task.id; // Save reference back to the JSON
        } else {
          // Update existing task status
          await this.tasksService.updateTask(item.taskId, { id: 'SYSTEM', role: RbacRoles.SUPER_ADMIN }, { status: item.completed ? TaskStatus.DONE : TaskStatus.TODO });
        }
      }
    }

    return this.repository.updateWorkspace(id, agenda, actionItems);
  }

  async getSettings(employeeId: string) {
    return this.repository.getSettings(employeeId);
  }

  async updateSettings(employeeId: string, dto: any) {
    return this.repository.updateSettings(employeeId, dto);
  }

  private async notifyParticipant(employeeId: string, title: string, body: string, email: string | null, template: string, context: any) {
    // 1. Send Email if email exists
    if (email) {
      await this.emailService.sendEmail(email, title, template, context).catch((e: any) => {
        this.logger.error(`Email error sending meet link to ${email}:`, e.stack || e);
      });
    }

    // 2. Send System Notification
    try {
      const settings = await this.repository.getSettings(employeeId);
      if (settings.systemNotifications) {
        await this.prisma.notification.create({
          data: {
            recipientId: employeeId,
            title,
            body,
            type: "GENERAL" // Using Prisma Enum value directly as string representation or imported Enum
          }
        });
      }
    } catch (e: any) {
      this.logger.error(`Failed to send system notification to ${employeeId}:`, e.stack || e);
    }
  }

  async getNotes(meetId: string, employeeId: string): Promise<any> {
    const meet: any = await this.repository.getMeetRequestById(meetId);
    if (!meet) throw new NotFoundException("Meet not found");

    const isParticipant = meet.requesterId === employeeId || meet.participants.some((p: any) => p.employeeId === employeeId);
    if (!isParticipant) throw new ForbiddenException("Only participants can view notes");

    return (this.prisma as any).meetNote.findMany({
      where: { meetRequestId: meetId },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
        comments: {
          include: { author: { select: { id: true, firstName: true, lastName: true, photoUrl: true } } },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  async upsertNote(meetId: string, employeeId: string, content: string): Promise<any> {
    const meet: any = await this.repository.getMeetRequestById(meetId);
    if (!meet) throw new NotFoundException("Meet not found");

    const isParticipant = meet.requesterId === employeeId || meet.participants.some((p: any) => p.employeeId === employeeId);
    if (!isParticipant) throw new ForbiddenException("Only participants can create notes");

    // Check if the user already has a note for this meeting
    const existing = await (this.prisma as any).meetNote.findFirst({
      where: { meetRequestId: meetId, authorId: employeeId }
    });

    if (existing) {
      return (this.prisma as any).meetNote.update({
        where: { id: existing.id },
        data: { content },
        include: {
          author: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
          comments: { include: { author: { select: { id: true, firstName: true, lastName: true, photoUrl: true } } } }
        }
      });
    }

    return (this.prisma as any).meetNote.create({
      data: {
        meetRequestId: meetId,
        authorId: employeeId,
        content
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
        comments: true
      }
    });
  }

  async addNoteComment(noteId: string, employeeId: string, content: string): Promise<any> {
    const note: any = await (this.prisma as any).meetNote.findUnique({
      where: { id: noteId },
      include: { meetRequest: { include: { participants: true } } }
    });
    
    if (!note) throw new NotFoundException("Note not found");

    const meet = note.meetRequest;
    const isParticipant = meet.requesterId === employeeId || meet.participants.some((p: any) => p.employeeId === employeeId);
    if (!isParticipant) throw new ForbiddenException("Only participants can comment on notes");

    return (this.prisma as any).meetNoteComment.create({
      data: {
        noteId,
        authorId: employeeId,
        content
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, photoUrl: true } }
      }
    });
  }
}
