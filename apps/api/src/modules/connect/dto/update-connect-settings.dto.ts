import { IsBoolean, IsOptional, IsString, IsNumber } from "class-validator";

export class UpdateConnectSettingsDto {
  @IsOptional()
  @IsBoolean()
  googleCalendarConnected?: boolean;

  @IsOptional()
  @IsString()
  workingHoursStart?: string;

  @IsOptional()
  @IsString()
  workingHoursEnd?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsNumber()
  bufferMinutes?: number;

  @IsOptional()
  @IsNumber()
  minNoticeHours?: number;

  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  systemNotifications?: boolean;
}
