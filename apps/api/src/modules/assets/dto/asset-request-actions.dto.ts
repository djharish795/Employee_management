import { IsString, IsEnum, IsOptional, IsArray, IsNotEmpty } from "class-validator";
import { AssetCategory } from "@naprocs/database";

export class CreateAssetRequestDto {
  @IsString()
  employeeId!: string;

  @IsEnum(["ONBOARDING", "OFFBOARDING", "GENERAL"])
  type!: "ONBOARDING" | "OFFBOARDING" | "GENERAL";

  @IsOptional()
  requestedItems?: any;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class OmSelectAssetRequestDto {
  @IsArray()
  @IsString({ each: true })
  assetIds!: string[];
}

export class RespondAssetRequestDto {
  @IsEnum(["APPROVED", "REJECTED"])
  status!: "APPROVED" | "REJECTED";

  @IsString()
  @IsOptional()
  notes?: string;
}
