import { IsOptional, IsString, IsEnum, IsBoolean } from "class-validator";
import { KnowledgeCategory } from "@naprocs/database";
import { Transform } from "class-transformer";

export class SearchKnowledgeDocDto {
  @IsString()
  @IsOptional()
  q?: string;

  @IsEnum(KnowledgeCategory)
  @IsOptional()
  category?: KnowledgeCategory;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === "true" || value === true) return true;
    if (value === "false" || value === false) return false;
    return value;
  })
  isPublished?: boolean;
}
