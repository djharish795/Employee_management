import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@naprocs/types';
import { SEARCH_REGISTRY, SearchEntity } from './search.registry';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async globalSearch(query: string, userRole: UserRole): Promise<SearchEntity[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    // 1. Filter statically registered modules by RBAC FIRST
    const authorizedModules = SEARCH_REGISTRY.filter(entity => 
      entity.permissions.includes(userRole)
    );

    // 2. Score the static modules
    const scoredModules = authorizedModules.map(entity => {
      let score = 0;
      
      const titleLower = entity.title.toLowerCase();
      const descLower = entity.description.toLowerCase();
      
      // Exact Match (Highest Priority)
      if (titleLower === q) score += 100;
      // Starts With
      else if (titleLower.startsWith(q)) score += 75;
      // Partial Match in Title
      else if (titleLower.includes(q)) score += 50;
      
      // Keyword Match
      if (entity.keywords.some(k => k === q)) score += 80;
      else if (entity.keywords.some(k => k.includes(q))) score += 40;

      // Synonym Match
      if (entity.synonyms.some(s => s === q)) score += 60;
      else if (entity.synonyms.some(s => s.includes(q))) score += 30;

      // Description Match
      if (descLower.includes(q)) score += 20;

      return { entity, score };
    }).filter(item => item.score > 0);

    // 3. Dynamic Database Searches (Only if user has access to those modules)
    // Employees Directory is accessible to ALL_ROLES usually.
    const dynamicResults: { entity: SearchEntity, score: number }[] = [];
    
    // Search Employees
    const employees = await this.prisma.employee.findMany({
      where: {
        OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { officialEmail: { contains: q, mode: 'insensitive' } }
        ]
      },
      take: 50
    });

    for (const emp of employees) {
      dynamicResults.push({
        entity: {
          id: `emp-${emp.id}`,
          title: `${emp.firstName} ${emp.lastName}`,
          description: `Employee • General`,
          route: `/employees/${emp.id}`,
          parentModule: 'Organisation',
          category: 'PERSON',
          permissions: Object.values(UserRole), // All roles can see profiles
          keywords: [emp.officialEmail, emp.firstName, emp.lastName].filter(Boolean) as string[],
          synonyms: [],
          actionType: 'NAVIGATE',
          icon: 'User',
          priority: 3
        },
        score: 60 // Base score for dynamic matches
      });
    }

    // Combine, sort by score descending, and return top 15
    const combined = [...scoredModules, ...dynamicResults];
    combined.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.entity.priority - b.entity.priority; // secondary sort by priority
    });

    return combined.slice(0, 15).map(item => item.entity);
  }
}
