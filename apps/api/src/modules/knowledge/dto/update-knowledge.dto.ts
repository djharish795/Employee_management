import { PartialType } from "@nestjs/mapped-types";
import { IsBoolean, IsOptional } from "class-validator";
import { CreateKnowledgeDocDto } from "./create-knowledge.dto";

export class UpdateKnowledgeDocDto extends PartialType(CreateKnowledgeDocDto) {
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsBoolean()
  @IsOptional()
  requiresSignature?: boolean;
}
