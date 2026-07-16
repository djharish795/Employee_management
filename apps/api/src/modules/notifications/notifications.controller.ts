import { Controller, Get, Patch, Param, UseGuards, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '@naprocs/types';
import { NotificationType } from '@naprocs/database';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { RbacPermissions } from '../../common/rbac/rbac.config';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RbacGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @RequirePermissions(RbacPermissions.NOTIFICATIONS_READ)
  @Get()
  @Permissions(Permission.READ_OWN_PROFILE)
  async getNotifications(@CurrentUser() user: any): Promise<any> {
    return this.notificationsService.getNotifications(user.employeeId);
  }

  @Patch('read-all')
  @Permissions(Permission.READ_OWN_PROFILE)
  async markAllAsRead(@CurrentUser() user: any): Promise<any> {
    return this.notificationsService.markAllAsRead(user.employeeId);
  }

  @Patch(':id/read')
  @Permissions(Permission.READ_OWN_PROFILE)
  async markAsRead(@CurrentUser() user: any, @Param('id') id: string): Promise<any> {
    return this.notificationsService.markAsRead(user.employeeId, id);
  }

  // Admin endpoint to manually push a notification (for testing or real usage)
  @Post('push')
  @Permissions(Permission.WRITE_EMPLOYEES)
  async pushNotification(
    @Body() dto: { employeeId: string; title: string; body: string; type: NotificationType }
  ): Promise<any> {
    return this.notificationsService.createNotification(dto.employeeId, dto.title, dto.body, dto.type);
  }
}
