import { IsNotEmpty, IsString, IsOptional, IsDateString } from "class-validator";

export class CreateFieldWorkRequestDto {
  @IsNotEmpty()
  @IsDateString()
  date!: string;

  @IsNotEmpty()
  @IsString()
  startTime!: string;

  @IsNotEmpty()
  @IsString()
  endTime!: string;

  @IsNotEmpty()
  @IsString()
  destination!: string;

  @IsOptional()
  @IsString()
  client?: string;

  @IsNotEmpty()
  @IsString()
  purpose!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsNotEmpty()
  @IsString()
  transportation!: string;

  @IsNotEmpty()
  @IsString()
  returnTime!: string;

  @IsNotEmpty()
  @IsString()
  contact!: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  objectKey?: string;

  @IsOptional()
  @IsString()
  status?: string; // 'Draft' or 'Submitted' or 'DRAFT' or 'PENDING'
}
