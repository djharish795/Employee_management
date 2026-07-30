import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@naprocs/database';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateCemLeadDto } from './dto/create-cem-lead.dto';
import { UpdateCemLeadDto } from './dto/update-cem-lead.dto';
import { BantUpdateDto } from './dto/bant-update.dto';
import { AddFollowUpLogDto } from './dto/add-follow-up-log.dto';
import { AddMeetingLogDto } from './dto/add-meeting-log.dto';

@Injectable()
export class CemLeadService {
  constructor(
    private prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  async getAllLeads(cemId: string, priority?: string, role?: string) {
    const where: any = {};
    if (priority && priority !== 'All') where.priority = priority;
    
    const isGlobalAdmin = role === 'OM' || role === 'SUPER_ADMIN' || role === 'CEO';
    if (cemId && !isGlobalAdmin) {
      where.assignedCemId = cemId;
    }

    return this.prisma.cemLead.findMany({
      where,
      include: {
        followUps: true,
        meetings: true,
        assignedCem: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getLeadById(id: string) {
    const lead = await this.prisma.cemLead.findUnique({
      where: { id },
      include: { followUps: true, meetings: true, assignedCem: true }
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }
  async createLead(dto: CreateCemLeadDto, actorId: string) {
    const lead = await this.prisma.cemLead.create({
      data: {
        ...dto,
        assignedCemId: actorId
      },
      include: { followUps: true, meetings: true }
    });
    
    await this.auditService.logCreate({
      moduleName: 'CEM_LEAD',
      entityId: lead.id,
      actorId,
      metadata: lead as any
    });
    
    return lead;
  }

  async updateStage(id: string, stage: number) {
    const lead = await this.prisma.cemLead.findUnique({ where: { id } });
    if (!lead) throw new Error('Lead not found');

    if (stage >= 6 && lead.qualificationScore < 100) {
      throw new Error('Cannot assign to CRM without 100% BANT qualification.');
    }

    const updated = await this.prisma.cemLead.update({
      where: { id },
      data: { stage },
      include: { followUps: true, meetings: true, assignedCem: true }
    });

    await this.auditService.logUpdate({
      moduleName: 'CEM_LEAD',
      entityId: id,
      actorId: 'SYSTEM', // Should ideally be actorId but interface doesn't have it here
      oldValue: { stage: lead.stage },
      newValue: { stage }
    });

    return updated;
  }

  async toggleBant(id: string, dto: BantUpdateDto) {
    const lead = await this.prisma.cemLead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');

    const newData = { [dto.field]: dto.value };
    
    // Calculate new score based on updated field + existing fields
    let score = 0;
    if (dto.field === 'budgetConfirmed' ? dto.value : lead.budgetConfirmed) score += 25;
    if (dto.field === 'authorityIdentified' ? dto.value : lead.authorityIdentified) score += 25;
    if (dto.field === 'needValidated' ? dto.value : lead.needValidated) score += 25;
    if (dto.field === 'timelineEstablished' ? dto.value : lead.timelineEstablished) score += 25;

    let newStage = lead.stage;
    if (score === 100) {
      newStage = 5; // Automatically move to Qualified stage
    }

    const updated = await this.prisma.cemLead.update({
      where: { id },
      data: {
        ...newData,
        qualificationScore: score,
        stage: newStage
      },
      include: { followUps: true, meetings: true, assignedCem: true }
    });

    await this.auditService.logUpdate({
      moduleName: 'CEM_LEAD',
      entityId: id,
      actorId: 'SYSTEM',
      oldValue: { qualificationScore: lead.qualificationScore, stage: lead.stage, ...newData },
      newValue: { qualificationScore: score, stage: newStage, ...newData }
    });

    return updated;
  }

  async addFollowUpLog(id: string, dto: AddFollowUpLogDto) {
    const lead = await this.getLeadById(id);
    if (!lead) throw new Error('Lead not found');

    const followUp = await this.prisma.followUp.create({
      data: {
        cemLead: { connect: { id } },
        leadName: lead.prospectName,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        assignedCem: lead.assignedCem ? `${lead.assignedCem.firstName} ${lead.assignedCem.lastName}` : 'Unknown',
        type: dto.type,
        lastNote: dto.summary,
        nextAction: 'Follow Up Activity',
        dueDate: dto.nextActionDate ? new Date(dto.nextActionDate) : new Date(),
        status: 'Pending',
        priority: lead.priority,
        currentStage: 'Follow Up'
      }
    });
    
    await this.auditService.logCreate({
      moduleName: 'CEM_FOLLOW_UP',
      entityId: followUp.id,
      actorId: lead.assignedCemId || 'SYSTEM',
      metadata: followUp as any
    });
    
    return this.getLeadById(id);
  }

  async addMeetingLog(id: string, dto: AddMeetingLogDto) {
    const lead = await this.getLeadById(id);
    if (!lead) throw new Error('Lead not found');

    const meeting = await this.prisma.meeting.create({
      data: {
        cemLead: { connect: { id } },
        client: lead.company,
        leadId: `LEAD-${id.slice(0, 4).toUpperCase()}`, // Mock legacy ID structure
        leadName: lead.prospectName,
        date: dto.date,
        time: dto.time,
        type: dto.type,
        assignedEmployee: lead.assignedCem ? `${lead.assignedCem.firstName} ${lead.assignedCem.lastName}` : 'Unknown',
        clientPhone: lead.phone,
        status: 'SCHEDULED'
      }
    });
    
    await this.auditService.logCreate({
      moduleName: 'CEM_MEETING',
      entityId: meeting.id,
      actorId: lead.assignedCemId || 'SYSTEM',
      metadata: meeting as any
    });
    
    return this.getLeadById(id);
  }

  async triggerHandoff(id: string, actorId: string) {
    const lead = await this.getLeadById(id);
    if (!lead) throw new NotFoundException('Lead not found');

    if (lead.qualificationScore < 100) {
      throw new BadRequestException('Cannot assign to CRM without 100% BANT qualification.');
    }

    const updated = await this.prisma.cemLead.update({
      where: { id },
      data: {
        qualificationStatus: 'AWAITING_HANDOFF',
        stage: 6
      },
      include: { followUps: true, meetings: true, assignedCem: true }
    });

    await this.auditService.logUpdate({
      moduleName: 'CEM_LEAD',
      entityId: id,
      actorId,
      oldValue: { qualificationStatus: lead.qualificationStatus, stage: lead.stage },
      newValue: { qualificationStatus: 'AWAITING_HANDOFF', stage: 6 }
    });

    return updated;
  }

  async cancelLead(id: string, actorId: string) {
    const lead = await this.getLeadById(id);
    if (!lead) throw new NotFoundException('Lead not found');

    const updated = await this.prisma.cemLead.update({
      where: { id },
      data: { qualificationStatus: 'CANCELED' },
      include: { followUps: true, meetings: true, assignedCem: true }
    });

    await this.auditService.logUpdate({
      moduleName: 'CEM_LEAD',
      entityId: id,
      actorId,
      oldValue: { qualificationStatus: lead.qualificationStatus },
      newValue: { qualificationStatus: 'CANCELED' }
    });

    return updated;
  }

  async updateStatus(id: string, status: string, actorId: string) {
    const lead = await this.getLeadById(id);
    if (!lead) throw new NotFoundException('Lead not found');

    if (status !== 'CANCELED' && status !== 'ACTIVE') {
      throw new BadRequestException('Invalid status value');
    }

    const updated = await this.prisma.cemLead.update({
      where: { id },
      data: { qualificationStatus: status },
      include: { followUps: true, meetings: true, assignedCem: true }
    });

    await this.auditService.logUpdate({
      moduleName: 'CEM_LEAD',
      entityId: id,
      actorId,
      oldValue: { qualificationStatus: lead.qualificationStatus },
      newValue: { qualificationStatus: status }
    });

    return updated;
  }

  async getPipelineLeads() {
    return this.prisma.cemLead.findMany({
      where: {
        qualificationStatus: { in: ['AWAITING_HANDOFF', 'HANDED_OVER', 'CRM_ACTIVE'] }
      },
      include: { assignedCem: true },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async confirmHandoff(id: string, crmOwner: string) {
    const lead = await this.prisma.cemLead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');
    
    if (lead.qualificationStatus !== 'AWAITING_HANDOFF') {
      throw new BadRequestException('Lead is not awaiting handoff');
    }

    const crmEmployee = await this.prisma.employee.findUnique({
      where: { officialEmail: crmOwner },
      include: { user: true }
    });

    if (!crmEmployee) {
      throw new BadRequestException('Invalid CRM owner Email provided');
    }

    if (crmEmployee.user?.role !== 'CRM' && crmEmployee.user?.role !== 'OM' && crmEmployee.user?.role !== 'CEO') {
      throw new BadRequestException('Assigned owner does not have CRM privileges');
    }

    // Create the ClientLead in the CRM module upon handoff confirmation
    await this.prisma.clientLead.create({
      data: {
        company: lead.company,
        industry: lead.industry,
        phone: lead.phone || '',
        email: lead.email || '',
        priority: lead.priority || 'Medium',
        stage: 1,
        assignedCemId: lead.assignedCemId || null,
        assignedCrmId: crmEmployee.id,
        leadOwner: crmEmployee.id,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
        sourceQuality: 3,
        leadSource: lead.leadSource || 'CEM Handoff',
        clientHealth: 'ON TRACK',
        changeRequests: { open: 0, approved: 0, rejected: 0 },
        attachments: [],
        stakeholders: [{ name: lead.prospectName, role: 'Primary Contact', email: lead.email, phone: lead.phone }],
        notes: ['Lead handed off from CEM module.'],
        calls: []
      }
    });

    const updated = await this.prisma.cemLead.update({
      where: { id },
      data: {
        qualificationStatus: 'HANDED_OVER',
        assignedCrm: crmEmployee.id
      },
      include: { assignedCem: true }
    });

    await this.auditService.logUpdate({
      moduleName: 'CEM_LEAD',
      entityId: id,
      actorId: 'SYSTEM',
      oldValue: { qualificationStatus: lead.qualificationStatus, assignedCrm: lead.assignedCrm },
      newValue: { qualificationStatus: 'HANDED_OVER', assignedCrm: crmEmployee.id }
    });

    return updated;
  }

  async getDashboardSummary(actorId: string, role?: string) {
    const today = new Date();
    // Use local date string YYYY-MM-DD for comparing with string dates stored in FollowUp/MeetingLog
    const todayStr = today.toISOString().split('T')[0];
    
    // 7 days ago for neglected check
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const isGlobalAdmin = role === 'OM' || role === 'SUPER_ADMIN' || role === 'CEO';
    const cemWhere: Prisma.CemLeadWhereInput = (!isGlobalAdmin && actorId) ? { assignedCemId: actorId } : {};
    const meetingWhere: Prisma.MeetingWhereInput = (!isGlobalAdmin && actorId) ? { cemLead: { assignedCemId: actorId } } : {};
    const followUpWhere: Prisma.FollowUpWhereInput = (!isGlobalAdmin && actorId) ? { cemLead: { assignedCemId: actorId } } : {};

    // 1. KPIs
    const newLeadsAssigned = await this.prisma.cemLead.count({ where: { ...cemWhere, stage: 1, qualificationStatus: { not: 'CANCELED' } } });
    
    const followUpsDue = await this.prisma.followUp.count({
      where: { ...followUpWhere, status: 'Pending', dueDate: { lte: today } }
    });

    const meetingsScheduled = await this.prisma.meeting.count({
      where: { ...meetingWhere, status: 'SCHEDULED', date: todayStr }
    });

    const qualifiedForCrm = await this.prisma.cemLead.count({
      where: { ...cemWhere, qualificationStatus: { in: ['AWAITING_HANDOFF', 'HANDED_OVER', 'CRM_ACTIVE'] } }
    });

    const overdueFollowUps = await this.prisma.followUp.count({
      where: { ...followUpWhere, status: 'Pending', dueDate: { lt: today } }
    });
    
    const overdueMeetings = await this.prisma.meeting.count({
      where: { ...meetingWhere, status: 'SCHEDULED', date: { lt: todayStr } }
    });

    // 2. Action Required Leads
    const activeLeads = await this.prisma.cemLead.findMany({
      where: { ...cemWhere, stage: { lt: 6 }, qualificationStatus: 'ACTIVE' },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      include: { followUps: { orderBy: { dueDate: 'asc' }, take: 1 } }
    });

    // 3. Today's Meetings
    const todaysMeetingsList = await this.prisma.meeting.findMany({
      where: { ...meetingWhere, date: todayStr },
      orderBy: { time: 'asc' },
      include: { cemLead: true }
    });

    // 4. Neglected Clients
    const neglectedClients = await this.prisma.cemLead.findMany({
      where: {
        ...cemWhere,
        stage: { lt: 6 },
        qualificationStatus: 'ACTIVE',
        updatedAt: { lt: sevenDaysAgo }
      },
      orderBy: { updatedAt: 'asc' },
      take: 5,
      include: { followUps: { orderBy: { dueDate: 'desc' }, take: 1 } }
    });

    // 5. Ready for CRM
    const readyForCrmList = await this.prisma.cemLead.findMany({
      where: { ...cemWhere, qualificationStatus: 'AWAITING_HANDOFF' },
      orderBy: { updatedAt: 'desc' },
      take: 5
    });

    // 6. Recent Activity
    const recentLeads = await this.prisma.cemLead.findMany({
      where: { ...cemWhere },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, company: true, createdAt: true }
    });
    const recentMeetings = await this.prisma.meeting.findMany({
      where: meetingWhere,
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: { cemLead: { select: { company: true } } }
    });
    const recentFollowUps = await this.prisma.followUp.findMany({
      where: followUpWhere,
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: { cemLead: { select: { company: true } } }
    });

    const activities = [
      ...recentLeads.map(l => ({ type: 'LEAD', title: `New lead '${l.company}' created`, time: l.createdAt })),
      ...recentMeetings.map(m => ({ type: 'MEETING', title: `Meeting scheduled for '${m.cemLead?.company || m.client || 'Unknown'}'`, time: m.createdAt })),
      ...recentFollowUps.map(f => ({ type: 'FOLLOW_UP', title: `Follow-up logged for '${f.cemLead?.company || f.company || 'Unknown'}'`, time: f.createdAt }))
    ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);

    return {
      kpis: {
        newLeadsAssigned,
        followUpsDue,
        meetingsScheduled,
        qualifiedForCrm,
        overdueActions: overdueFollowUps + overdueMeetings
      },
      activeLeads,
      todaysMeetings: todaysMeetingsList,
      neglectedClients,
      readyForCrm: readyForCrmList,
      activities
    };
  }
}
