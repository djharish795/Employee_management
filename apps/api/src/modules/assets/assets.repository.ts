import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AssetStatus, AssetCategory } from "@naprocs/database";

@Injectable()
export class AssetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSummaryKPIs(): Promise<any> {
    const totalAssetsCount = await this.prisma.asset.count();
    
    const statusCounts = await this.prisma.asset.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
    });

    const countsByStatus: Record<AssetStatus, number> = {
      [AssetStatus.AVAILABLE]: 0,
      [AssetStatus.ASSIGNED]: 0,
      [AssetStatus.LOST]: 0,
      [AssetStatus.DAMAGED]: 0,
      [AssetStatus.REPLACED]: 0,
      [AssetStatus.RETIRED]: 0,
    };

    statusCounts.forEach((group) => {
      countsByStatus[group.status] = group._count._all;
    });

    const activeAssetsCount = await this.prisma.asset.count({
      where: {
        status: {
          notIn: [AssetStatus.RETIRED, AssetStatus.REPLACED],
        },
      },
    });

    const assignedAssetsCount = countsByStatus[AssetStatus.ASSIGNED] || 0;
    const allocationRate = activeAssetsCount > 0
      ? Number(((assignedAssetsCount / activeAssetsCount) * 100).toFixed(2))
      : 0;

    // Count pending workflow instances of type ASSET_REQUEST
    const pendingWorkflowRequests = await this.prisma.workflowInstance.count({
      where: {
        status: 'PENDING',
        workflow: {
          type: 'ASSET_REQUEST',
        },
      },
    });

    return {
      totalAssetsCount,
      allocationRate,
      countsByStatus,
      pendingWorkflowRequests,
    };
  }

  async getCategoryBreakdown(): Promise<any> {
    const assets = await this.prisma.asset.findMany({
      select: {
        category: true,
        status: true,
      },
    });

    const categories = Object.values(AssetCategory);
    const breakdown = categories.map((cat) => {
      const catAssets = assets.filter((a) => a.category === cat);
      const totalCount = catAssets.length;
      const assignedCount = catAssets.filter((a) => a.status === AssetStatus.ASSIGNED).length;
      const availableCount = catAssets.filter((a) => a.status === AssetStatus.AVAILABLE).length;
      const damagedCount = catAssets.filter((a) => a.status === AssetStatus.DAMAGED).length;
      const lostCount = catAssets.filter((a) => a.status === AssetStatus.LOST).length;
      const retiredCount = catAssets.filter((a) => a.status === AssetStatus.RETIRED).length;

      const activeCount = catAssets.filter(
        (a) => a.status !== AssetStatus.RETIRED && a.status !== AssetStatus.REPLACED
      ).length;

      const utilizationRate = activeCount > 0
        ? Number(((assignedCount / activeCount) * 100).toFixed(2))
        : 0;

      return {
        category: cat,
        totalCount,
        assignedCount,
        availableCount,
        damagedCount,
        lostCount,
        retiredCount,
        utilizationRate,
      };
    });

    return breakdown;
  }

  async getFinancialSummary(): Promise<any> {
    const assets = await this.prisma.asset.findMany({
      select: {
        category: true,
        status: true,
        purchaseCost: true,
      },
    });

    let totalInvestment = 0;
    let activeValuation = 0;
    const lossValuation = {
      [AssetStatus.LOST]: 0,
      [AssetStatus.DAMAGED]: 0,
      [AssetStatus.RETIRED]: 0,
    };

    const expenditureByCategory: Record<AssetCategory, number> = {
      [AssetCategory.LAPTOP]: 0,
      [AssetCategory.DESKTOP]: 0,
      [AssetCategory.MONITOR]: 0,
      [AssetCategory.MOBILE_DEVICE]: 0,
      [AssetCategory.SIM]: 0,
      [AssetCategory.ACCESS_CARD]: 0,
      [AssetCategory.SOFTWARE_LICENCE]: 0,
      [AssetCategory.CLOUD_ACCOUNT]: 0,
      [AssetCategory.OTHER]: 0,
    };

    assets.forEach((asset) => {
      const cost = asset.purchaseCost ? Number(asset.purchaseCost) : 0;
      totalInvestment += cost;

      if (asset.status !== AssetStatus.RETIRED && asset.status !== AssetStatus.REPLACED && asset.status !== AssetStatus.LOST && asset.status !== AssetStatus.DAMAGED) {
        activeValuation += cost;
      }

      if (asset.status === AssetStatus.LOST || asset.status === AssetStatus.DAMAGED || asset.status === AssetStatus.RETIRED) {
        lossValuation[asset.status] += cost;
      }

      expenditureByCategory[asset.category] += cost;
    });

    return {
      currency: "INR",
      totalInvestment: Number(totalInvestment.toFixed(2)),
      activeValuation: Number(activeValuation.toFixed(2)),
      lossValuation: {
        LOST: Number(lossValuation[AssetStatus.LOST].toFixed(2)),
        DAMAGED: Number(lossValuation[AssetStatus.DAMAGED].toFixed(2)),
        RETIRED: Number(lossValuation[AssetStatus.RETIRED].toFixed(2)),
      },
      expenditureByCategory: Object.keys(expenditureByCategory).reduce((acc, key) => {
        acc[key] = Number(expenditureByCategory[key as AssetCategory].toFixed(2));
        return acc;
      }, {} as Record<string, number>),
    };
  }

  async getLifecycleTrends(startDate: Date, endDate: Date, interval: 'MONTH' | 'QUARTER'): Promise<any> {
    const assets = await this.prisma.asset.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
        status: true,
        updatedAt: true,
      },
    });

    const assignments = await this.prisma.assetAssignment.findMany({
      where: {
        OR: [
          { assignedAt: { gte: startDate, lte: endDate } },
          { returnedAt: { gte: startDate, lte: endDate } },
        ],
      },
      select: {
        assignedAt: true,
        returnedAt: true,
      },
    });

    const getBucketKey = (date: Date): string => {
      const year = date.getFullYear();
      if (interval === 'QUARTER') {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `${year}-Q${quarter}`;
      } else {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
      }
    };

    const buckets: Record<string, {
      period: string;
      assetsProcured: number;
      assignmentsCreated: number;
      returnsProcessed: number;
      reportedDamaged: number;
      reportedLost: number;
    }> = {};

    const current = new Date(startDate);
    while (current <= endDate) {
      const key = getBucketKey(current);
      if (!buckets[key]) {
        buckets[key] = {
          period: key,
          assetsProcured: 0,
          assignmentsCreated: 0,
          returnsProcessed: 0,
          reportedDamaged: 0,
          reportedLost: 0,
        };
      }
      if (interval === 'QUARTER') {
        current.setMonth(current.getMonth() + 3);
      } else {
        current.setMonth(current.getMonth() + 1);
      }
    }

    assets.forEach((asset) => {
      const key = getBucketKey(asset.createdAt);
      if (buckets[key]) {
        buckets[key].assetsProcured += 1;
      }
      
      if (asset.status === AssetStatus.DAMAGED) {
        const updateKey = getBucketKey(asset.updatedAt);
        if (buckets[updateKey] && asset.updatedAt >= startDate && asset.updatedAt <= endDate) {
          buckets[updateKey].reportedDamaged += 1;
        }
      } else if (asset.status === AssetStatus.LOST) {
        const updateKey = getBucketKey(asset.updatedAt);
        if (buckets[updateKey] && asset.updatedAt >= startDate && asset.updatedAt <= endDate) {
          buckets[updateKey].reportedLost += 1;
        }
      }
    });

    assignments.forEach((assign) => {
      const assignKey = getBucketKey(assign.assignedAt);
      if (buckets[assignKey] && assign.assignedAt >= startDate && assign.assignedAt <= endDate) {
        buckets[assignKey].assignmentsCreated += 1;
      }

      if (assign.returnedAt) {
        const returnKey = getBucketKey(assign.returnedAt);
        if (buckets[returnKey] && assign.returnedAt >= startDate && assign.returnedAt <= endDate) {
          buckets[returnKey].returnsProcessed += 1;
        }
      }
    });

    return Object.values(buckets).sort((a, b) => a.period.localeCompare(b.period));
  }

  async getCtoAssets(): Promise<any> {
    const assetAssignments = await this.prisma.assetAssignment.findMany({
      where: {
        returnedAt: null
      },
      include: {
        employee: true,
        asset: true
      },
      orderBy: { assignedAt: 'desc' }
    });

    const totalDevices = assetAssignments.filter(a => ['LAPTOP', 'DESKTOP', 'MONITOR', 'MOBILE_DEVICE'].includes(a.asset.category)).length;
    const softwareLicenses = assetAssignments.filter(a => ['SOFTWARE_LICENCE', 'CLOUD_ACCOUNT'].includes(a.asset.category)).length;
    
    // Calculate real dueForRefresh: Devices older than 3 years
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
    
    let dueForRefresh = 0;
    const assets = assetAssignments.map(a => {
      const isRefreshDue = a.asset.createdAt < threeYearsAgo && ['LAPTOP', 'DESKTOP', 'MONITOR', 'MOBILE_DEVICE'].includes(a.asset.category);
      if (isRefreshDue) {
        dueForRefresh++;
      }
      
      return {
        id: a.id,
        assetName: a.asset.brand || 'Asset',
        category: ['LAPTOP', 'DESKTOP'].includes(a.asset.category) ? 'Laptop' : 
                  a.asset.category === 'MONITOR' ? 'Monitor' :
                  ['SOFTWARE_LICENCE', 'CLOUD_ACCOUNT'].includes(a.asset.category) ? 'Software' : 'Accessory',
        assignedToName: `${a.employee.firstName} ${a.employee.lastName}`,
        assignedToInitials: `${a.employee.firstName.charAt(0)}${a.employee.lastName.charAt(0)}`,
        assignedDate: a.assignedAt.toISOString().split('T')[0],
        status: isRefreshDue ? 'Due for refresh' : 'Active'
      };
    });

    return {
      metrics: {
        totalDevices,
        softwareLicenses,
        dueForRefresh
      },
      assets,
      totalCount: assets.length
    };
  }
}
