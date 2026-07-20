import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateCemLeadDto {
  @IsString()
  @IsNotEmpty()
  company!: string;

  @IsString()
  @IsNotEmpty()
  prospectName!: string;

  @IsString()
  @IsNotEmpty()
  industry!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  priority!: string;

  @IsString()
  @IsNotEmpty()
  leadSource!: string;
}
