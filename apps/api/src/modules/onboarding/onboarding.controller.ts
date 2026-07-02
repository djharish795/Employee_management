import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
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
  getDashboardMetrics() {
    return this.onboardingService.getDashboardMetrics();
  }

  @Post('initiate')
  @Permissions(Permission.WRITE_EMPLOYEES)
  initiateOnboarding(@Body() data: any) {
    return this.onboardingService.initiateOnboarding(data);
  }
}
