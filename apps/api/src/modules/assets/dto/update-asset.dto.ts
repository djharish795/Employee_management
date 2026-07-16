import { IsString, IsEnum, IsOptional, IsNumber, IsDateString } from "class-validator";
import { AssetCategory, AssetStatus } from "@naprocs/database";

export class UpdateAssetDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(AssetCategory)
  @IsOptional()
  category?: AssetCategory;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  serialNumber?: string;

  @IsNumber()
  @IsOptional()
  purchaseCost?: number;

  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(AssetStatus)
  @IsOptional()
  status?: AssetStatus;
}
