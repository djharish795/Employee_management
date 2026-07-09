import { z } from "zod";

export const initiateOffboardingSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  resignationDate: z.string().min(1, "Resignation Date is required"),
  lastWorkingDay: z.string().min(1, "Last Working Day is required"),
  exitType: z.string().min(1, "Exit Type is required"),
  exitReason: z.string().optional(),
  accessRevocationDate: z.string().optional(),
  ktAssigneeId: z.string().optional(),
  ktTargetDate: z.string().optional(),
  ffExpectedDate: z.string().optional(),
  generateLetters: z.boolean().optional(),
  exitInterviewDate: z.string().optional(),
});

export const updateOffboardingSchema = z.object({
  resignationDate: z.string().optional(),
  lastWorkingDay: z.string().optional(),
  exitType: z.string().optional(),
  exitReason: z.string().optional(),
  accessRevocationDate: z.string().optional(),
  ktAssigneeId: z.string().optional(),
  ktTargetDate: z.string().optional(),
  ffExpectedDate: z.string().optional(),
  generateLetters: z.boolean().optional(),
  exitInterviewDate: z.string().optional(),
  status: z.enum(["IN_PROGRESS", "NOTICE_PERIOD", "COMPLETED", "CANCELLED"]).optional(),
  assetChecklist: z.any().optional(),
  deactivationChecklist: z.any().optional(),
  settlementChecklist: z.any().optional(),
  ktChecklist: z.any().optional(),
});

export const updateChecklistItemSchema = z.object({
  section: z.enum(["assetRecovery", "accountDeactivation", "finalSettlement", "knowledgeTransfer"]),
  itemId: z.string().min(1, "Item ID is required"),
  status: z.enum(["completed", "pending", "scheduled", "locked", "pending_manager"]),
});

export const recordInterviewSchema = z.object({
  feedback: z.string().min(1, "Feedback is required"),
});

export const cancelOffboardingSchema = z.object({
  reason: z.string().min(1, "Cancellation reason is required"),
});
