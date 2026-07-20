import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { AuditService } from "../audit/audit.service";
import { CrmRepository } from "./crm.repository";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { CreateRequirementDto } from "./dto/create-requirement.dto";
import { UpdateRequirementDto } from "./dto/update-requirement.dto";
import { CreateMeetingDto } from "./dto/create-meeting.dto";
import { ZoomService } from "../connect/zoom.service";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class CrmService {
  private readonly logger = new Logger(CrmService.name);

  constructor(
    private readonly repository: CrmRepository,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationsService,
    private readonly zoomService: ZoomService
  ) {}

  async getClients() {
    const data = await this.repository.findAllClients();
    return { data };
  }

  async getIncomingClients() {
    const data = await this.repository.findAllIncoming();
    return { data };
  }

  async createClient(dto: CreateClientDto, actorId?: string) {
    this.logger.log(`Creating client for company: ${dto.company}`);
    const created = await this.repository.createClient(dto);
    await this.auditService.logCreate({
      moduleName: "CRM_CLIENT",
      entityId: created.id,
      actorId,
      metadata: created,
    });
    return { success: true, data: created };
  }

  async acceptClient(id: string, actorId?: string) {
    const accepted = await this.repository.acceptHandoff(id);
    if (!accepted) {
      throw new NotFoundException(`Incoming client handoff ${id} not found`);
    }
    await this.auditService.logUpdate({
      moduleName: "CRM_CLIENT",
      entityId: id,
      actorId,
      newValue: { status: "ACCEPTED", client: accepted },
    });
    return { success: true, data: accepted };
  }

  async clarifyClient(id: string, actorId?: string) {
    const ok = await this.repository.clarifyHandoff(id);
    if (!ok) {
      throw new NotFoundException(`Incoming client handoff ${id} not found`);
    }
    await this.auditService.logUpdate({
      moduleName: "CRM_CLIENT",
      entityId: id,
      actorId,
      newValue: { status: "CLARIFICATION_REQUESTED" },
    });
    return { success: true, id };
  }

  async rejectClient(id: string, actorId?: string) {
    const ok = await this.repository.rejectHandoff(id);
    if (!ok) {
      throw new NotFoundException(`Incoming client handoff ${id} not found`);
    }
    await this.auditService.logUpdate({
      moduleName: "CRM_CLIENT",
      entityId: id,
      actorId,
      newValue: { status: "REJECTED" },
    });
    return { success: true, id };
  }

  async updateClientStage(id: string, stage: number, actorId?: string) {
    const updated = await this.repository.updateClientStage(id, stage);
    if (!updated) {
      throw new NotFoundException(`Client ${id} not found`);
    }
    await this.auditService.logUpdate({
      moduleName: "CRM_CLIENT",
      entityId: id,
      actorId,
      newValue: { stage },
    });
    return { success: true, data: updated };
  }

  async updateClientHealth(id: string, health: string, actorId?: string) {
    const updated = await this.repository.updateClientHealth(id, health);
    if (!updated) {
      throw new NotFoundException(`Client ${id} not found`);
    }
    await this.auditService.logUpdate({
      moduleName: "CRM_CLIENT",
      entityId: id,
      actorId,
      newValue: { health },
    });
    return { success: true, data: updated };
  }

  async closeDeal(id: string, actorId?: string) {
    const updated = await this.repository.updateClientStage(id, 7);
    if (!updated) {
      throw new NotFoundException(`Client ${id} not found`);
    }
    await this.repository.updateClientHealth(id, "CLOSED WON");
    
    await this.auditService.logUpdate({
      moduleName: "CRM_CLIENT",
      entityId: id,
      actorId,
      newValue: { stage: 7, health: "CLOSED WON", status: "Closed Deal" },
    });
    return { success: true, data: updated };
  }

  async addClientNote(id: string, note: string, actorId?: string) {
    const updated = await this.repository.addClientNote(id, note);
    if (!updated) {
      throw new NotFoundException(`Client ${id} not found`);
    }
    return { success: true, data: updated };
  }

  async addClientCall(id: string, call: string, actorId?: string) {
    const updated = await this.repository.addClientCall(id, call);
    if (!updated) {
      throw new NotFoundException(`Client ${id} not found`);
    }
    return { success: true, data: updated };
  }

  async addClientRequirement(id: string, item: any, actorId?: string) {
    const updated = await this.repository.addClientRequirement(id, item);
    if (!updated) {
      throw new NotFoundException(`Client ${id} not found`);
    }
    return { success: true, data: updated };
  }

  async updateClientRequirementStatus(clientId: string, reqId: string, status: string, actorId?: string) {
    const updated = await this.repository.updateClientRequirementStatus(clientId, reqId, status);
    if (!updated) {
      throw new NotFoundException(`Client ${clientId} or requirement ${reqId} not found`);
    }
    await this.auditService.logUpdate({
      moduleName: "CRM_CLIENT",
      entityId: clientId,
      actorId,
      newValue: { updatedRequirementId: reqId, status },
    });
    return { success: true, data: updated };
  }

  async addClientChangeRequest(id: string, item: any, actorId?: string) {
    const updated = await this.repository.addClientChangeRequest(id, item);
    if (!updated) {
      throw new NotFoundException(`Client ${id} not found`);
    }
    return { success: true, data: updated };
  }

  async updateClientChangeRequestStatus(clientId: string, crId: string, status: string, actorId?: string) {
    const updated = await this.repository.updateClientChangeRequestStatus(clientId, crId, status);
    if (!updated) {
      throw new NotFoundException(`Client ${clientId} or change request ${crId} not found`);
    }
    await this.auditService.logUpdate({
      moduleName: "CRM_CLIENT",
      entityId: clientId,
      actorId,
      newValue: { updatedChangeRequestId: crId, status },
    });
    return { success: true, data: updated };
  }

  async addClientAttachment(id: string, attachment: string, actorId?: string) {
    const updated = await this.repository.addClientAttachment(id, attachment);
    if (!updated) {
      throw new NotFoundException(`Client ${id} not found`);
    }
    await this.auditService.logUpdate({
      moduleName: "CRM_CLIENT",
      entityId: id,
      actorId,
      newValue: { newAttachment: attachment },
    });
    return { success: true, data: updated };
  }

  async getRequirements() {
    const data = await this.repository.findAllRequirements();
    return { data };
  }

  async createRequirement(dto: CreateRequirementDto, actorId?: string) {
    const created = await this.repository.createRequirement(dto);
    await this.auditService.logCreate({
      moduleName: "CRM_REQUIREMENT",
      entityId: created.id,
      actorId,
      metadata: created,
    });
    return { success: true, data: created };
  }

  async updateRequirement(id: string, dto: UpdateRequirementDto, actorId?: string) {
    const updated = await this.repository.updateRequirement(id, dto);
    if (!updated) {
      throw new NotFoundException(`Requirement ${id} not found`);
    }
    await this.auditService.logUpdate({
      moduleName: "CRM_REQUIREMENT",
      entityId: id,
      actorId,
      newValue: dto,
    });
    return { success: true, data: updated };
  }

  async updateRequirementStatus(id: string, status: string, actorId?: string) {
    const updated = await this.repository.updateRequirementStatus(id, status);
    if (!updated) {
      throw new NotFoundException(`Requirement ${id} not found`);
    }
    await this.auditService.logUpdate({
      moduleName: "CRM_REQUIREMENT",
      entityId: id,
      actorId,
      newValue: { status },
    });
    return { success: true, data: updated };
  }

  async deleteRequirement(id: string, actorId?: string) {
    const ok = await this.repository.deleteRequirement(id);
    if (!ok) {
      throw new NotFoundException(`Requirement ${id} not found`);
    }
    await this.auditService.logDelete({
      moduleName: "CRM_REQUIREMENT",
      entityId: id,
      actorId,
    });
    return { success: true, id };
  }

  async transferToCrm(id: string, actorId?: string) {
    const transferred = await this.repository.transferToCrm(id);
    if (!transferred) {
      throw new NotFoundException(`Client ${id} not found`);
    }
    await this.auditService.logUpdate({
      moduleName: "CRM_CLIENT",
      entityId: id,
      actorId,
      newValue: { stage: 6, assignedCem: "CRM Team", status: "TRANSFERRED_TO_CRM" },
    });
    return { success: true, data: transferred };
  }

  async getRecentActivity() {
    const data = await this.repository.getRecentActivity();
    return { data };
  }

  async getPipelineSummary() {
    const data = await this.repository.getPipelineSummary();
    return { data };
  }

  async getLeadActivityReport() {
    const data = await this.repository.getLeadActivityReport();
    return { data };
  }

  // CRM Meetings
  async getAllMeetings() {
    return this.repository.getAllMeetings();
  }

  async getClientMeetings(leadId: string) {
    return this.repository.getClientMeetings(leadId);
  }

  async createMeeting(dto: CreateMeetingDto, actorId: string) {
    // Generate Zoom link
    let zoomLink = '';
    try {
      // Parse the dto.date and dto.time properly for zoom start time
      // The frontend now needs to send it in a way we can parse, or we just combine them:
      // Note: Time might be AM/PM or 24-hr. We'll handle it carefully later, but for now:
      // In JS, new Date("YYYY-MM-DD hh:mm AM/PM") works in many browsers, but best to stick to standard parsing if needed.
      // Wait, the frontend is currently sending 24h format (e.g. 23:30) as requested by the original code. 
      // If the user changes it to AM/PM, we need to handle that.
      
      const startTime = new Date(`${dto.date}T${dto.time}:00`);
      const validStartTime = isNaN(startTime.getTime()) ? new Date() : startTime;
      const endTime = new Date(validStartTime.getTime() + 45 * 60000);
      
      const zoomDetails = await this.zoomService.createMeetEvent(
        `Meeting with ${dto.leadName} (${dto.client}) - ${dto.type}`,
        dto.notes || 'No agenda provided',
        validStartTime,
        endTime
      );
      zoomLink = zoomDetails.meetLink;
    } catch (err) {
      this.logger.error(`Failed to generate zoom link`, err);
      this.auditService.logUpdate({
        moduleName: "CRM",
        entityId: dto.leadId,
        actorId,
        metadata: { action: "ZOOM_ERROR", details: "Failed to generate Zoom link for CRM meeting" },
      });
    }

    const meetingData = {
      ...dto,
      assignedEmployee: actorId,
      notes: zoomLink ? `${dto.notes || ''}\n\nZoom Link: ${zoomLink}` : dto.notes
    };

    const meeting = await this.repository.createMeeting(meetingData);

    this.auditService.logCreate({
      moduleName: "CRM",
      entityId: meeting.id,
      actorId,
      metadata: { action: "SCHEDULE_MEETING", client: dto.client },
    });

    return meeting;
  }
}

