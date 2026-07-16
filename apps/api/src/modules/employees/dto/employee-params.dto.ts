import { IsString, IsNotEmpty } from "class-validator";

export class EmployeeIdParamDto {
  @IsString()
  @IsNotEmpty()
  id!: string;
}

export class ReassignManagerDto {
  @IsString()
  @IsNotEmpty()
  employeeId!: string;

  @IsString()
  @IsNotEmpty()
  newManagerId!: string;
}

export class CompleteOnboardingDto {
  @IsString()
  @IsNotEmpty()
  draftId!: string;
}
