import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { CreateRequirementDto } from "./dto/create-requirement.dto";
import { UpdateRequirementDto } from "./dto/update-requirement.dto";

export interface CrmActivityLog {
  id: string;
  clientId: string | null;
  clientName: string | null;
  action: string;
  description: string;
  createdAt: Date;
}

export interface ClientLead {
  id: string;
  company: string;
  industry: string;
  phone: string;
  email: string;
  priority: string;
  stage: number;
  assignedCem: string;
  leadOwner: string;
  createdDate: string;
  updatedDate: string;
  sourceQuality: number;
  leadSource: string;
  clientHealth: string;
  changeRequests: any;
  attachments: string[];
  stakeholders: any;
  requirementsList: any;
  meetingsHistory: any;
  notes?: string[];
  calls?: string[];
}

export interface IncomingHandoff {
  id: string;
  company: string;
  industry: string;
  assignedBy: string;
  assignedDate: string;
  phone: string;
  email: string;
  priority: string;
}

export interface Requirement {
  id: string;
  title: string;
  clientName: string;
  module: string;
  priority: string;
  status: string;
  category: string;
  businessNeed: string;
  description: string;
  expectedDelivery: string;
  clientNotes: string;
  internalNotes: string;
  owner: string;
  assignedCrm: string;
  createdBy: string;
  requestedBy: string;
  decisionMaker: string;
  approver: string;
  dependencies: any;
  attachments: string[];
  timeline: any;
}

@Injectable()
export class CrmRepository {
  constructor(private readonly prisma: PrismaService) { }

  private get db(): any {
    return this.prisma;
  }

  async findAllClients(): Promise<ClientLead[]> {
    return this.db.clientLead.findMany() as unknown as ClientLead[];
  }

  async findAllIncoming(): Promise<IncomingHandoff[]> {
    return this.db.incomingHandoff.findMany() as unknown as IncomingHandoff[];
  }


  async createClient(dto: CreateClientDto): Promise<ClientLead> {
    return this.db.clientLead.create({
      data: {
        company: dto.company,
        industry: dto.industry,
        phone: dto.phone,
        email: dto.email,
        priority: dto.priority || "Medium",
        stage: 1,
        assignedCem: "CRM Team",
        leadOwner: dto.leadOwner || "Manual Creation",
        createdDate: new Date().toISOString().replace("T", " ").slice(0, 16),
        updatedDate: new Date().toISOString().replace("T", " ").slice(0, 16),
        sourceQuality: dto.sourceQuality || 3,
        leadSource: dto.leadSource || "Direct Entry",
        clientHealth: "On Track",
        changeRequests: { open: 0, approved: 0, rejected: 0 },
        attachments: [],
        stakeholders: [{ name: "Primary Contact", role: "Point of Contact", email: dto.email, phone: dto.phone }],
        requirementsList: [],
        meetingsHistory: [],
        notes: [],
        calls: []
      }
    }) as unknown as ClientLead;
  }

  async acceptHandoff(incomingId: string): Promise<ClientLead | null> {
    const handoff = await this.db.incomingHandoff.findUnique({ where: { id: incomingId } });
    if (!handoff) return null;

    return this.db.$transaction(async (tx: any) => {

      await tx.incomingHandoff.delete({ where: { id: incomingId } });

      return tx.clientLead.create({
        data: {
          company: handoff.company,
          industry: handoff.industry,
          phone: handoff.phone,
          email: handoff.email,
          priority: handoff.priority || "Medium",
          stage: 1,
          assignedCem: handoff.assignedBy,
          leadOwner: "Handoff Accepted",
          createdDate: handoff.assignedDate,
          updatedDate: new Date().toISOString().replace("T", " ").slice(0, 16),
          sourceQuality: 4,
          leadSource: "Incoming Handoff",
          clientHealth: "On Track",
          changeRequests: { open: 0, approved: 0, rejected: 0 },
          attachments: [],
          stakeholders: [{ name: "Operations Contact", role: "POC", email: handoff.email, phone: handoff.phone }],
          requirementsList: [],
          meetingsHistory: [],
          notes: ["Handoff accepted into active workspace"],
          calls: []
        }
      }) as unknown as ClientLead;
    });
  }

  async clarifyHandoff(incomingId: string): Promise<boolean> {
    const handoff = await this.db.incomingHandoff.findUnique({ where: { id: incomingId } });
    return !!handoff;
  }

  async rejectHandoff(incomingId: string): Promise<boolean> {
    try {
      await this.db.incomingHandoff.delete({ where: { id: incomingId } });
      return true;
    } catch {
      return false;
    }
  }

  async updateClientStage(id: string, stage: number): Promise<ClientLead | null> {
    return this.db.clientLead.update({
      where: { id },
      data: {
        stage,
        updatedDate: new Date().toISOString().replace("T", " ").slice(0, 16)
      }
    }) as unknown as ClientLead;
  }

