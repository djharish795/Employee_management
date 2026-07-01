import { IsString } from "class-validator";

export class ApplyLeaveDto {
  @IsString()
  employeeId!: string;

  @IsString()
  leaveTypeId!: string;

  @IsString()
  startDate!: string;

  @IsString()
  endDate!: string;

  @IsString()
  reason!: string;

  @IsString()
  attachmentUrl?: string;

  isHalfDay?: boolean;
}
