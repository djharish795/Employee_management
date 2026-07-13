import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectRole, ProjectStatus } from '@naprocs/database';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProject(data: { name: string; description?: string; key?: string }) {
    let projectKey = data.key;
    if (!projectKey) {
      const baseKey = data.name.replace(/[^A-Za-z0-9]/g, '').substring(0, 4).toUpperCase() || 'PROJ';
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      projectKey = `${baseKey}-${randomSuffix}`;
    }

    return this.prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        key: projectKey,
        status: ProjectStatus.ACTIVE,
      },
    });
  }

  async getAllProjects(user?: any) {
    const isAdmin = user && ['SUPER_ADMIN', 'CTO', 'CEO'].includes(user.role);
    
    return this.prisma.project.findMany({
      where: isAdmin ? undefined : {
        assignments: {
          some: {
            employeeId: user?.employeeId
          }
        }
      },
      include: {
        _count: {
          select: { assignments: true },
        },
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async deleteProject(projectId: string) {
    // Delete assignments first
    await this.prisma.projectAssignment.deleteMany({
      where: { projectId },
    });
    // Delete project
    return this.prisma.project.delete({
      where: { id: projectId },
    });
  }

  async completeProject(projectId: string, signatureName: string) {
    // We could validate the signatureName matches the user if we had the context,
    // but we will just trust the controller/frontend for now and rely on the AuditLog.
    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        status: ProjectStatus.COMPLETED,
        endDate: new Date(),
      }
    });
  }

  async getProjectDetails(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        assignments: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                officialEmail: true,
                photoUrl: true,
                designation: { select: { title: true } },
                department: { select: { name: true } }
              }
            }
          }
        }
      }
    });

    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async assignMember(projectId: string, employeeId: string, projectRole: ProjectRole, requestingUser: any) {
    // RBAC Check
    const hasGlobalPerm = requestingUser && ['SUPER_ADMIN', 'CTO', 'CEO'].includes(requestingUser.role);
    if (!hasGlobalPerm) {
      const assignment = await this.prisma.projectAssignment.findFirst({
        where: { 
          projectId, 
          employeeId: requestingUser.employeeId, 
          projectRole: { in: [ProjectRole.PM, ProjectRole.TL] } 
        }
      });
      if (!assignment) throw new ForbiddenException("You must be a Team Lead or Manager of this project to assign members.");
    }

    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found');

    // Upsert assignment to handle re-assignment or updating role without crashing
    return this.prisma.projectAssignment.upsert({
      where: {
        projectId_employeeId: {
          projectId,
          employeeId
        }
      },
      update: {
        projectRole,
        releasedAt: null, // Reactivate if they were released
      },
      create: {
        projectId,
        employeeId,
        projectRole,
      }
    });
  }

  async releaseMember(projectId: string, employeeId: string, requestingUser: any) {
    // RBAC Check
    const hasGlobalPerm = requestingUser && ['SUPER_ADMIN', 'CTO', 'CEO'].includes(requestingUser.role);
    if (!hasGlobalPerm) {
      const assignment = await this.prisma.projectAssignment.findFirst({
        where: { 
          projectId, 
          employeeId: requestingUser.employeeId, 
          projectRole: { in: [ProjectRole.PM, ProjectRole.TL] } 
        }
      });
      if (!assignment) throw new ForbiddenException("You must be a Team Lead or Manager of this project to release members.");
    }

    return this.prisma.projectAssignment.update({
      where: {
        projectId_employeeId: {
          projectId,
          employeeId
        }
      },
      data: {
        releasedAt: new Date(),
      }
    });
  }

  async createSprint(projectId: string, data: { name: string; startDate: string; endDate: string }) {
    return this.prisma.sprint.create({
      data: {
        projectId,
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      }
    });
  }

  async getProjectSprints(projectId: string) {
    return this.prisma.sprint.findMany({
      where: { projectId },
      include: {
        _count: {
          select: { tasks: true }
        }
      },
      orderBy: { startDate: 'desc' }
    });
  }

  async updateSprint(sprintId: string, data: any) {
    return this.prisma.sprint.update({
      where: { id: sprintId },
      data
    });
  }
}
