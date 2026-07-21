import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';

export enum ReportPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export class CreateWorkReportDto {
  @IsString()
  reportType!: string;

  @IsString()
  title!: string;

  @IsEnum(ReportPriority)
  @IsOptional()
  priority?: ReportPriority;

  @IsObject()
  @IsOptional()
  content?: Record<string, any>;
}
