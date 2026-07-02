import { Injectable, ForbiddenException, BadRequestException, NotFoundException } from "@nestjs/common";
import { KnowledgeRepository } from "./knowledge.repository";
import { SearchService } from "./search.service";
import { CreateKnowledgeDocDto } from "./dto/create-knowledge.dto";
import { UpdateKnowledgeDocDto } from "./dto/update-knowledge.dto";
import { SearchKnowledgeDocDto } from "./dto/search-knowledge.dto";
import { UserRole } from "@naprocs/types";

@Injectable()
export class KnowledgeService {
  private readonly allowedWriteRoles = [
    UserRole.SUPER_ADMIN,
    UserRole.CEO,
    UserRole.CTO,
    UserRole.COO,
    UserRole.OPERATIONS_HEAD,
    UserRole.CHRO,
    UserRole.HR,
    UserRole.IT,
  ];

  constructor(
    private readonly knowledgeRepository: KnowledgeRepository,
    private readonly searchService: SearchService,
  ) {}

  private hasWriteAccess(role: UserRole): boolean {
    return this.allowedWriteRoles.includes(role);
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

    return this.searchService.search(searchDto.q, searchDto.category, isPublished);
  }

  async findOne(id: string, role: UserRole) {
    const doc = await this.knowledgeRepository.findById(id);
    if (!doc) {
      throw new NotFoundException("Knowledge document not found");
    }

    const hasWrite = this.hasWriteAccess(role);
    if (!doc.isPublished && !hasWrite) {
      throw new ForbiddenException("Insufficient permissions to view this draft document");
    }

    return doc;
  }

  async findBySlug(slug: string, role: UserRole) {
    const doc = await this.knowledgeRepository.findBySlug(slug);
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
}
