import { PartialType } from "@nestjs/mapped-types";
import { InitiateOffboardingDto } from "./initiate-offboarding.dto";
import { IsString, IsOptional, IsArray } from "class-validator";

export class UpdateOffboardingDto extends PartialType(InitiateOffboardingDto) {
  @IsString()
  @IsOptional()
  status?: string;

  @IsArray()
  @IsOptional()
  assetChecklist?: any[];

  @IsArray()
  @IsOptional()
  deactivationChecklist?: any[];

  @IsArray()
  @IsOptional()
  settlementChecklist?: any[];

  @IsArray()
  @IsOptional()
  ktChecklist?: any[];
}