  async updateClientHealth(id: string, health: string): Promise<ClientLead | null> {
    return this.db.clientLead.update({
      where: { id },
      data: {
        clientHealth: health,
        updatedDate: new Date().toISOString().replace("T", " ").slice(0, 16)
      }
    }) as unknown as ClientLead;
  }

  async addClientNote(id: string, note: string): Promise<ClientLead | null> {
    const client = await this.db.clientLead.findUnique({ where: { id } });
    if (!client) return null;
    const notes = (client.notes as string[]) || [];
    notes.push(note);
    return this.db.clientLead.update({
      where: { id },
      data: { notes }
    }) as unknown as ClientLead;
  }

  async addClientCall(id: string, call: string): Promise<ClientLead | null> {
    const client = await this.db.clientLead.findUnique({ where: { id } });
    if (!client) return null;
    const calls = (client.calls as string[]) || [];
    calls.push(call);
    return this.db.clientLead.update({
      where: { id },
      data: { calls }
    }) as unknown as ClientLead;
  }

  async addClientRequirement(id: string, item: any): Promise<ClientLead | null> {
    const client = await this.db.clientLead.findUnique({ where: { id } });
    if (!client) return null;

    let reqs = client.requirementsList as any[];
    if (!Array.isArray(reqs)) reqs = [];
    reqs.push(item);

    return this.db.clientLead.update({
      where: { id },
      data: { requirementsList: reqs }
    }) as unknown as ClientLead;
  }


  async findAllRequirements(): Promise<Requirement[]> {
    return this.db.requirement.findMany() as unknown as Requirement[];
  }

  async createRequirement(dto: CreateRequirementDto): Promise<Requirement> {
    return this.db.requirement.create({
      data: {
        title: dto.title,
        clientName: dto.clientName,
        module: dto.module || "General",
        priority: dto.priority || "MEDIUM",
        status: dto.status || "Pending",
        category: dto.category || "Functional",
        businessNeed: dto.businessNeed || "",
        description: dto.description || "",
        expectedDelivery: dto.expectedDelivery || "TBD",
        clientNotes: dto.clientNotes || "",
        internalNotes: dto.internalNotes || "",
        owner: dto.owner || "Unassigned",
        assignedCrm: dto.assignedCrm || "CRM Lead",
        createdBy: dto.createdBy || "System User",
        requestedBy: dto.requestedBy || "Client Request",
        decisionMaker: dto.decisionMaker || "TBD",
        approver: dto.approver || "TBD",
        dependencies: dto.dependencies || [],
        attachments: dto.attachments || [],
        timeline: dto.timeline || [{ date: "Today", label: "Requirement Drafted", done: true }]
      }
    }) as unknown as Requirement;
  }

  async updateRequirement(id: string, dto: UpdateRequirementDto): Promise<Requirement | null> {
    return this.db.requirement.update({
      where: { id },
      data: { ...dto }
    }) as unknown as Requirement;
  }

  async updateRequirementStatus(id: string, status: string): Promise<Requirement | null> {
    return this.db.requirement.update({
      where: { id },
      data: { status }
    }) as unknown as Requirement;
  }

  async deleteRequirement(id: string): Promise<boolean> {
    try {
      await this.db.requirement.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async logActivity(clientId: string | null, clientName: string | null, action: string, description: string): Promise<CrmActivityLog> {
    return this.db.crmActivityLog.create({
      data: {
        clientId,
        clientName,
        action,
        description
      }
    });
  }

  async getRecentActivity(): Promise<CrmActivityLog[]> {
    return this.db.crmActivityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });
  }

  async transferToCrm(id: string): Promise<ClientLead | null> {
    const client = await this.db.clientLead.findUnique({ where: { id } });
    if (!client) return null;

    const updatedClient = await this.db.clientLead.update({
      where: { id },
      data: {
        stage: 6,
        assignedCem: "CRM Team",
        updatedDate: new Date().toISOString().replace("T", " ").slice(0, 16)
      }
    });

    await this.logActivity(id, client.company, "Transferred to CRM", `Lead ${client.company} was handed off to the CRM team.`);

    return updatedClient as unknown as ClientLead;
  }

  async getPipelineSummary(): Promise<any> {
    const clients = await this.db.clientLead.findMany();
    const stageCounts: Record<number, number> = {};
    const healthCounts: Record<string, number> = {};

    clients.forEach((c: any) => {
      stageCounts[c.stage] = (stageCounts[c.stage] || 0) + 1;
      healthCounts[c.clientHealth] = (healthCounts[c.clientHealth] || 0) + 1;
    });

    return {
      totalClients: clients.length,
      byStage: stageCounts,
      byHealth: healthCounts,
    };
  }

  async getLeadActivityReport(): Promise<any> {
    const activities = await this.db.crmActivityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const actionCounts: Record<string, number> = {};
    activities.forEach((a: any) => {
      actionCounts[a.action] = (actionCounts[a.action] || 0) + 1;
    });

    return {
      totalActivities: activities.length,
      byAction: actionCounts,
      recentLogs: activities,
    };
  }
}


