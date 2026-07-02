import { Module } from "@nestjs/common";
import { KnowledgeController } from "./knowledge.controller";
import { KnowledgeService } from "./knowledge.service";
import { SearchService } from "./search.service";
import { KnowledgeRepository } from "./knowledge.repository";

@Module({
  controllers: [KnowledgeController],
  providers: [KnowledgeService, SearchService, KnowledgeRepository],
  exports: [KnowledgeService, SearchService],
})
export class KnowledgeModule {}
