import { IsString, IsNotEmpty, IsEnum, IsOptional } from "class-validator";
import { AssetCategory } from "@naprocs/database";

export class AssetRequestDto {
  @IsString()
  @IsNotEmpty()
  employeeId!: string;

  @IsEnum(AssetCategory)
  category!: AssetCategory;

  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
