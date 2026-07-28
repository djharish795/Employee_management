import { Injectable, Logger, NotFoundException, ForbiddenException } from "@nestjs/common";
import { AuditService } from "../audit/audit.service";
import { CrmRepository } from "./crm.repository";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { CreateRequirementDto } from "./dto/create-requirement.dto";
import { UpdateRequirementDto } from "./dto/update-requirement.dto";
import { CreateMeetingDto } from "./dto/create-meeting.dto";
import { ZoomService } from "../connect/zoom.service";
import { NotificationsService } from "../notifications/notifications.service";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class CrmService {
  private readonly logger = new Logger(CrmService.name);

  constructor(
    private readonly repository: CrmRepository,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationsService,
    private readonly zoomService: ZoomService,
    private readonly prisma: PrismaService
  ) {}

  private async enforceOwnership(entityId: string, actorId: string, user: any, type: 'CLIENT' | 'REQUIREMENT') {
    const isGlobalAdmin = user?.role === 'OM' || user?.role === 'SUPER_ADMIN' || user?.role === 'CEO';
    if (isGlobalAdmin || !actorId) return;
    
    if (type === 'CLIENT') {
      const client = await this.prisma.clientLead.findUnique({ where: { id: entityId } });
      if (client && client.assignedCrmId !== actorId && client.assignedCemId !== actorId) {
        throw new ForbiddenException("You do not have permission to modify this client.");
      }
    } else {
      const req = await this.prisma.requirement.findUnique({ where: { id: entityId }, include: { clientLead: true } });
      if (req && req.assignedCrmId !== actorId && req.clientLead?.assignedCrmId !== actorId) {
        throw new ForbiddenException("You do not have permission to modify this requirement.");
      }
    }
  }

  async getClients() {
    const data = await this.repository.findAllClients();
    return { data };
  }

  async getIncomingClients() {
    const data = await this.repository.findAllIncoming();
    return { data };
  }

  async createClient(dto: CreateClientDto, actorId?: string, user?: any) {
    this.logger.log(`Creating client for company: ${dto.company}`);
    // Extract assignedCemId from user if they are CEM
    let crmId = (dto as any).assignedCrm || null;
    const created = await this.repository.createClient(dto);
    if (actorId) {
      await this.prisma.clientLead.update({ where: { id: created.id }, data: { assignedCrmId: actorId } });
    }
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

  async updateClientStage(id: string, stage: number, actorId?: string, user?: any) {
    if (actorId && user) await this.enforceOwnership(id, actorId, user, 'CLIENT');
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

  async updateClientHealth(id: string, health: string, actorId?: string, user?: any) {
    if (actorId && user) await this.enforceOwnership(id, actorId, user, 'CLIENT');
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

  async addClientNote(id: string, note: string, actorId?: string, user?: any) {
    if (actorId && user) await this.enforceOwnership(id, actorId, user, 'CLIENT');
    const noteObj = { text: note, authorId: actorId, timestamp: new Date().toISOString() };
    
    // We rewrite the repository method directly here using prisma for JSON support
    const client = await this.prisma.clientLead.findUnique({ where: { id } });
    if (!client) throw new NotFoundException(`Client ${id} not found`);
    const notes = Array.isArray(client.notes) ? client.notes : [];
    notes.push(noteObj as any);
    const updated = await this.prisma.clientLead.update({ where: { id }, data: { notes } });
    
    await this.auditService.logUpdate({
      moduleName: "CRM_CLIENT",
      entityId: id,
      actorId,
      newValue: { newNote: noteObj },
    });
    return { success: true, data: updated };
  }

  async addClientCall(id: string, call: string, actorId?: string, user?: any) {
    if (actorId && user) await this.enforceOwnership(id, actorId, user, 'CLIENT');
    const callObj = { text: call, authorId: actorId, timestamp: new Date().toISOString() };
    
    const client = await this.prisma.clientLead.findUnique({ where: { id } });
    if (!client) throw new NotFoundException(`Client ${id} not found`);
    const calls = Array.isArray(client.calls) ? client.calls : [];
    calls.push(callObj as any);
    const updated = await this.prisma.clientLead.update({ where: { id }, data: { calls } });
    
    await this.auditService.logUpdate({
      moduleName: "CRM_CLIENT",
      entityId: id,
      actorId,
      newValue: { newCall: callObj },
    });
    return { success: true, data: updated };
  }

  async addClientRequirement(id: string, item: any, actorId?: string, user?: any) {
    if (actorId && user) await this.enforceOwnership(id, actorId, user, 'CLIENT');
    const updated = await this.repository.addClientRequirement(id, item);
    if (!updated) {
      throw new NotFoundException(`Client ${id} not found`);
    }
    return { success: true, data: updated };
  }

  async updateClientRequirementStatus(clientId: string, reqId: string, status: string, actorId?: string, user?: any) {
    if (actorId && user) await this.enforceOwnership(clientId, actorId, user, 'CLIENT');
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

  async addClientChangeRequest(id: string, item: any, actorId?: string, user?: any) {
    if (actorId && user) await this.enforceOwnership(id, actorId, user, 'CLIENT');
    const updated = await this.repository.addClientChangeRequest(id, item);
    if (!updated) {
      throw new NotFoundException(`Client ${id} not found`);
    }
    return { success: true, data: updated };
  }

  async updateClientChangeRequestStatus(clientId: string, crId: string, status: string, actorId?: string, user?: any) {
    if (actorId && user) await this.enforceOwnership(clientId, actorId, user, 'CLIENT');
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

  async addClientAttachment(id: string, attachment: string, actorId?: string, user?: any) {
    if (actorId && user) await this.enforceOwnership(id, actorId, user, 'CLIENT');
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

  async createRequirement(dto: CreateRequirementDto, actorId?: string, user?: any) {
    const created = await this.repository.createRequirement({
      ...dto,
      createdBy: actorId || 'System User'
    } as any);
    // Set the assigned CRM as the actor ID by default if not set
    if (actorId) {
      await this.prisma.requirement.update({ where: { id: created.id }, data: { assignedCrmId: actorId } });
    }
    await this.auditService.logCreate({
      moduleName: "CRM_REQUIREMENT",
      entityId: created.id,
      actorId,
      metadata: created,
    });
    return { success: true, data: created };
  }

  async updateRequirement(id: string, dto: UpdateRequirementDto, actorId?: string, user?: any) {
    if (actorId && user) await this.enforceOwnership(id, actorId, user, 'REQUIREMENT');
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

  async updateRequirementStatus(id: string, status: string, actorId?: string, user?: any) {
    if (actorId && user) await this.enforceOwnership(id, actorId, user, 'REQUIREMENT');
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

  async updateRequirementDecision(id: string, decision: any, actorId?: string, user?: any) {
    if (actorId && user) await this.enforceOwnership(id, actorId, user, 'REQUIREMENT');
    const req = await this.prisma.requirement.findUnique({ where: { id } });
    if (!req) throw new NotFoundException(`Requirement ${id} not found`);
    const updated = await this.prisma.requirement.update({
      where: { id },
      data: { requirementDecision: decision, decisionMaker: actorId || 'Unknown' }
    });
    await this.auditService.logUpdate({
      moduleName: "CRM_REQUIREMENT",
      entityId: id,
      actorId,
      newValue: { requirementDecision: decision },
    });
    return { success: true, data: updated };
  }

  async deleteRequirement(id: string, actorId?: string, user?: any) {
    if (actorId && user) await this.enforceOwnership(id, actorId, user, 'REQUIREMENT');
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

  async transferToCrm(id: string, assignedCrmId: string, actorId?: string, user?: any) {
    // Only Global Admins or the owning CEM can transfer
    const client = await this.prisma.clientLead.findUnique({ where: { id } });
    if (!client) throw new NotFoundException(`Client ${id} not found`);
    
    const isGlobalAdmin = user?.role === 'OM' || user?.role === 'SUPER_ADMIN' || user?.role === 'CEO';
    if (!isGlobalAdmin && client.assignedCemId !== actorId) {
       throw new ForbiddenException("Only the assigned CEM or an Admin can transfer this lead.");
    }
    
    const updatedClient = await this.prisma.clientLead.update({
      where: { id },
      data: {
        stage: 6,
        assignedCrmId: assignedCrmId,
      }
    });

    await this.repository.logActivity(id, client.company, "Transferred to CRM", `Lead ${client.company} was handed off to CRM user ${assignedCrmId}.`);

    await this.auditService.logUpdate({
      moduleName: "CRM_CLIENT",
      entityId: id,
      actorId,
      newValue: { stage: 6, assignedCrmId, status: "TRANSFERRED_TO_CRM" },
    });
    return { success: true, data: updatedClient };
  }

  async getRecentActivity() {
    const data = await this.repository.getRecentActivity();
    return { data };
  }

  async getPipelineSummary(actorId?: string, user?: any) {
    const isGlobalAdmin = user?.role === 'OM' || user?.role === 'SUPER_ADMIN' || user?.role === 'CEO';
    
    // Scoped queries
    const clientWhere: any = (!isGlobalAdmin && actorId) ? { OR: [{ assignedCrmId: actorId }, { assignedCemId: actorId }] } : {};
    const reqWhere: any = (!isGlobalAdmin && actorId) ? { OR: [{ assignedCrmId: actorId }, { clientLead: { assignedCemId: actorId } }] } : {};

    const clients = await this.prisma.clientLead.findMany({
      where: clientWhere,
      orderBy: { updatedDate: 'desc' },
      take: 20,
      include: { requirements: true }
    });
    
    const allClients = await this.prisma.clientLead.findMany({ where: clientWhere });
    const requirements = await this.prisma.requirement.findMany({ where: reqWhere });
    
    const stageCounts: Record<number, number> = {};
    const healthCounts: Record<string, number> = {};

    let completedDeals = 0;
    allClients.forEach((c: any) => {
      stageCounts[c.stage] = (stageCounts[c.stage] || 0) + 1;
      healthCounts[c.clientHealth] = (healthCounts[c.clientHealth] || 0) + 1;
      if (c.stage >= 6) completedDeals++;
    });

    const activeRequirements = requirements.length;
    // Reconcile pendingClarification: For CRM it means requirements in "Validation Needed"
    const pendingClarification = requirements.filter((r: any) => r.status === 'Validation Needed').length;

    return {
      totalClients: allClients.length,
      activeRequirements,
      pendingClarification,
      completedDeals,
      clients, // The frontend uses pipelineData.clients
      byStage: stageCounts,
      byHealth: healthCounts,
    };
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

  async createMeeting(dto: CreateMeetingDto, actorId: string, user?: any) {
    if (user && dto.leadId) await this.enforceOwnership(dto.leadId, actorId, user, 'CLIENT');
    
    // Verify client exists
    const clientExists = await this.prisma.clientLead.findUnique({ where: { id: dto.leadId || '' }});
    if (dto.leadId && !clientExists) {
      throw new NotFoundException(`ClientLead with id ${dto.leadId} not found`);
    }

    // Generate Zoom link
    let zoomLink = '';
    try {
      // Parse the dto.date and dto.time properly for zoom start time.
      // Handle both 24h ("14:30") and 12h AM/PM ("02:30 PM") formats.
      let timeStr = (dto.time || '').trim();
      const ampmMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (ampmMatch) {
        let hours = parseInt(ampmMatch[1], 10);
        const mins = ampmMatch[2];
        const period = ampmMatch[3].toUpperCase();
        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        timeStr = `${hours.toString().padStart(2, '0')}:${mins}`;
      }
      
      const startTime = new Date(`${dto.date}T${timeStr}:00`);
      if (isNaN(startTime.getTime())) {
        this.logger.warn(`Invalid meeting time: date=${dto.date}, time=${dto.time}. Falling back to current time.`);
      }
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

  async getDailyWorkLogs(actorId: string) {
    if (!actorId) return { data: [] };
    const logs = await this.prisma.dailyWorkLog.findMany({
      where: { employeeId: actorId },
      orderBy: { date: 'desc' }
    });
    return { data: logs };
  }

  async addDailyWorkLog(actorId: string, date: string, content: string) {
    const updated = await this.prisma.dailyWorkLog.upsert({
      where: { employeeId_date: { employeeId: actorId, date } },
      update: { content },
      create: { employeeId: actorId, date, content }
    });
    return { success: true, data: updated };
  }
}

