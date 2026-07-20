import { IsString, IsOptional, IsEnum, IsISO8601 } from "class-validator";
import { MeetStatus } from "@naprocs/database";


export class UpdateMeetDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsISO8601()
  startTime?: string;

  @IsOptional()
  @IsISO8601()
  endTime?: string;

  @IsOptional()
  @IsEnum(MeetStatus)
  status?: MeetStatus;

  @IsOptional()
  @IsString()
  agenda?: string;
}
