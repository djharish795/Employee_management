import { z } from "zod";

export const CreateSuccessionPlanSchema = z.object({
  roleTitle: z.string().min(1, "Role title is required"),
  incumbentId: z.string().cuid().optional(),
  successorId: z.string().cuid("Valid successor ID is required").optional(),
  readinessLevel: z.enum(["READY_NOW", "READY_1_YEAR", "READY_2_YEARS", "DEVELOPING"]).default("DEVELOPING"),
  gapAnalysis: z.string().optional(),
  developmentPlan: z.string().optional(),
});

export const UpdateSuccessionPlanSchema = CreateSuccessionPlanSchema.partial();
