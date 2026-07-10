import { Controller, Get, Post, Body, UseGuards, Param, Patch, Req, Ip } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '@naprocs/types';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { initiateOnboardingSchema } from '@naprocs/schemas';

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
  initiateOnboarding(
    @Body(new ZodValidationPipe(initiateOnboardingSchema)) data: any,
    @Req() req: any,
    @Ip() ip: string
  ) {
    return this.onboardingService.initiateOnboarding(data, req.user, ip);
  }

  @Get('me')
  @Permissions(Permission.READ_OWN_PROFILE)
  getMySession(@Req() req: any): Promise<any> {
    return this.onboardingService.getMySession(req.user.employeeId);
  }

  @Post('me/tasks/:taskId/submit-document')
  @Permissions(Permission.WRITE_OWN_PROFILE)
  submitMyDocument(
    @Req() req: any,
    @Param('taskId') taskId: string,
    @Body('documentKey') documentKey: string
  ): Promise<any> {
    return this.onboardingService.submitDocument(req.user.employeeId, taskId, documentKey);
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
    @Body('isCompleted') isCompleted: boolean,
    @Req() req: any
  ): Promise<any> {
    // HR is toggling task status
    return this.onboardingService.toggleTaskStatus(taskId, isCompleted, req.user);
  }

  @Patch('tasks/:taskId/assignee')
  @Permissions(Permission.WRITE_OWN_PROFILE, Permission.WRITE_EMPLOYEES)
  toggleAssignedTaskStatus(
    @Param('taskId') taskId: string,
    @Body('isCompleted') isCompleted: boolean,
    @Req() req: any
  ): Promise<any> {
    // Other users toggling tasks assigned to them (IT, Finance, Employee)
    // No @Permissions decorator means they only need to be authenticated, 
    // but the service will check if they are actually the assignee.
    return this.onboardingService.toggleAssignedTaskStatus(taskId, isCompleted, req.user);
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
  async cancelOnboarding(
    @Param('id') id: string,
    @Req() req: any
  ): Promise<{ success: boolean }> {
    await this.onboardingService.cancelOnboarding(id, req.user);
    return { success: true };
  }
}

