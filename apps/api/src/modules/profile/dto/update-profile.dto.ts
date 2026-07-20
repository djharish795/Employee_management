import { IsString, IsOptional, IsEmail, IsObject } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsEmail()
  personalEmail?: string;

  @IsOptional()
  @IsString()
  preferredName?: string;

  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  alternatePhone?: string;

  @IsOptional()
  @IsObject()
  emergencyContact?: any;

  @IsOptional()
  @IsObject()
  currentAddress?: any;

  @IsOptional()
  @IsObject()
  permanentAddress?: any;

  @IsOptional()
  @IsObject()
  preferences?: any;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  maritalStatus?: string;
}
