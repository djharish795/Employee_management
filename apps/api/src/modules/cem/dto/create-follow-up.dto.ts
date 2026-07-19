import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateFollowUpDto {
  @IsString()
  @IsNotEmpty()
  leadName!: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsNotEmpty()
  company!: string;

  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  currentStage!: string;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsString()
  @IsNotEmpty()
  nextAction!: string;

  @IsString()
  @IsNotEmpty()
  dueDate!: string;

  @IsString()
  @IsNotEmpty()
  priority!: string;

  @IsString()
  @IsOptional()
  lastNote?: string;
}
