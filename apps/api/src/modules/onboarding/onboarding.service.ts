import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(private readonly db: PrismaService) {}

  async getDashboardMetrics() {
    // Return empty/mock structure matching the hardcoded frontend
    // because real data is not fully seeded yet
    return {
      upcomingJoiners: 24,
      upcomingJoinersThisWeek: 3,
      pendingDocuments: 12,
      inProgress: 45,
      completed30Days: 18,
      pipeline: {
        offerAccepted: 14,
        documentation: 8,
        assetAllocation: 12,
        training: 6,
        managerIntro: 5,
      },
      activeOnboarding: [], // We can pull from db if available
      pendingHrTasks: [],
      recentActivity: []
    };
  }

  async initiateOnboarding(data: any) {
    this.logger.log(`Initiating onboarding for ${data.firstName} ${data.lastName}`);
    
    // In a real flow, this would:
    // 1. Create User & Employee with status ONBOARDING
    // 2. Create OnboardingSession
    // 3. Create initial OnboardingTasks (e.g. Documentation, Asset setup)
    
    return {
      success: true,
      message: 'Onboarding initiated successfully'
    };
  }
}
