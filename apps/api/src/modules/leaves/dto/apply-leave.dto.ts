import { IsString, IsOptional, IsBoolean, IsArray } from "class-validator";

export class ApplyLeaveDto {
  @IsArray()
  @IsString({ each: true })
  leaveTypeIds!: string[];

  @IsString()
  startDate!: string;

  @IsString()
  endDate!: string;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  @IsOptional()
  @IsBoolean()
  isHalfDay?: boolean;

  @IsOptional()
  @IsString()
  halfDaySession?: string;
}
