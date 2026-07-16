import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean } from "class-validator";
import { KnowledgeCategory } from "@naprocs/database";

export class CreateKnowledgeDocDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsEnum(KnowledgeCategory)
  category!: KnowledgeCategory;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  version?: string;

  @IsBoolean()
  @IsOptional()
  requiresSignature?: boolean;
}
