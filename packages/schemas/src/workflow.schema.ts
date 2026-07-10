import { z } from "zod";

export const workflowConditionalRuleSchema = z.object({
  field: z.string(),
  operator: z.enum(["EQUALS", "NOT_EQUALS", "GREATER_THAN", "LESS_THAN"]),
  value: z.any()
});

export const workflowStepSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  assigneeRole: z.enum(["MANAGER", "HR", "DEPARTMENT_HEAD", "SPECIFIC_USER"]),
  assigneeId: z.string().optional(),
  timeoutHours: z.number().int().min(0).default(48),
  onTimeout: z.enum(["ESCALATE_HR", "AUTO_APPROVE", "REJECT"]).default("ESCALATE_HR"),
  conditions: z.array(workflowConditionalRuleSchema).optional()
});

export const deployWorkflowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["LEAVE", "ASSET_REQUEST", "RECRUITMENT", "PROMOTION", "OFFBOARDING"]),
  steps: z.array(workflowStepSchema)
});
