import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, IsDateString } from "class-validator";
import { AssetCategory, AssetStatus } from "@naprocs/database";

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  assetTag!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(AssetCategory)
  category!: AssetCategory;

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
