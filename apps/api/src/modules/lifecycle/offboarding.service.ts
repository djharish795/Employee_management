import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { InitiateOffboardingDto } from "./dto/initiate-offboarding.dto";
import { UpdateOffboardingDto } from "./dto/update-offboarding.dto";
import { UpdateChecklistItemDto } from "./dto/update-checklist-item.dto";
import { RecordInterviewDto } from "./dto/record-interview.dto";
import { GetOffboardingQueryDto } from "./dto/get-offboarding-query.dto";
import { getPaginationOptions, createPaginatedResponse } from "../../common/utils/pagination.util";

interface ChecklistItem {
  id: string;
  label: string;
  status: "completed" | "pending" | "scheduled" | "locked" | "pending_manager";
  text?: string;
}

import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class OffboardingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService
  ) {}

  async initiate(dto: InitiateOffboardingDto, actorId?: string): Promise<any> {
    // 1. Verify Employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employeeId },
      include: { offboardingRecord: true }
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${dto.employeeId} not found`);
    }

    if (employee.status === "EXITED") {
      throw new BadRequestException("Employee has already exited the organization");
    }

    if (employee.offboardingRecord) {
      throw new BadRequestException("Offboarding process has already been initiated for this employee");
    }

    // 2. Fetch assigned assets to populate recovery checklist
    const assignedAssets = await this.prisma.assetAssignment.findMany({
      where: { employeeId: dto.employeeId, returnedAt: null },
      include: { asset: true }
    });

    const assetChecklist: ChecklistItem[] = assignedAssets.map(assignment => ({
      id: assignment.id,
      label: `Recover ${assignment.asset.name} (S/N: ${assignment.asset.serialNumber})`,
      status: "pending",
      text: "Pending physical return"
    }));

    // Add a default badge recovery item if no assets are found, just to keep checklist interactive
    if (assetChecklist.length === 0) {
      assetChecklist.push({
        id: "default_badge",
        label: "Recover Access Badge & ID Card",
        status: "pending",
        text: "Collect physical cards"
      });
    }

    // ALSO: Create an OFFBOARDING AssetRequest to notify the Operations Manager
    // to recover these assets on their dashboard
    if (assignedAssets.length > 0) {
      const requestedItems = assignedAssets.map(a => ({
        assetId: a.asset.id,
        name: a.asset.name,
        category: a.asset.category,
        serialNumber: a.asset.serialNumber
      }));

      await this.prisma.assetRequest.create({
        data: {
          employeeId: dto.employeeId,
          requesterId: actorId || dto.employeeId,
          type: "OFFBOARDING",
          status: "PENDING_OM_SELECTION", // Send directly to OM
          reason: "Offboarding Asset Recovery",
          requestedItems: requestedItems as any,
        }
      });
    }

    // 3. Populate other checklists with standard/default items
    const deactivationChecklist: ChecklistItem[] = [
      { id: "revoke_slack", label: "Revoke Slack Account", status: "pending" },
      { id: "revoke_aws", label: "Revoke AWS & Cloud Accounts", status: "pending" },
      { id: "revoke_google", label: "Revoke Google Workspace & Email Access", status: "pending" }
    ];

    const settlementChecklist: ChecklistItem[] = [
      { id: "generate_relieving_letter", label: "Generate Relieving & Experience Letters", status: "pending" },
      { id: "final_salary_payout", label: "Process Final Settlement Payout (Full & Final)", status: "pending" },
      { id: "sign_clearance_form", label: "Sign Clearance Form", status: "pending" }
    ];

    const ktChecklist: ChecklistItem[] = [
      { id: "document_kt", label: "Document KT & Project Handover", status: "pending" },
      { id: "sign_off_kt", label: "KT Completion Sign-Off by Manager", status: "pending" }
    ];

    // 4. Perform DB updates in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Update Employee Status to NOTICE_PERIOD
      await tx.employee.update({
        where: { id: dto.employeeId },
        data: {
          status: "NOTICE_PERIOD",
          exitDate: new Date(dto.lastWorkingDay),
          exitReason: dto.exitReason || "Not Specified"
        }
      });

      // Create the OffboardingProcess record
      return tx.offboardingProcess.create({
        data: {
          employeeId: dto.employeeId,
          resignationDate: new Date(dto.resignationDate),
          lastWorkingDay: new Date(dto.lastWorkingDay),
          exitType: dto.exitType,
          exitReason: dto.exitReason,
          accessRevocationDate: dto.accessRevocationDate ? new Date(dto.accessRevocationDate) : null,
          ktAssigneeId: dto.ktAssigneeId || null,
          ktTargetDate: dto.ktTargetDate ? new Date(dto.ktTargetDate) : null,
          ffExpectedDate: dto.ffExpectedDate ? new Date(dto.ffExpectedDate) : null,
          generateLetters: dto.generateLetters !== undefined ? dto.generateLetters : true,
          exitInterviewDate: dto.exitInterviewDate ? new Date(dto.exitInterviewDate) : null,
          status: "IN_PROGRESS",
          assetChecklist: assetChecklist as any,
          deactivationChecklist: deactivationChecklist as any,
          settlementChecklist: settlementChecklist as any,
          ktChecklist: ktChecklist as any
        },
        include: {
          employee: { include: { designation: true, department: true } },
          ktAssignee: true
        }
      });
    });

    // 5. Create Audit Log
    await this.auditService.createLog({
      action: "OFFBOARDING_INITIATED",
      actorId,
      resource: "OffboardingProcess",
      resourceId: result.id,
      newValue: {
        employeeId: dto.employeeId,
        lastWorkingDay: dto.lastWorkingDay,
        exitType: dto.exitType
      }
    });

    const empName = employee.firstName ? `${employee.firstName} ${employee.lastName}` : employee.personalEmail;

    await this.notificationsService.notifyRole(
      'HR',
      'Offboarding Initiated',
      `Offboarding has been initiated for ${empName}. Please begin your checklist.`,
      'SYSTEM_ALERT',
      result.id
    );

    await this.notificationsService.notifyRole(
      'OM',
      'Offboarding Initiated - Action Required',
      `Offboarding has been initiated for ${empName}. Please collect their assets.`,
      'SYSTEM_ALERT',
      result.id
    );

    return result;
  }

  async findAll(query: GetOffboardingQueryDto): Promise<any> {
    const { skip, take, page, limit } = getPaginationOptions(query);

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.exitType) {
      where.exitType = query.exitType;
    }

    if (query.search) {
      where.OR = [
        {
          employeeId: {
            contains: query.search,
            mode: "insensitive"
          }
        },
        {
          employee: {
            OR: [
              {
                firstName: {
                  contains: query.search,
                  mode: "insensitive"
                }
              },
              {
                lastName: {
                  contains: query.search,
                  mode: "insensitive"
                }
              },
              {
                preferredName: {
                  contains: query.search,
                  mode: "insensitive"
                }
              }
            ]
          }
        }
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.offboardingProcess.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          employee: {
            select: {
              id: true,
              preferredName: true,
              firstName: true,
              lastName: true,
              personalEmail: true,
              status: true,
              department: { select: { name: true } },
              designation: { select: { title: true } }
            }
          },
          ktAssignee: {
            select: {
              id: true,
              preferredName: true,
              personalEmail: true
            }
          }
        }
      }),
      this.prisma.offboardingProcess.count({ where })
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string): Promise<any> {
    const record = await this.prisma.offboardingProcess.findFirst({
      where: {
        OR: [
          { id },
          { employeeId: id }
        ]
      },
      include: {
        employee: {
          select: {
            id: true,
            preferredName: true,
            firstName: true,
            lastName: true,
            personalEmail: true,
            status: true,
            department: { select: { name: true } },
            designation: { select: { title: true } }
          }
        },
        ktAssignee: {
          select: {
            id: true,
            preferredName: true,
            personalEmail: true
          }
        }
      }
    });

    if (!record) {
      throw new NotFoundException(`Offboarding process record for reference ${id} not found`);
    }

    return record;
  }

  async update(id: string, dto: UpdateOffboardingDto, actorId?: string): Promise<any> {
    const existing = await this.findOne(id);

    const updateData: any = {};
    if (dto.resignationDate) updateData.resignationDate = new Date(dto.resignationDate);
    if (dto.lastWorkingDay) updateData.lastWorkingDay = new Date(dto.lastWorkingDay);
    if (dto.exitType) updateData.exitType = dto.exitType;
    if (dto.exitReason) updateData.exitReason = dto.exitReason;
    if (dto.accessRevocationDate) updateData.accessRevocationDate = new Date(dto.accessRevocationDate);
    if (dto.ktAssigneeId) updateData.ktAssigneeId = dto.ktAssigneeId;
    if (dto.ktTargetDate) updateData.ktTargetDate = new Date(dto.ktTargetDate);
    if (dto.ffExpectedDate) updateData.ffExpectedDate = new Date(dto.ffExpectedDate);
    if (dto.generateLetters !== undefined) updateData.generateLetters = dto.generateLetters;
    if (dto.exitInterviewDate) updateData.exitInterviewDate = new Date(dto.exitInterviewDate);
    // REMOVED: if (dto.status) updateData.status = dto.status; // Prevent DTO injection bypass
    if (dto.assetChecklist) updateData.assetChecklist = dto.assetChecklist;
    if (dto.deactivationChecklist) updateData.deactivationChecklist = dto.deactivationChecklist;
    if (dto.settlementChecklist) updateData.settlementChecklist = dto.settlementChecklist;
    if (dto.ktChecklist) updateData.ktChecklist = dto.ktChecklist;

    const result = await this.prisma.$transaction(async (tx) => {
      // Sync dates back to Employee record if modified
      if (dto.lastWorkingDay || dto.exitReason) {
        await tx.employee.update({
          where: { id: existing.employeeId },
          data: {
            exitDate: dto.lastWorkingDay ? new Date(dto.lastWorkingDay) : undefined,
            exitReason: dto.exitReason ? dto.exitReason : undefined
          }
        });
      }

      // Check if asset recovery returnedAt should be updated on AssetAssignment model
      if (dto.assetChecklist) {
        const existingAssets: ChecklistItem[] = (existing.assetChecklist as any) || [];
        const newlyCompletedIds: string[] = [];

        for (const item of dto.assetChecklist) {
          const prev = existingAssets.find(a => a.id === item.id);
          if (item.status === "completed" && prev && prev.status !== "completed") {
            newlyCompletedIds.push(String(item.id));
          }
        }

        if (newlyCompletedIds.length > 0) {
          const assignments = await tx.assetAssignment.findMany({
            where: { id: { in: newlyCompletedIds } },
            select: { id: true, assetId: true }
          });
          
          const validAssignmentIds = assignments.map(a => a.id);
          const assetIds = assignments.map(a => a.assetId);

          if (validAssignmentIds.length > 0) {
            await tx.assetAssignment.updateMany({
              where: { id: { in: validAssignmentIds } },
              data: {
                returnedAt: new Date(),
                returnedCondition: "GOOD"
              }
            });

            await tx.asset.updateMany({
              where: { id: { in: assetIds } },
              data: { status: "AVAILABLE" }
            });
          }
        }
      }

      // Evaluate completion status
      const currentAssetList = dto.assetChecklist || (existing.assetChecklist as any) || [];
      const currentDeactivationList = dto.deactivationChecklist || (existing.deactivationChecklist as any) || [];
      const currentSettlementList = dto.settlementChecklist || (existing.settlementChecklist as any) || [];
      const currentKtList = dto.ktChecklist || (existing.ktChecklist as any) || [];

      const assetsComplete = currentAssetList.every((i: any) => i.status === "completed");
      const accountsComplete = currentDeactivationList.every((i: any) => i.status === "completed");
      const settlementsComplete = currentSettlementList.every((i: any) => i.status === "completed");
      const ktComplete = currentKtList.every((i: any) => i.status === "completed");

      const allComplete = assetsComplete && accountsComplete && settlementsComplete && ktComplete;

      return tx.offboardingProcess.update({
        where: { id: existing.id },
        data: updateData,
        include: {
          employee: { include: { designation: true, department: true } },
          ktAssignee: true
        }
      });
    });

    await this.auditService.createLog({
      action: "OFFBOARDING_UPDATED",
      actorId,
      resource: "OffboardingProcess",
      resourceId: existing.id,
      oldValue: existing,
      newValue: result
    });

    return result;
  }

  async updateChecklistItem(id: string, dto: UpdateChecklistItemDto, actorId?: string): Promise<any> {
    const existing = await this.findOne(id);
    
    // Parse target checklist section
    let list: ChecklistItem[] = [];
    if (dto.section === "assetRecovery") {
      list = (existing.assetChecklist as any) || [];
    } else if (dto.section === "accountDeactivation") {
      list = (existing.deactivationChecklist as any) || [];
    } else if (dto.section === "finalSettlement") {
      list = (existing.settlementChecklist as any) || [];
    } else if (dto.section === "knowledgeTransfer") {
      list = (existing.ktChecklist as any) || [];
    }

    const item = list.find(i => i.id === dto.itemId);
    if (!item) {
      throw new NotFoundException(`Checklist item with ID ${dto.itemId} not found in section ${dto.section}`);
    }

    const previousStatus = item.status;
    item.status = dto.status;

    // Check if asset recovery returnedAt should be updated on AssetAssignment model
    if (dto.section === "assetRecovery" && dto.status === "completed" && previousStatus !== "completed") {
      // Try to log asset return in asset_assignments table if itemId is a valid cuid
      try {
        const assignment = await this.prisma.assetAssignment.findUnique({ where: { id: dto.itemId } });
        if (assignment) {
          await this.prisma.$transaction(async (tx) => {
            await tx.assetAssignment.update({
              where: { id: dto.itemId },
              data: {
                returnedAt: new Date(),
                returnedCondition: "GOOD"
              }
            });
            await tx.asset.update({
              where: { id: assignment.assetId },
              data: { status: "AVAILABLE" }
            });
          });
        }
      } catch (e) {
        // Fallback for custom checklist items (like access badges)
      }
    }

    // Save updated checklists
    const updateData: any = {};
    if (dto.section === "assetRecovery") updateData.assetChecklist = list;
    else if (dto.section === "accountDeactivation") updateData.deactivationChecklist = list;
    else if (dto.section === "finalSettlement") updateData.settlementChecklist = list;
    else if (dto.section === "knowledgeTransfer") updateData.ktChecklist = list;

    // Fetch updated process to evaluate completion status
    let updatedProcess = await this.prisma.offboardingProcess.update({
      where: { id: existing.id },
      data: updateData
    });

    // Note: We no longer auto-finalize. The frontend must explicitly call /finalize

    await this.auditService.createLog({
      action: "OFFBOARDING_CHECKLIST_UPDATED",
      actorId,
      resource: "OffboardingProcess",
      resourceId: existing.id,
      newValue: {
        section: dto.section,
        itemId: dto.itemId,
        status: dto.status
      }
    });

    return updatedProcess;
  }

  async recordInterview(id: string, dto: RecordInterviewDto, actorId?: string): Promise<any> {
    const existing = await this.findOne(id);
    const now = new Date();

    const result = await this.prisma.offboardingProcess.update({
      where: { id: existing.id },
      data: {
        exitInterviewDate: now,
        exitReason: dto.feedback ? (existing.exitReason ? `${existing.exitReason}\n\n[Interview Feedback]: ${dto.feedback}` : `[Interview Feedback]: ${dto.feedback}`) : existing.exitReason
      },
      include: {
        employee: { include: { designation: true, department: true } },
        ktAssignee: true
      }
    });

    await this.auditService.createLog({
      action: "OFFBOARDING_INTERVIEW_RECORDED",
      actorId,
      resource: "OffboardingProcess",
      resourceId: existing.id,
      newValue: {
        exitInterviewDate: now,
        feedback: dto.feedback
      }
    });

    return result;
  }
  async cancel(id: string, reason: string, actorId?: string): Promise<any> {
    const existing = await this.findOne(id);

    if (existing.status === "COMPLETED") {
      throw new BadRequestException("Cannot cancel an already completed offboarding process");
    }
    if (existing.status === "CANCELLED") {
      throw new BadRequestException("Offboarding process is already cancelled");
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Revert Employee status if they haven't exited
      if (existing.employee.status !== "EXITED") {
        await tx.employee.update({
          where: { id: existing.employeeId },
          data: {
            status: "ACTIVE",
            exitDate: null,
            exitReason: null
          }
        });
      }

      // 2. Set OffboardingProcess status to CANCELLED
      return tx.offboardingProcess.update({
        where: { id: existing.id },
        data: {
          status: "CANCELLED",
          exitReason: `Cancelled: ${reason}`
        },
        include: {
          employee: { include: { designation: true, department: true } },
          ktAssignee: true
        }
      });
    });

    await this.auditService.createLog({
      action: "OFFBOARDING_CANCELLED",
      actorId,
      resource: "OffboardingProcess",
      resourceId: existing.id,
      newValue: {
        reason,
        status: "CANCELLED"
      }
    });

    return result;
  }

  async finalize(id: string, actorId?: string): Promise<any> {
    const existing = await this.findOne(id);
    
    if (existing.status === "COMPLETED") {
      throw new BadRequestException("Offboarding is already completed");
    }

    // Asset Check Verification: Ensure all assets are returned before finalizing
    const assetChecklist: ChecklistItem[] = (existing.assetChecklist as any) || [];
    const hasPendingAssets = assetChecklist.some(item => item.status !== 'completed');
    if (hasPendingAssets) {
      throw new BadRequestException("Cannot finalize offboarding: All assigned assets must be recovered first.");
    }

    const updatedProcess = await this.prisma.$transaction(async (tx) => {
      // Set Employee status to EXITED
      await tx.employee.update({
        where: { id: existing.employeeId },
        data: { status: "EXITED" }
      });
      // Suspend User login access
      await tx.user.updateMany({
        where: { employeeId: existing.employeeId },
        data: { status: "SUSPENDED" }
      });

      // Set process to completed
      return tx.offboardingProcess.update({
        where: { id: existing.id },
        data: { status: "COMPLETED" }
      });
    });

    await this.auditService.createLog({
      action: "OFFBOARDING_FINALIZED",
      actorId,
      resource: "OffboardingProcess",
      resourceId: existing.id
    });

    return updatedProcess;
  }
}
