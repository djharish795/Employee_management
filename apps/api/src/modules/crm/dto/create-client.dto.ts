import { IsNotEmpty, IsString, IsOptional, IsEmail, IsNumber } from "class-validator";

export class CreateClientDto {
  @IsNotEmpty()
  @IsString()
  company!: string;

  @IsNotEmpty()
  @IsString()
  industry!: string;

  @IsNotEmpty()
  @IsString()
  phone!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  priority?: "High" | "Medium" | "Low";

  @IsOptional()
  @IsString()
  leadOwner?: string;

  @IsOptional()
  @IsString()
  leadSource?: string;

  @IsOptional()
  @IsNumber()
  sourceQuality?: number;
}
