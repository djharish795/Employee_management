import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { AuditService } from "../audit/audit.service";
import { CrmRepository } from "./crm.repository";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { CreateRequirementDto } from "./dto/create-requirement.dto";
import { UpdateRequirementDto } from "./dto/update-requirement.dto";

@Injectable()
export class CrmService {
  private readonly logger = new Logger(CrmService.name);

  constructor(
    private readonly repository: CrmRepository,
    private readonly auditService: AuditService
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
}
