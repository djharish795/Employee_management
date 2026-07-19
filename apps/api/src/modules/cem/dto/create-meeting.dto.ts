import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateMeetingDto {
  @IsString()
  @IsNotEmpty()
  client!: string;

  @IsString()
  @IsNotEmpty()
  leadId!: string;

  @IsString()
  @IsNotEmpty()
  leadName!: string;

  @IsString()
  @IsNotEmpty()
  date!: string;

  @IsString()
  @IsNotEmpty()
  time!: string;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsString()
  @IsNotEmpty()
  assignedEmployee!: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  clientPhone?: string;
}
