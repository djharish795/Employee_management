import { IsString, IsNotEmpty, IsOptional } from "class-validator";
import { PaginationParams } from "../../../common/utils/pagination.util";

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

export class EmployeeFilterDto extends PaginationParams {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
