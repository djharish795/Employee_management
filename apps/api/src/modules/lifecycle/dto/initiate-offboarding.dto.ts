import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsDateString } from "class-validator";

export class InitiateOffboardingDto {
  @IsString()
  @IsNotEmpty()
  employeeId!: string;

  @IsDateString()
  @IsNotEmpty()
  resignationDate!: string;

  @IsDateString()
  @IsNotEmpty()
  lastWorkingDay!: string;

  @IsString()
  @IsNotEmpty()
  exitType!: string;

  @IsString()
  @IsOptional()
  exitReason?: string;

  @IsDateString()
  @IsOptional()
  accessRevocationDate?: string;

  @IsString()
  @IsOptional()
  ktAssigneeId?: string;

  @IsDateString()
  @IsOptional()
  ktTargetDate?: string;

  @IsDateString()
  @IsOptional()
  ffExpectedDate?: string;

  @IsBoolean()
  @IsOptional()
  generateLetters?: boolean;

  @IsDateString()
  @IsOptional()
  exitInterviewDate?: string;
}
