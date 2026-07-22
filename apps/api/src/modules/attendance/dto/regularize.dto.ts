import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { RegularizationCorrectionType } from "@naprocs/database";

export class RegularizeDto {
  @IsDateString()
  @IsNotEmpty()
  attendanceDate!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason!: string;

  @IsEnum(RegularizationCorrectionType)
  @IsNotEmpty()
  correctionType!: RegularizationCorrectionType;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  attachmentName?: string;
}
