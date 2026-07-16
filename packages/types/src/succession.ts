import { EmployeeProfile } from "./employee.types";

export interface CreateSuccessionPlanDto {
  roleTitle: string;
  incumbentId?: string;
  successorId: string;
  readinessLevel?: ReadinessLevel;
  gapAnalysis?: string;
  developmentPlan?: string;
}

export interface UpdateSuccessionPlanDto extends Partial<CreateSuccessionPlanDto> {}

export enum ReadinessLevel {
  READY_NOW = "READY_NOW",
  READY_1_YEAR = "READY_1_YEAR",
  READY_2_YEARS = "READY_2_YEARS",
  DEVELOPING = "DEVELOPING"
}

export interface SuccessionPlanDto {
  id: string;
  roleTitle: string;
  readinessLevel: ReadinessLevel;
  gapAnalysis: string | null;
  developmentPlan: string | null;
  updatedAt: Date;
  incumbentId: string | null;
  successorId: string | null;
  
  incumbent?: Partial<EmployeeProfile> | null;
  successor?: Partial<EmployeeProfile> & { designation?: { title: string } } | null;
}

