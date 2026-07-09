import { Controller, Get, Post, Body, UseGuards, Param, Patch } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '@naprocs/types';

@Controller('onboarding')
@UseGuards(JwtAuthGuard, RbacGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('dashboard')
  @Permissions(Permission.WRITE_EMPLOYEES) // Basic permission for HR access
  getDashboardMetrics(): Promise<any> {
    return this.onboardingService.getDashboardMetrics();
  }

  @Post('initiate')
  @Permissions(Permission.WRITE_EMPLOYEES)
  initiateOnboarding(@Body() data: any) {
    return this.onboardingService.initiateOnboarding(data);
  }
  @Get(':id')
  @Permissions(Permission.READ_EMPLOYEES)
  getSessionDetails(@Param('id') id: string): Promise<any> {
    return this.onboardingService.getSessionDetails(id);
  }

  @Patch('tasks/:taskId')
  @Permissions(Permission.WRITE_EMPLOYEES)
  toggleTaskStatus(
    @Param('taskId') taskId: string,
    @Body('isCompleted') isCompleted: boolean
  ): Promise<any> {
    return this.onboardingService.toggleTaskStatus(taskId, isCompleted);
  }

  @Post(':id/remind')
  @Permissions(Permission.WRITE_EMPLOYEES)
  async sendReminders(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.onboardingService.sendReminders(id);
    return { success: true };
  }

  @Post(':id/welcome-call')
  @Permissions(Permission.WRITE_EMPLOYEES)
  async scheduleWelcomeCall(
    @Param('id') id: string,
    @Body('startTime') startTime: string,
    @Body('endTime') endTime: string
  ): Promise<{ success: boolean }> {
    await this.onboardingService.scheduleWelcomeCall(id, new Date(startTime), new Date(endTime));
    return { success: true };
  }

  @Post(':id/cancel')
  @Permissions(Permission.WRITE_EMPLOYEES)
  async cancelOnboarding(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.onboardingService.cancelOnboarding(id);
    return { success: true };
  }
}
