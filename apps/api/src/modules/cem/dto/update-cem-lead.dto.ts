import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateCemLeadDto {
  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  prospectName?: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsString()
  @IsOptional()
  leadSource?: string;

  @IsInt()
  @IsOptional()
  stage?: number;
}
