import { Injectable, Logger } from "@nestjs/common";
import { AuditRepository, CreateAuditLogData } from "./audit.repository";

export interface BaseAuditParams {
  moduleName: string;
  entityId: string;
  metadata?: any;
  /** Placeholder for future userId integration. Do not use for now per constraints. */
  actorId?: string;
}

export interface UpdateAuditParams extends BaseAuditParams {
  oldValue?: any;
  newValue?: any;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly auditRepository: AuditRepository) {}

  /**
   * Internal generic logging function.
   * Fails gracefully to never block a business process.
   */
  async createLog(data: CreateAuditLogData): Promise<void> {
    try {
      await this.auditRepository.create(data);
    } catch (error: any) {
      this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
    }
  }

  /**
   * Logs a CREATE action for an entity.
   */
  async logCreate(params: BaseAuditParams): Promise<void> {
    return this.createLog({
      action: "CREATE",
      actorId: params.actorId, // Placeholder for future use
      resource: params.moduleName,
      resourceId: params.entityId,
      newValue: params.metadata,
      requestId: "SYS", // Can be replaced by request context later
    });
  }

  /**
   * Logs an UPDATE action for an entity.
   */
  async logUpdate(params: UpdateAuditParams): Promise<void> {
    return this.createLog({
      action: "UPDATE",
      actorId: params.actorId, // Placeholder for future use
      resource: params.moduleName,
      resourceId: params.entityId,
      oldValue: params.oldValue,
      newValue: params.newValue || params.metadata,
      requestId: "SYS", // Can be replaced by request context later
    });
  }

  /**
   * Logs a DELETE action for an entity.
   */
  async logDelete(params: BaseAuditParams): Promise<void> {
    return this.createLog({
      action: "DELETE",
      actorId: params.actorId, // Placeholder for future use
      resource: params.moduleName,
      resourceId: params.entityId,
      oldValue: params.metadata,
      requestId: "SYS",
    });
  }

  /**
   * Logs a VIEW action for an entity or list.
   */
  async logView(params: BaseAuditParams): Promise<void> {
    return this.createLog({
      action: "VIEW",
      actorId: params.actorId, // Placeholder for future use
      resource: params.moduleName,
      resourceId: params.entityId,
      newValue: params.metadata,
      requestId: "SYS",
    });
  }

  /**
   * Logs an EXPORT action (e.g., downloading CSV/PDF).
   */
  async logExport(params: BaseAuditParams): Promise<void> {
    return this.createLog({
      action: "EXPORT",
      actorId: params.actorId, // Placeholder for future use
      resource: params.moduleName,
      resourceId: params.entityId,
      newValue: params.metadata,
      requestId: "SYS",
    });
  }

  async getRecentEvents(limit: number = 50, offset: number = 0) {
    const events = await this.auditRepository.getRecentEvents(limit, offset);

    return events.map((e) => ({
      id: e.id,
      timestamp: e.performedAt.toISOString(),
      actor: e.actor
        ? {
            id: e.actor.id,
            name: e.actor.preferredName || e.actor.personalEmail || "Unknown",
            email: e.actor.personalEmail,
            role: e.actor.designation?.title || "Employee",
          }
        : {
            id: e.actorId || "SYS",
            name: "System",
            email: "system@naprocs.com",
            role: "SYSTEM",
          },
      action: e.action,
      module: e.resource,
      target: { id: e.resourceId, name: e.resourceId, type: e.resource },
      status: e.action.includes("FAILED") || e.action.includes("ERROR") ? "FAILED" : "SUCCESS",
      ipAddress: e.ipAddress,
    }));
  }

  async getMetrics24h() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalEvents, failedLogins, dataExports, policyViolations] = await Promise.all([
      this.auditRepository.countEventsSince(oneDayAgo),
      this.auditRepository.countEventsSince(oneDayAgo, "LOGIN_FAILED"),
      this.auditRepository.countEventsSince(oneDayAgo, "DATA_EXPORTED"),
      this.auditRepository.countEventsSince(oneDayAgo, "VIOLATION"),
    ]);

    return {
      totalEvents24h: totalEvents,
      failedLogins24h: failedLogins,
      dataExports24h: dataExports,
      criticalWarnings24h: policyViolations,
    };
  }
}
