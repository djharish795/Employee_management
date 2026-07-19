import { Injectable } from "@nestjs/common";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { CreateRequirementDto } from "./dto/create-requirement.dto";
import { UpdateRequirementDto } from "./dto/update-requirement.dto";

export interface ClientLead {
  id: string;
  company: string;
  industry: string;
  phone: string;
  email: string;
  priority: "High" | "Medium" | "Low";
  stage: number;
  assignedCem: string;
  leadOwner: string;
  createdDate: string;
  updatedDate: string;
  sourceQuality: number;
  leadSource: string;
  clientHealth: string;
  changeRequests: { open: number; approved: number; rejected: number };
  attachments: string[];
  stakeholders: any[];
  requirementsList: any[];
  meetingsHistory: any[];
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
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "Draft" | "In Review" | "Awaiting Client" | "Approved" | "Rejected" | "Pending";
  category: "Functional" | "Technical" | "Integration" | "Reporting" | "Security" | "Compliance";
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
  dependencies: any[];
  attachments: string[];
  timeline: any[];
}

@Injectable()
export class CrmRepository {
  private clients: ClientLead[] = [
    {
      id: "CID-9012",
      company: "Aether Logistics Corp",
      industry: "Supply Chain & Logistics",
      phone: "+1 (555) 234-5678",
      email: "contact@aetherlogistics.io",
      priority: "High",
      stage: 3, // In Execution
      assignedCem: "Sarah Jenkins",
      leadOwner: "Enterprise Inbound",
      createdDate: "2023-10-12 09:30",
      updatedDate: "2023-10-24 14:15",
      sourceQuality: 5,
      leadSource: "Direct Enterprise Demo",
      clientHealth: "On Track",
      changeRequests: { open: 2, approved: 4, rejected: 1 },
      attachments: ["SLA_Agreement_v2.pdf", "Architecture_Overview.docx"],
      stakeholders: [
        { name: "Robert Chen", role: "VP of Operations", email: "r.chen@aetherlogistics.io", phone: "+1 (555) 234-5678" },
        { name: "Emily Watson", role: "Lead IT Architect", email: "e.watson@aetherlogistics.io", phone: "+1 (555) 234-9900" }
      ],
      requirementsList: [
        { name: "Multi-Region Inventory Sync", priority: "High", status: "Approved", lastUpdated: "Yesterday" },
        { name: "Real-time Vehicle Telematics Hook", priority: "Medium", status: "Pending", lastUpdated: "3 days ago" }
      ],
      meetingsHistory: [
        { title: "Technical Architecture Alignment", date: "Oct 20, 2023", time: "11:00 AM", attendees: "Robert, Emily, Sarah", status: "Completed" }
      ],
      notes: ["Initial scope review completed. Budget pre-approved."],
      calls: ["Call with Robert Chen regarding SLA expectations."]
    },
    {
      id: "CID-4028",
      company: "Stratos Cloud Systems",
      industry: "Cloud & Infrastructure",
      phone: "+1 (555) 876-5432",
      email: "accounts@stratoscloud.com",
      priority: "Medium",
      stage: 2, // Contract Sent
      assignedCem: "Michael Vance",
      leadOwner: "Webinar Outbound Q3",
      createdDate: "2023-10-15 11:20",
      updatedDate: "2023-10-23 16:45",
      sourceQuality: 4,
      leadSource: "Q3 Virtual Summit",
      clientHealth: "Attention Req.",
      changeRequests: { open: 1, approved: 1, rejected: 0 },
      attachments: ["Security_Compliance_Report.pdf"],
      stakeholders: [
        { name: "Elena Markova", role: "Director of Infra", email: "elena@stratoscloud.com", phone: "+1 (555) 876-5432" }
      ],
      requirementsList: [
        { name: "SOC2 Type II Audit Log Export", priority: "High", status: "In Review", lastUpdated: "Today" }
      ],
      meetingsHistory: [],
      notes: ["Pending legal approval on indemnification clause."],
      calls: []
    }
  ];

  private incoming: IncomingHandoff[] = [
    {
      id: "HANDOFF-881",
      company: "Apex Global FinTech",
      industry: "Financial Technology",
      assignedBy: "Swetha CEM",
      assignedDate: "2023-10-24 08:30",
      phone: "+1 (555) 309-1122",
      email: "onboarding@apexglobal.com",
      priority: "High"
    },
    {
      id: "HANDOFF-882",
      company: "Kinetix Robotics",
      industry: "Industrial Automation",
      assignedBy: "Julian CEM",
      assignedDate: "2023-10-24 10:15",
      phone: "+1 (555) 441-9988",
      email: "info@kinetixrobotics.io",
      priority: "Medium"
    }
  ];

