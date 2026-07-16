import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from "class-validator";
import { MeetType } from "@naprocs/database";

export class CreateMeetRequestDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;

  @IsEnum(MeetType)
  type!: MeetType;

  @IsString()
  @IsOptional()
  assigneeId?: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  linkedGoalId?: string;
}
