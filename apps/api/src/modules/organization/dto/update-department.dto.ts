import { IsOptional, IsString } from "class-validator";

export class UpdateDepartmentDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  headId?: string;

  @IsString()
  @IsOptional()
  parentDepartmentId?: string;
}