  private requirements: Requirement[] = [
    {
      id: "REQ-2023-0812",
      title: "Lead Assignment Automation Engine",
      clientName: "Global Logistics Inc.",
      module: "Lead Management",
      priority: "CRITICAL",
      status: "In Review",
      category: "Functional",
      businessNeed: "Current manual lead routing is causing a 24-hour delay in response times. Operations teams need automated distribution based on territory and product expertise to improve conversion.",
      description: "Automated routing engine that listens to new Lead objects and assigns them to active Sales Executives based on the predefined Geo-Mapping table. System must handle round-robin within territories.",
      expectedDelivery: "2023-12-15",
      clientNotes: "Requested a dashboard widget to monitor the routing volume per territory.",
      internalNotes: "Client budget pre-approved. Needs CTO sign-off before proposal delivery.",
      owner: "Sarah Mitchell",
      assignedCrm: "John Doe",
      createdBy: "Alex Sterling",
      requestedBy: "Operations Head",
      decisionMaker: "CTO",
      approver: "CEO",
      dependencies: [
        { id: "REQ-2023-0401", name: "Identity & Access Controls", status: "Completed" },
        { id: "API-GATEWAY-V2", name: "API Gateway Routing", status: "Blocked" }
      ],
      attachments: ["Requirements_Spec_v1.pdf", "Architecture_Diagram.png"],
      timeline: [
        { date: "12 Oct", label: "Requirement Created", done: true },
        { date: "15 Oct", label: "Requirement Updated", done: true },
        { date: "18 Oct", label: "Client Review Requested", done: true }
      ]
    },
    {
      id: "REQ-2023-0914",
      title: "Mobile CRM Offline Sync",
      clientName: "CyberDyne Systems",
      module: "Mobile Application",
      priority: "HIGH",
      status: "Approved",
      category: "Technical",
      businessNeed: "Field reps work in areas with intermittent connectivity and need offline creation of notes, tasks, and client check-in logs.",
      description: "Local SQLite cache in mobile client syncing with API via background delta sync worker when network restores.",
      expectedDelivery: "2024-01-20",
      clientNotes: "Essential for Q1 field rollout.",
      internalNotes: "Sprint allocation complete.",
      owner: "David Sterling",
      assignedCrm: "John Doe",
      createdBy: "Swetha CEM",
      requestedBy: "Sales Director",
      decisionMaker: "VP Product",
      approver: "CTO",
      dependencies: [
        { id: "AUTH-JWT-V2", name: "Refresh Token Flow", status: "Completed" }
      ],
      attachments: ["Mobile_Offline_RFC.pdf"],
      timeline: [
        { date: "01 Oct", label: "Spec Drafted", done: true },
        { date: "10 Oct", label: "Technical Review Passed", done: true },
        { date: "22 Oct", label: "Approved for Sprint", done: true }
      ]
    }
  ];

  async findAllClients(): Promise<ClientLead[]> {
    return this.clients;
  }

  async findAllIncoming(): Promise<IncomingHandoff[]> {
    return this.incoming;
  }

  async createClient(dto: CreateClientDto): Promise<ClientLead> {
    const newClient: ClientLead = {
      id: `CID-${Math.floor(10000 + Math.random() * 90000)}`,
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
    };
    this.clients.push(newClient);
    return newClient;
  }

  async acceptHandoff(incomingId: string): Promise<ClientLead | null> {
    const handoff = this.incoming.find(i => i.id === incomingId);
    if (!handoff) return null;

    this.incoming = this.incoming.filter(i => i.id !== incomingId);

    const newClient: ClientLead = {
      id: handoff.id,
      company: handoff.company,
      industry: handoff.industry,
      phone: handoff.phone,
      email: handoff.email,
      priority: (handoff.priority as any) || "Medium",
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
    };

    this.clients.push(newClient);
    return newClient;
  }

  async clarifyHandoff(incomingId: string): Promise<boolean> {
    const handoff = this.incoming.find(i => i.id === incomingId);
    return !!handoff;
  }

  async rejectHandoff(incomingId: string): Promise<boolean> {
    const index = this.incoming.findIndex(i => i.id === incomingId);
    if (index === -1) return false;
    this.incoming.splice(index, 1);
    return true;
  }

  async updateClientStage(id: string, stage: number): Promise<ClientLead | null> {
    const client = this.clients.find(c => c.id === id);
    if (!client) return null;
    client.stage = stage;
    client.updatedDate = new Date().toISOString().replace("T", " ").slice(0, 16);
    return client;
  }

  async updateClientHealth(id: string, health: string): Promise<ClientLead | null> {
    const client = this.clients.find(c => c.id === id);
    if (!client) return null;
    client.clientHealth = health;
    client.updatedDate = new Date().toISOString().replace("T", " ").slice(0, 16);
    return client;
  }

  async addClientNote(id: string, note: string): Promise<ClientLead | null> {
    const client = this.clients.find(c => c.id === id);
    if (!client) return null;
    if (!client.notes) client.notes = [];
    client.notes.push(note);
    return client;
  }

  async addClientCall(id: string, call: string): Promise<ClientLead | null> {
    const client = this.clients.find(c => c.id === id);
    if (!client) return null;
    if (!client.calls) client.calls = [];
    client.calls.push(call);
    return client;
  }

  async addClientRequirement(id: string, item: any): Promise<ClientLead | null> {
    const client = this.clients.find(c => c.id === id);
    if (!client) return null;
    client.requirementsList.push(item);
    return client;
  }

  async findAllRequirements(): Promise<Requirement[]> {
    return this.requirements;
  }

  async createRequirement(dto: CreateRequirementDto): Promise<Requirement> {
    const newReq: Requirement = {
      id: `REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
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
    };
    this.requirements.push(newReq);
    return newReq;
  }

  async updateRequirement(id: string, dto: UpdateRequirementDto): Promise<Requirement | null> {
    const req = this.requirements.find(r => r.id === id);
    if (!req) return null;
    Object.assign(req, dto);
    return req;
  }

  async updateRequirementStatus(id: string, status: string): Promise<Requirement | null> {
    const req = this.requirements.find(r => r.id === id);
    if (!req) return null;
    req.status = status as any;
    return req;
  }

  async deleteRequirement(id: string): Promise<boolean> {
    const index = this.requirements.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.requirements.splice(index, 1);
    return true;
  }
}
