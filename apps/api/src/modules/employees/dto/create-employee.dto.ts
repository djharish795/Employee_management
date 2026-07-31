import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";
import { EmployeeType, Gender, MaritalStatus } from "@naprocs/types";

export class CreateEmployeeDto {
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
  preferredName?: string;

  @IsEmail()
  @IsNotEmpty()
  officialEmail!: string;

  @IsEmail()
  @IsOptional()
  personalEmail?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  alternatePhone?: string;

  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  bloodGroup?: string;

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsEnum(MaritalStatus)
  @IsOptional()
  maritalStatus?: MaritalStatus;

  @IsString()
  @IsOptional()
  aadhaar?: string;

  @IsString()
  @IsOptional()
  pan?: string;

  @IsString()
  @IsNotEmpty()
  departmentId!: string;

  @IsString()
  @IsNotEmpty()
  designationId!: string;

  @IsString()
  @IsOptional()
  joiningDate?: string;

  @IsEnum(EmployeeType)
  @IsOptional()
  employeeType?: EmployeeType;

  @IsString()
  @IsOptional()
  workLocation?: string;

  @IsString()
  @IsOptional()
  reportingManagerId?: string;

  // Added for Banking
  @IsString()
  @IsOptional()
  bankName?: string;

  @IsString()
  @IsOptional()
  bankBranch?: string;

  @IsString()
  @IsOptional()
  bankAccount?: string; // Plain text received from frontend, encrypted before save

  @IsString()
  @IsOptional()
  bankIfsc?: string;

  @IsString()
  @IsOptional()
  paymentMode?: string;

  @IsString()
  @IsOptional()
  paymentFrequency?: string;

  @IsString()
  @IsOptional()
  accountType?: string;

  // Added for Documents
  @IsOptional()
  documents?: any; // Re-evaluate specific type later (e.g., Record<string, string>)

  // Added for Access Control
  @IsString()
  @IsOptional()
  @MaxLength(100)
  password?: string;

  @IsString()
  @IsOptional()
  role?: string;

  // Added for Personal Info mappings
  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsOptional()
  currentAddress?: any;

  @IsOptional()
  permanentAddress?: any;

  @IsOptional()
  emergencyContact?: any;

  // Added for custom Employee ID generation
  @IsString()
  @IsOptional()
  resourceType?: string;
}
