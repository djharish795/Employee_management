import { IsString, IsOptional, IsBoolean, IsArray, Matches, IsUrl } from "class-validator";

export class ApplyLeaveDto {
  @IsArray()
  @IsString({ each: true })
  leaveTypeIds!: string[];

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be exactly in YYYY-MM-DD format (no time or timezone offset allowed).' })
  startDate!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be exactly in YYYY-MM-DD format (no time or timezone offset allowed).' })
  endDate!: string;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsUrl({
    require_protocol: true,
    protocols: ['https'],
    host_whitelist: [/\.amazonaws\.com$/]
  }, { message: 'Attachment URL must be a valid HTTPS link to an AWS S3 bucket.' })
  attachmentUrl?: string;

  @IsOptional()
  @IsBoolean()
  isHalfDay?: boolean;

  @IsOptional()
  @IsString()
  halfDaySession?: string;
}
