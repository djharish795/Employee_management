import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateKnowledgeDocDto } from "./dto/create-knowledge.dto";
import { UpdateKnowledgeDocDto } from "./dto/update-knowledge.dto";

@Injectable()
export class KnowledgeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateKnowledgeDocDto & { authorId: string }) {
    const slug = data.slug || this.generateSlug(data.title);

    // Check if slug already exists
    const existing = await this.prisma.knowledgeDoc.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new ConflictException(`A document with slug "${slug}" already exists`);
    }

    const doc = await this.prisma.knowledgeDoc.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        isPublished: data.isPublished ?? false,
        publishedAt: data.isPublished ? new Date() : null,
        slug,
        version: data.version || "1.0",
        requiresSignature: data.requiresSignature ?? false,
        authorId: data.authorId,
      },
    });

    // Update searchVector using execution raw query
    await this.prisma.$executeRaw`
      UPDATE knowledge_docs
      SET "searchVector" = to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))
      WHERE id = ${doc.id}
    `;

    return this.prisma.knowledgeDoc.findUnique({
      where: { id: doc.id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            officialEmail: true,
          },
        },
      },
    });
  }

  async findById(id: string, employeeId?: string) {
    return this.prisma.knowledgeDoc.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            officialEmail: true,
          },
        },
        ...(employeeId ? {
          acknowledgements: {
            where: { employeeId }
          }
        } : {})
      },
    });
  }

  async findBySlug(slug: string, employeeId?: string) {
    return this.prisma.knowledgeDoc.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            officialEmail: true,
          },
        },
        ...(employeeId ? {
          acknowledgements: {
            where: { employeeId }
          }
        } : {})
      },
    });
  }

  async update(id: string, data: UpdateKnowledgeDocDto) {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException("Knowledge document not found");
    }

    let slug = data.slug;
    if (data.title && !slug && data.title !== existing.title) {
      slug = this.generateSlug(data.title);
    }

    if (slug && slug !== existing.slug) {
      const slugExists = await this.prisma.knowledgeDoc.findUnique({
        where: { slug },
      });
      if (slugExists) {
        throw new ConflictException(`A document with slug "${slug}" already exists`);
      }
    }

    const publishedAt = data.isPublished === true && !existing.isPublished 
      ? new Date() 
      : data.isPublished === false 
        ? null 
        : existing.publishedAt;

    const doc = await this.prisma.knowledgeDoc.update({
      where: { id },
      data: {
        title: data.title ?? existing.title,
        content: data.content ?? existing.content,
        category: data.category ?? existing.category,
        isPublished: data.isPublished ?? existing.isPublished,
        version: data.version ?? existing.version,
        requiresSignature: data.requiresSignature ?? existing.requiresSignature,
        slug: slug ?? existing.slug,
        publishedAt,
      },
    });

    // Update searchVector if title or content changed
    if (data.title || data.content) {
      await this.prisma.$executeRaw`
        UPDATE knowledge_docs
        SET "searchVector" = to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))
        WHERE id = ${id}
      `;
    }

    return this.prisma.knowledgeDoc.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            officialEmail: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException("Knowledge document not found");
    }
    await this.prisma.knowledgeDoc.delete({
      where: { id },
    });
    return { success: true, message: "Document deleted successfully" };
  }

  async acknowledge(documentId: string, employeeId: string, signatureName: string) {
    const doc = await this.findById(documentId);
    if (!doc) throw new NotFoundException("Knowledge document not found");
    
    // UPSERT basically, or if unique fails then it exists
    return this.prisma.knowledgeAcknowledgement.upsert({
      where: {
        employeeId_documentId: {
          employeeId,
          documentId
        }
      },
      update: {
        signatureName,
        acknowledgedAt: new Date()
      },
      create: {
        employeeId,
        documentId,
        signatureName,
      }
    });
  }

  private generateSlug(title: string): string {
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    return `${baseSlug}-${randomSuffix}`;
  }
}
