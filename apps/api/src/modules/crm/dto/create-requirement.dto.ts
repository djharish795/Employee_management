import { IsNotEmpty, IsString, IsOptional, IsArray } from "class-validator";

export class CreateRequirementDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  clientName!: string;

  @IsOptional()
  @IsString()
  module?: string;

  @IsOptional()
  @IsString()
  priority?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

  @IsOptional()
  @IsString()
  status?: "Draft" | "In Review" | "Awaiting Client" | "Approved" | "Rejected";

  @IsOptional()
  @IsString()
  category?: "Functional" | "Technical" | "Integration" | "Reporting" | "Security" | "Compliance";

  @IsOptional()
  @IsString()
  businessNeed?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  expectedDelivery?: string;

  @IsOptional()
  @IsString()
  clientNotes?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;

  @IsOptional()
  @IsString()
  owner?: string;

  @IsOptional()
  @IsArray()
  dependencies?: any[];

  @IsOptional()
  @IsArray()
  attachments?: string[];

  @IsOptional()
  @IsArray()
  timeline?: any[];

  @IsOptional()
  @IsString()
  clientLeadId?: string;
}
