import { IsString, IsEnum, IsOptional } from "class-validator";
import { AssetCategory } from "@naprocs/database";

export class CreateAssetRequestDto {
  @IsEnum(AssetCategory)
  category!: AssetCategory;

  @IsString()
  description!: string;

  @IsString()
  justification!: string;

  @IsEnum(["LOW", "MEDIUM", "HIGH", "URGENT"])
  priority!: "LOW" | "MEDIUM" | "HIGH" | "URGENT";

  @IsOptional()
  @IsString()
  targetEmployeeId?: string;
}

export class RespondAssetRequestDto {
  @IsEnum(["APPROVED", "REJECTED"])
  status!: "APPROVED" | "REJECTED";

  @IsString()
  @IsOptional()
  notes?: string;
}
