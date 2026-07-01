import { PartialType } from "@nestjs/mapped-types";
import { CreateKnowledgeDocDto } from "./create-knowledge.dto";

export class UpdateKnowledgeDocDto extends PartialType(CreateKnowledgeDocDto) {}
