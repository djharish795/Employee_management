import { Injectable, ForbiddenException, BadRequestException, NotFoundException } from "@nestjs/common";
import { RbacGroups } from "../../common/rbac/rbac.config";
import { KnowledgeRepository } from "./knowledge.repository";
import { SearchService } from "./search.service";
import { CreateKnowledgeDocDto } from "./dto/create-knowledge.dto";
import { UpdateKnowledgeDocDto } from "./dto/update-knowledge.dto";
import { SearchKnowledgeDocDto } from "./dto/search-knowledge.dto";
import { UserRole } from "@naprocs/types";

@Injectable()
export class KnowledgeService {
  constructor(
    private readonly knowledgeRepository: KnowledgeRepository,
    private readonly searchService: SearchService,
  ) {}

  private hasWriteAccess(role: UserRole): boolean {
    return RbacGroups.KNOWLEDGE_WRITERS.includes(role as any);
  }

  private validateWriteAccess(role: UserRole) {
    if (!this.hasWriteAccess(role)) {
      throw new ForbiddenException("Insufficient permissions to modify knowledge base documents");
    }
  }

  async create(user: any, dto: CreateKnowledgeDocDto) {
    if (!user.employeeId) {
      throw new BadRequestException("User profile is not associated with an employee record");
    }
    this.validateWriteAccess(user.role as UserRole);
    return this.knowledgeRepository.create({
      ...dto,
      authorId: user.employeeId,
    });
  }

  async list(role: UserRole, searchDto: SearchKnowledgeDocDto) {
    const hasWrite = this.hasWriteAccess(role);
    
    // Non-authorized roles can ONLY view published articles
    let isPublished = searchDto.isPublished;
    if (!hasWrite) {
      isPublished = true;
    }

    const page = searchDto.page || 1;
    const limit = Math.min(searchDto.limit || 50, 100);
    const skip = (page - 1) * limit;

    const results = await this.searchService.search(searchDto.q, searchDto.category, isPublished, skip, limit);
    return { data: results, page, limit };
  }

  async findOne(id: string, role: UserRole, employeeId?: string) {
    const doc = await this.knowledgeRepository.findById(id, employeeId);
    if (!doc) {
      throw new NotFoundException("Knowledge document not found");
    }

    const hasWrite = this.hasWriteAccess(role);
    if (!doc.isPublished && !hasWrite) {
      throw new ForbiddenException("Insufficient permissions to view this draft document");
    }

    return doc;
  }

  async findBySlug(slug: string, role: UserRole, employeeId?: string) {
    const doc = await this.knowledgeRepository.findBySlug(slug, employeeId);
    if (!doc) {
      throw new NotFoundException("Knowledge document not found");
    }

    const hasWrite = this.hasWriteAccess(role);
    if (!doc.isPublished && !hasWrite) {
      throw new ForbiddenException("Insufficient permissions to view this draft document");
    }

    return doc;
  }

  async update(id: string, role: UserRole, dto: UpdateKnowledgeDocDto) {
    this.validateWriteAccess(role);
    return this.knowledgeRepository.update(id, dto);
  }

  async remove(id: string, role: UserRole) {
    this.validateWriteAccess(role);
    return this.knowledgeRepository.delete(id);
  }

  async publish(id: string, role: UserRole, isPublished: boolean) {
    this.validateWriteAccess(role);
    return this.knowledgeRepository.update(id, { isPublished });
  }

  async acknowledge(id: string, employeeId: string, signatureName: string) {
    if (!employeeId) {
      throw new BadRequestException("User profile is not associated with an employee record");
    }
    if (!signatureName || signatureName.trim().length < 2) {
      throw new BadRequestException("A valid full name signature is required");
    }
    return this.knowledgeRepository.acknowledge(id, employeeId, signatureName);
  }
}
