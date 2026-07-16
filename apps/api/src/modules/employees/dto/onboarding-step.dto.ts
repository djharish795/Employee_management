import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { EmployeeType, Gender, MaritalStatus } from "@naprocs/types";

export class Step1PersonalInfoDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsOptional()
  middleName?: string;

  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsEmail()
  @IsNotEmpty()
  officialEmail!: string;

  @IsString()
  @IsOptional()
  phone?: string;
  
  @IsString()
  @IsOptional()
  bloodGroup?: string;

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsEnum(MaritalStatus)
  @IsOptional()
  maritalStatus?: MaritalStatus;
}

export class Step2EmploymentDto {
  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  designationId?: string;

  @IsString()
  @IsOptional()
  joiningDate?: string;

  @IsEnum(EmployeeType)
  @IsOptional()
  employeeType?: EmployeeType;
}

export class Step3IdentityDto {
  @IsString()
  @IsOptional()
  aadhaar?: string;

  @IsString()
  @IsOptional()
  pan?: string;
}

export class Step4BankingDto {
  @IsString()
  @IsOptional()
  bankName?: string;

  @IsString()
  @IsOptional()
  bankAccount?: string;

  @IsString()
  @IsOptional()
  bankIfsc?: string;
}

export class Step5AccessControlDto {
  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  role?: string;
}

// We can define the draft submission envelope
export class OnboardingDraftStepDto {
  @IsString()
  @IsOptional()
  draftId?: string; // Generated on first step, returned to frontend

  @IsString()
  @IsNotEmpty()
  stepNumber!: string; // "1", "2", "3"

  @IsOptional()
  payload?: any;
}
