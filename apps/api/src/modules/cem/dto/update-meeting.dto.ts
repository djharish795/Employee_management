import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateMeetingDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  outcome?: string;

  @IsString()
  @IsOptional()
  nextAction?: string;

  @IsString()
  @IsOptional()
  nextFollowUpDate?: string;

  @IsString()
  @IsOptional()
  nextActionOwner?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  requirements?: string;

  @IsString()
  @IsOptional()
  concerns?: string;

  @IsString()
  @IsOptional()
  decisionMakers?: string;

  @IsBoolean()
  @IsOptional()
  handoffCompleted?: boolean;

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  time?: string;
}
