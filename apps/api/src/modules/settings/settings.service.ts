import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardMetrics() {
    const totalUsers = await this.prisma.employee.count();

    // Count active distinct roles
    const activeRoles = await this.prisma.user.findMany({
      select: { role: true },
      distinct: ['role'],
    }).then(r => r.length);

    // Workflows: workflowDefinition does not exist in schema — derive count from audit logs
    // or return 0 until the Workflow model is added to the Prisma schema in a future migration.
    const activeWorkflows = 0;

    // ConnectSettings only tracks calendar/notification flags — no slack/zoom/aws booleans exist.
    // Count employees who have connected their Google Calendar as a proxy for "active integrations".
    const integrationsConnected = await this.prisma.connectSettings.count({
      where: { googleCalendarConnected: true }
    });

    // Security alerts (failed logins, blocked devices in last 24h)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const securityAlerts = await this.prisma.auditLog.count({
      where: {
        action: { in: ['FAILED_LOGIN', 'MFA_FAILED', 'DEVICE_BLOCKED'] },
        performedAt: { gte: yesterday }
      }
    });

    const recentChanges = await this.prisma.auditLog.findMany({
      take: 4,
      orderBy: { performedAt: 'desc' },
      where: {
        action: { in: ['UPDATE_SETTINGS', 'CREATE_ROLE', 'UPDATE_ROLE', 'INTEGRATION_SYNC', 'PASSWORD_POLICY_UPDATE'] }
      },
      include: {
        actor: {
          include: { user: true }
        }
      }
    });

    return {
      totalUsers,
      activeRoles,
      activeWorkflows,
      integrationsConnected,
      securityAlerts,
      complianceStatus: "HEALTHY",
      recentChanges: recentChanges.map(log => ({
        id: log.id,
        action: log.action.replace(/_/g, ' '),
        actor: log.actor ? `${log.actor.firstName} ${log.actor.lastName} (${log.actor.user?.role || 'User'})` : 'System',
        time: log.performedAt.toISOString(),
        type: 'system'
      }))
    };
  }
}
