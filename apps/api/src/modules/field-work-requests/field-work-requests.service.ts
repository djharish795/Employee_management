import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { NotificationsService } from "../notifications/notifications.service";
import { CreateFieldWorkRequestDto } from "./dto/create-field-work-request.dto";
import { UpdateFieldWorkRequestDto } from "./dto/update-field-work-request.dto";
import { encryptData, decryptData } from "../../common/utils/encrypt.util";
import { Permission, UserRole } from "@naprocs/types";
import PDFDocument from "pdfkit";

@Injectable()
export class FieldWorkRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(employeeId: string, dto: CreateFieldWorkRequestDto, ipAddress: string): Promise<any> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      select: { id: true, reportingManagerId: true },
    });

    if (!employee) {
      throw new NotFoundException("Employee profile not found");
    }

    const isDraft = dto.status === "Draft" || dto.status === "DRAFT";
    const statusVal = isDraft ? "DRAFT" : "PENDING";

    // Encrypt personal phone contact details per DPDPA requirements
    const encryptedContact = encryptData(dto.contact);

    const approverId = await this.resolveApproverId(employeeId);

    const request = await this.prisma.$transaction(async (tx) => {
      // Create ConsentLog BEFORE saving PII if it's a submission (DPDPA compliance)
      if (!isDraft) {
        await tx.consentLog.create({
          data: {
            employeeId,
            collectedById: employeeId,
            purpose: "Field Work Request Submission",
            ipAddress: ipAddress || "0.0.0.0",
          },
        });
      }

      return tx.fieldWorkRequest.create({
        data: {
          employeeId,
          approverId, // Route properly using our resolver
          date: new Date(dto.date),
          startTime: dto.startTime,
          endTime: dto.endTime,
          destination: dto.destination,
          client: dto.client || null,
          purpose: dto.purpose,
          description: dto.description,
          transportation: dto.transportation,
          returnTime: dto.returnTime,
          contact: encryptedContact,
          remarks: dto.remarks || null,
          fileName: dto.fileName || null,
          objectKey: dto.objectKey || null,
          status: statusVal,
        },
      });
    });

    // Write audit log entry (CREATE action)
    await this.auditService.logCreate({
      moduleName: "FieldWorkRequest",
      entityId: request.id,
      actorId: employeeId,
      metadata: { action: isDraft ? "SAVE_DRAFT" : "SUBMIT_REQUEST", date: dto.date, destination: dto.destination },
    });

    return this.decryptRequest(request);
  }

  async getMyRequests(employeeId: string): Promise<any[]> {
    const requests = await this.prisma.fieldWorkRequest.findMany({
      where: { employeeId },
      orderBy: { createdAt: "desc" },
    });

    return requests.map(req => this.decryptRequest(req));
  }

  async getTeamApprovals(approverId: string): Promise<any[]> {
    const requests = await this.prisma.fieldWorkRequest.findMany({
      where: {
        approverId,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            department: { select: { name: true } },
            reportingManager: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return requests.map(req => {
      const decrypted = this.decryptRequest(req);
      const emp = req.employee;
      const fName = `${emp.firstName || ""} ${emp.lastName || ""}`.trim();
      const mName = emp.reportingManager
        ? `${emp.reportingManager.firstName || ""} ${emp.reportingManager.lastName || ""}`.trim()
        : "Not Assigned";

      return {
        ...decrypted,
        employeeName: fName,
        employeeId: emp.employeeId,
        department: emp.department?.name || "Operations",
        reportingManager: mName,
      };
    });
  }

  async getRequestDetails(id: string, loggedInEmployeeId: string, role: string): Promise<any> {
    const request = await this.prisma.fieldWorkRequest.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            department: { select: { name: true } },
            reportingManager: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException("Field work request not found");
    }

    const isOwner = request.employeeId === loggedInEmployeeId;
    const isApprover = request.approverId === loggedInEmployeeId;
    const isOpsAdmin = role === UserRole.OPERATIONS_HEAD || role === UserRole.OM || role === UserRole.CEM;

    if (!isOwner && !isApprover && !isOpsAdmin) {
      throw new ForbiddenException("You are not authorized to view this request");
    }

    const decrypted = this.decryptRequest(request);
    const emp = request.employee;
    const fName = `${emp.firstName || ""} ${emp.lastName || ""}`.trim();
    const mName = emp.reportingManager
      ? `${emp.reportingManager.firstName || ""} ${emp.reportingManager.lastName || ""}`.trim()
      : "Not Assigned";

    return {
      ...decrypted,
      employeeName: fName,
      employeeId: emp.employeeId,
      department: emp.department?.name || "Operations",
      reportingManager: mName,
    };
  }

  async update(id: string, employeeId: string, dto: UpdateFieldWorkRequestDto, ipAddress: string): Promise<any> {
    const request = await this.prisma.fieldWorkRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException("Request not found");
    }

    if (request.employeeId !== employeeId) {
      throw new ForbiddenException("You can only modify your own requests");
    }

    const updateData: any = {};

    if (dto.status === "CANCELLED") {
      if (request.status !== "PENDING" && request.status !== "DRAFT") {
        throw new BadRequestException("Only pending or draft requests can be cancelled");
      }
      updateData.status = "CANCELLED";
    } else {
      if (request.status !== "DRAFT") {
        throw new BadRequestException("Only draft requests can be edited");
      }

      if (dto.date) updateData.date = new Date(dto.date);
      if (dto.startTime) updateData.startTime = dto.startTime;
      if (dto.endTime) updateData.endTime = dto.endTime;
      if (dto.destination) updateData.destination = dto.destination;
      if (dto.client !== undefined) updateData.client = dto.client;
      if (dto.purpose) updateData.purpose = dto.purpose;
      if (dto.description) updateData.description = dto.description;
      if (dto.transportation) updateData.transportation = dto.transportation;
      if (dto.returnTime) updateData.returnTime = dto.returnTime;
      if (dto.remarks !== undefined) updateData.remarks = dto.remarks;
      if (dto.fileName !== undefined) updateData.fileName = dto.fileName;
      if (dto.objectKey !== undefined) updateData.objectKey = dto.objectKey;

      if (dto.contact) {
        updateData.contact = encryptData(dto.contact);
      }

      if (dto.status === "PENDING") {
        updateData.status = "PENDING";
        updateData.approverId = await this.resolveApproverId(employeeId);
        
        // Consent log for transitioning from Draft to Submitted
        await this.prisma.consentLog.create({
          data: {
            employeeId,
            collectedById: employeeId,
            purpose: "Field Work Request Submission (from draft)",
            ipAddress: ipAddress || "0.0.0.0",
          },
        });
      }
    }

    const updated = await this.prisma.fieldWorkRequest.update({
      where: { id },
      data: updateData,
    });

    await this.auditService.logUpdate({
      moduleName: "FieldWorkRequest",
      entityId: id,
      actorId: employeeId,
      oldValue: { status: request.status },
      newValue: { status: updated.status, action: "UPDATE_REQUEST" },
    });

    return this.decryptRequest(updated);
  }

  async approve(id: string, approverId: string, role: string): Promise<any> {
    const request = await this.prisma.fieldWorkRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException("Request not found");
    }

    if (request.status !== "PENDING") {
      throw new BadRequestException("Request is not in a pending review state");
    }

    if (request.employeeId === approverId) {
      throw new ForbiddenException("Self-approval is strictly prohibited.");
    }

    const isDirectManager = request.approverId === approverId;
    const isOpsAdmin = role === UserRole.OPERATIONS_HEAD || role === UserRole.OM || role === UserRole.CEM;

    if (!isDirectManager && !isOpsAdmin) {
      throw new ForbiddenException("You are not authorized to approve this request");
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const req = await tx.fieldWorkRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          approverId,
        },
      });

      // Synchronize into attendance record
      await tx.attendanceRecord.upsert({
        where: {
          employeeId_date: {
            employeeId: req.employeeId,
            date: req.date,
          },
        },
        update: { status: "PRESENT" },
        create: {
          employeeId: req.employeeId,
          date: req.date,
          status: "PRESENT",
        },
      });

      return req;
    });

    await this.auditService.logApprove({
      moduleName: "FieldWorkRequest",
      entityId: id,
      actorId: approverId,
      metadata: { action: "APPROVE_REQUEST" },
    });

    // Notify the submitter that their request was approved
    await this.notificationsService.createNotification(
      request.employeeId,
      'Field Work Request Approved ✅',
      `Your field visit request to "${request.destination}" on ${new Date(request.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} has been approved.`,
      'SYSTEM_ALERT' as any,
    );

    return this.decryptRequest(updated);
  }

  async reject(id: string, approverId: string, role: string, reason: string): Promise<any> {
    const request = await this.prisma.fieldWorkRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException("Request not found");
    }

    if (request.status !== "PENDING") {
      throw new BadRequestException("Request is not in a pending review state");
    }

    if (request.employeeId === approverId) {
      throw new ForbiddenException("Self-rejection is strictly prohibited.");
    }

    const isDirectManager = request.approverId === approverId;
    const isOpsAdmin = role === UserRole.OPERATIONS_HEAD || role === UserRole.OM || role === UserRole.CEM;

    if (!isDirectManager && !isOpsAdmin) {
      throw new ForbiddenException("You are not authorized to reject this request");
    }

    const updated = await this.prisma.fieldWorkRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectionReason: reason || "Rejected by Manager",
        approverId,
      },
    });

    await this.auditService.logReject({
      moduleName: "FieldWorkRequest",
      entityId: id,
      actorId: approverId,
      metadata: { action: "REJECT_REQUEST", reason },
    });

    // Notify the submitter that their request was rejected
    await this.notificationsService.createNotification(
      request.employeeId,
      'Field Work Request Rejected ❌',
      `Your field visit request to "${request.destination}" has been rejected. Reason: ${reason || 'No reason provided'}.`,
      'SYSTEM_ALERT' as any,
    );

    return this.decryptRequest(updated);
  }

  private decryptRequest(request: any): any {
    if (!request) return request;
    return {
      ...request,
      contact: request.contact ? decryptData(request.contact) : "",
    };
  }

  async delete(id: string, employeeId: string): Promise<any> {
    const request = await this.prisma.fieldWorkRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException("Request not found");
    }

    if (request.employeeId !== employeeId) {
      throw new ForbiddenException("You can only delete your own requests");
    }

    if (request.status !== "DRAFT" && request.status !== "CANCELLED") {
      throw new BadRequestException("Only draft and cancelled requests can be deleted. Approved, rejected, and pending requests must remain in audit history.");
    }

    await this.prisma.fieldWorkRequest.delete({
      where: { id },
    });

    // Write audit log entry (DELETE action)
    await this.auditService.logDelete({
      moduleName: "FieldWorkRequest",
      entityId: id,
      actorId: employeeId,
      metadata: { action: "DELETE_REQUEST", status: request.status },
    });

    return { success: true, message: "Request deleted successfully" };
  }

  async generatePdf(id: string, employeeId: string, role: string): Promise<Buffer> {
    const request = await this.getRequestDetails(id, employeeId, role);
    
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => resolve(Buffer.concat(buffers)));

        // Title Header
        doc.fontSize(22).font("Helvetica-Bold").text("Field Work Request Details", { align: "center" });
        doc.moveDown();
        doc.strokeColor("#cbd5e1").lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1.5);

        // General Information Table/Grid
        doc.fontSize(11).font("Helvetica-Bold").text("General Information", { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).font("Helvetica");
        doc.text(`Request ID: ${request.id}`);
        doc.text(`Status: ${request.status}`);
        doc.text(`Created Date: ${new Date(request.createdAt).toLocaleString()}`);
        doc.text(`Requester: ${request.employeeName} (${request.employeeId})`);
        doc.text(`Department: ${request.department}`);
        doc.text(`Reporting Manager: ${request.reportingManager}`);
        doc.moveDown();

        // Visit Logistics
        doc.fontSize(11).font("Helvetica-Bold").text("Visit Logistics", { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).font("Helvetica");
        doc.text(`Client / Organization: ${request.client || "Unspecified"}`);
        doc.text(`Destination: ${request.destination}`);
        doc.text(`Date of Visit: ${new Date(request.date).toLocaleDateString()}`);
        doc.text(`Time Duration: ${request.startTime} - ${request.endTime} (Expected Return: ${request.returnTime})`);
        doc.text(`Transportation: ${request.transportation} Transport`);
        doc.text(`On-site Contact: ${request.contact || "N/A"}`);
        doc.moveDown();

        // Purpose & Description
        doc.fontSize(11).font("Helvetica-Bold").text("Purpose & Scope of Work", { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).font("Helvetica");
        doc.text(`Purpose: ${request.purpose}`);
        doc.moveDown(0.5);
        doc.font("Helvetica-Bold").text("Work Description:");
        doc.font("Helvetica").text(request.description, { width: 500, align: "justify" });
        doc.moveDown();

        // Remarks / Reason
        if (request.remarks) {
          doc.text(`Remarks: ${request.remarks}`);
        }
        if (request.rejectionReason) {
          doc.text(`Rejection Reason: ${request.rejectionReason}`);
        }
        if (request.approvedAt) {
          doc.text(`Approved At: ${new Date(request.approvedAt).toLocaleString()}`);
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  private async resolveApproverId(employeeId: string): Promise<string | null> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        reportingManager: {
          include: { user: true }
        },
        user: true
      }
    });

    if (!employee) {
      throw new NotFoundException("Employee profile not found");
    }

    const requesterRole = employee.user?.role;
    let manager = employee.reportingManager;

    // Prevent self-approval (if reporting manager is same as employee, reset to null)
    if (manager && manager.id === employeeId) {
      manager = null;
    }

    // Operations Manager (OM or Operations Head) -> Operations Head / CEO / Admin
    if (requesterRole === UserRole.OM || requesterRole === UserRole.OPERATIONS_HEAD || requesterRole === UserRole.CEM) {
      // Find an Operations Head, CEO, or Super Admin who is NOT the requester
      const adminUser = await this.prisma.user.findFirst({
        where: {
          role: { in: [UserRole.OPERATIONS_HEAD, UserRole.CEO, UserRole.SUPER_ADMIN] },
          AND: [
            { employeeId: { not: employeeId } },
            { employeeId: { not: null } }
          ]
        },
        select: { employeeId: true }
      });
      return adminUser?.employeeId || null;
    }

    // Team Lead -> Manager
    if (requesterRole === UserRole.TEAM_LEAD) {
      if (manager && (manager.user?.role === UserRole.MANAGER || manager.user?.role === UserRole.OM || manager.user?.role === UserRole.OPERATIONS_HEAD || manager.user?.role === UserRole.CEM)) {
        return manager.id;
      }
      // Fallback: Find any Manager or OM
      const managerUser = await this.prisma.user.findFirst({
        where: {
          role: { in: [UserRole.MANAGER, UserRole.OM, UserRole.OPERATIONS_HEAD, UserRole.CEO, UserRole.CEM] },
          AND: [
            { employeeId: { not: employeeId } },
            { employeeId: { not: null } }
          ]
        },
        select: { employeeId: true }
      });
      return managerUser?.employeeId || null;
    }

    // Default Employee / OE -> Team Lead
    if (manager) {
      return manager.id;
    }

    // If no manager is assigned, fallback to Operations Head / CEO / Super Admin
    const fallbackUser = await this.prisma.user.findFirst({
      where: {
        role: { in: [UserRole.OPERATIONS_HEAD, UserRole.CEO, UserRole.SUPER_ADMIN] },
        AND: [
          { employeeId: { not: employeeId } },
          { employeeId: { not: null } }
        ]
      },
      select: { employeeId: true }
    });
    return fallbackUser?.employeeId || null;
  }

  private sanitizeCsvField(value: string | null | undefined): string {
    let val = value || '';
    if (/^[=\-+\@\t\r]/.test(val)) {
      val = "'" + val;
    }
    return `"${val.replace(/"/g, '""')}"`;
  }

  async exportCsv(employeeId: string, role?: string, startDateStr?: string, endDateStr?: string): Promise<string> {
    const isApprover = role === UserRole.OM || role === UserRole.MANAGER || role === UserRole.OPERATIONS_HEAD || role === UserRole.SUPER_ADMIN || role === UserRole.CEM;

    let startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // default to last 30 days
    let endDate = new Date();

    if (startDateStr) startDate = new Date(startDateStr);
    if (endDateStr) endDate = new Date(endDateStr);

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 90) {
      throw new BadRequestException("Export date range cannot exceed 90 days to prevent resource exhaustion");
    }

    const whereClause: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      }
    };

    if (isApprover) {
      whereClause.OR = [{ employeeId }, { approverId: employeeId }];
    } else {
      whereClause.employeeId = employeeId;
    }

    const requests = await this.prisma.fieldWorkRequest.findMany({
      where: whereClause,
      include: {
        employee: { select: { firstName: true, lastName: true, employeeId: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = ["ID", "Employee Name", "Employee ID", "Date", "Destination", "Client", "Purpose", "Status", "Created At"];
    const rows = requests.map((req) => [
      req.id,
      `"${req.employee?.firstName || ''} ${req.employee?.lastName || ''}"`.trim(),
      req.employee?.employeeId || '',
      req.date ? req.date.toISOString().split("T")[0] : '',
      this.sanitizeCsvField(req.destination),
      this.sanitizeCsvField(req.client),
      this.sanitizeCsvField(req.purpose),
      req.status,
      req.createdAt ? req.createdAt.toISOString() : '',
    ]);

    await this.auditService.logExport({
      moduleName: "FieldWorkRequest",
      actorId: employeeId,
      entityId: "BULK_EXPORT",
      metadata: { action: "BULK_EXPORT", rowCount: requests.length, filters: { startDate, endDate } },
    });

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }

}

