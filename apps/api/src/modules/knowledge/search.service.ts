import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { KnowledgeCategory, Prisma } from "@naprocs/database";

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) { }

  async search(
    q?: string,
    category?: KnowledgeCategory,
    isPublished?: boolean,
    skip: number = 0,
    take: number = 50,
    employeeId?: string,
  ) {
    if (!q) {
      const where: Prisma.KnowledgeDocWhereInput = {};
      if (category) {
        where.category = category;
      }
      if (isPublished !== undefined) {
        where.isPublished = isPublished;
      }

      return this.prisma.knowledgeDoc.findMany({
        where,
        skip,
        take,
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
        orderBy: {
          updatedAt: "desc",
        },
      });
    }

    const queryTerm = `%${q}%`;
    const dbCategory = category ?? null;
    const dbIsPublished = isPublished ?? null;

    // We use safe binding for categories and publication state checking in raw postgres query.
    // If the category is not specified, it binds to null, and the condition evaluates to true.
    const results: any[] = await this.prisma.$queryRaw`
      SELECT d.id, d.title, d.slug, d.category, d."isPublished", d."publishedAt", d.content, d.version, d."authorId",
             e."firstName" as "authorFirstName", e."lastName" as "authorLastName", e."officialEmail" as "authorEmail",
             ts_rank(d."searchVector", websearch_to_tsquery('english', ${q})) as rank
      FROM knowledge_docs d
      JOIN employees e ON d."authorId" = e.id
      WHERE (
        d."searchVector" @@ websearch_to_tsquery('english', ${q})
        OR d.title ILIKE ${queryTerm}
        OR d.content ILIKE ${queryTerm}
      )
      AND (${dbCategory}::text IS NULL OR d.category::text = ${dbCategory})
      AND (${dbIsPublished}::boolean IS NULL OR d."isPublished" = ${dbIsPublished})
      ORDER BY rank DESC, d."updatedAt" DESC
      LIMIT ${take} OFFSET ${skip}
    `;

    const docIds = results.map(r => r.id);
    const acks = employeeId && docIds.length > 0
      ? await this.prisma.knowledgeAcknowledgement.findMany({
          where: {
            employeeId,
            documentId: { in: docIds }
          }
        })
      : [];
    
    const ackMap = new Map(acks.map(a => [a.documentId, a]));

    return results.map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      category: row.category,
      content: row.content,
      isPublished: row.isPublished,
      publishedAt: row.publishedAt,
      version: row.version,
      authorId: row.authorId,
      author: {
        id: row.authorId,
        firstName: row.authorFirstName,
        lastName: row.authorLastName,
        officialEmail: row.authorEmail,
      },
      acknowledgements: ackMap.has(row.id) ? [ackMap.get(row.id)] : [],
    }));
  }
}
