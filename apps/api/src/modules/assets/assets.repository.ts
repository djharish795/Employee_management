import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AssetStatus, AssetCategory } from "@naprocs/database";
import { CreateAssetDto } from "./dto/create-asset.dto";
import { UpdateAssetDto } from "./dto/update-asset.dto";

@Injectable()
export class AssetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Inventory CRUD ────────────────────────────────────────────────────────

  async findAll(
    role: string,
    userId: string,
    filters: {
      status?: AssetStatus;
      category?: AssetCategory;
      search?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const { status, category, search, page = 1, limit = 50 } = filters;

    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { assetTag: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { serialNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const privilegedRoles = ["SUPER_ADMIN", "IT", "HR", "CHRO", "CEO", "CTO"];
    if (!privilegedRoles.includes(role)) {
      if (role === "MANAGER" || role === "TEAM_LEAD") {
        where.currentHolder = {
          OR: [
            { id: userId },
            { reportingManagerId: userId }
          ]
        };
      } else {
        where.currentHolderId = userId;
      }
    }

    const [assets, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        include: {
          currentHolder: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              department: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.asset.count({ where }),
    ]);

    return { assets, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.asset.findUnique({
      where: { id },
      include: {
        currentHolder: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
          },
        },
        assignments: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                department: true,
              },
            },
          },
          orderBy: { assignedAt: "desc" },
          take: 10,
        },
      },
    });
  }

  async create(dto: CreateAssetDto): Promise<any> {
    return this.prisma.asset.create({
      data: {
        assetTag: dto.assetTag,
        name: dto.name,
        category: dto.category,
        brand: dto.brand,
        model: dto.model,
        serialNumber: dto.serialNumber,
        purchaseCost: dto.purchaseCost,
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,
        notes: dto.notes,
        status: dto.status ?? AssetStatus.AVAILABLE,
      },
    });
  }

  async update(id: string, dto: UpdateAssetDto): Promise<any> {
    return this.prisma.asset.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.category && { category: dto.category }),
        ...(dto.brand !== undefined && { brand: dto.brand }),
        ...(dto.model !== undefined && { model: dto.model }),
        ...(dto.serialNumber !== undefined && { serialNumber: dto.serialNumber }),
        ...(dto.purchaseCost !== undefined && { purchaseCost: dto.purchaseCost }),
        ...(dto.purchaseDate && { purchaseDate: new Date(dto.purchaseDate) }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.status && { status: dto.status }),
      },
    });
  }

  async delete(id: string): Promise<any> {
    return this.prisma.$transaction([
      this.prisma.assetAssignment.deleteMany({ where: { assetId: id } }),
      this.prisma.asset.delete({ where: { id } }),
    ]);
  }

  // ─── Assignment ────────────────────────────────────────────────────────────

  async assign(assetId: string, employeeIdentifier: string, assignedByIdentifier: string, notes?: string) {
    // Resolve the target employee
    const employee = await this.prisma.employee.findFirst({
      where: {
        OR: [
          { id: employeeIdentifier },
          { employeeId: employeeIdentifier }
        ]
      }
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeIdentifier} not found`);
    }

    // Resolve the assigner (just in case they have a human-readable ID too)
    const assigner = await this.prisma.employee.findFirst({
      where: {
        OR: [
          { id: assignedByIdentifier },
          { employeeId: assignedByIdentifier }
        ]
      }
    });

    if (!assigner) {
      throw new NotFoundException(`Assigner with ID ${assignedByIdentifier} not found`);
    }

    const [assignment] = await this.prisma.$transaction([
      this.prisma.assetAssignment.create({
        data: {
          assetId,
          employeeId: employee.id,
          assignedById: assigner.id,
          notes,
        },
      }),
      this.prisma.asset.update({
        where: { id: assetId },
        data: { status: AssetStatus.ASSIGNED, currentHolderId: employee.id },
      }),
    ]);
    return assignment;
  }

  async returnAsset(assetId: string, returnedCondition?: string) {
    const latestAssignment = await this.prisma.assetAssignment.findFirst({
      where: { assetId, returnedAt: null },
      orderBy: { assignedAt: "desc" },
    });

    if (!latestAssignment) return null;

    const [assignment] = await this.prisma.$transaction([
      this.prisma.assetAssignment.update({
        where: { id: latestAssignment.id },
        data: { returnedAt: new Date(), returnedCondition },
      }),
      this.prisma.asset.update({
        where: { id: assetId },
        data: { status: AssetStatus.AVAILABLE, currentHolderId: null },
      }),
    ]);
    return assignment;
  }

  // ─── Asset Requests (via WorkflowInstance) ─────────────────────────────────

  async findRequests(filters: { status?: string; employeeId?: string }): Promise<any> {
    const where: any = {
      workflow: { type: "ASSET_REQUEST" },
    };
    if (filters.status) where.status = filters.status;
    if (filters.employeeId) where.initiatedById = filters.employeeId;

    return this.prisma.workflowInstance.findMany({
      where,
      include: {
        initiatedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
          },
        },
        workflow: { select: { id: true, name: true, type: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }
  // ─── KPI Queries (existing, unchanged) ────────────────────────────────────

  async getSummaryKPIs(): Promise<any> {
    const totalAssetsCount = await this.prisma.asset.count();

    const statusCounts = await this.prisma.asset.groupBy({
      by: ["status"],
      _count: { _all: true },
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
      where: { status: { notIn: [AssetStatus.RETIRED, AssetStatus.REPLACED] } },
    });

    const assignedAssetsCount = countsByStatus[AssetStatus.ASSIGNED] || 0;
    const allocationRate =
      activeAssetsCount > 0
        ? Number(((assignedAssetsCount / activeAssetsCount) * 100).toFixed(2))
        : 0;

    const pendingWorkflowRequests = await this.prisma.workflowInstance.count({
      where: { status: "PENDING", workflow: { type: "ASSET_REQUEST" } },
    });

    return { totalAssetsCount, allocationRate, countsByStatus, pendingWorkflowRequests };
  }

  async getCategoryBreakdown(): Promise<any> {
    const assets = await this.prisma.asset.findMany({
      select: { category: true, status: true },
    });

    const categories = Object.values(AssetCategory);
    return categories.map((cat) => {
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
      const utilizationRate =
        activeCount > 0 ? Number(((assignedCount / activeCount) * 100).toFixed(2)) : 0;
      return { category: cat, totalCount, assignedCount, availableCount, damagedCount, lostCount, retiredCount, utilizationRate };
    });
  }

  async getFinancialSummary(): Promise<any> {
    const assets = await this.prisma.asset.findMany({
      select: { category: true, status: true, purchaseCost: true },
    });

    let totalInvestment = 0;
    let activeValuation = 0;
    const lossValuation: Record<string, number> = {
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
      if (
        asset.status !== AssetStatus.RETIRED &&
        asset.status !== AssetStatus.REPLACED &&
        asset.status !== AssetStatus.LOST &&
        asset.status !== AssetStatus.DAMAGED
      ) {
        activeValuation += cost;
      }
      if (([AssetStatus.LOST, AssetStatus.DAMAGED, AssetStatus.RETIRED] as AssetStatus[]).includes(asset.status)) {
        lossValuation[asset.status] = (lossValuation[asset.status] || 0) + cost;
      }
      if (expenditureByCategory[asset.category] !== undefined) {
        expenditureByCategory[asset.category] += cost;
      }
    });

    return {
      currency: "INR",
      totalInvestment: Number(totalInvestment.toFixed(2)),
      activeValuation: Number(activeValuation.toFixed(2)),
      lossValuation: {
        LOST: Number((lossValuation[AssetStatus.LOST] || 0).toFixed(2)),
        DAMAGED: Number((lossValuation[AssetStatus.DAMAGED] || 0).toFixed(2)),
        RETIRED: Number((lossValuation[AssetStatus.RETIRED] || 0).toFixed(2)),
      },
      expenditureByCategory: Object.keys(expenditureByCategory).reduce((acc, key) => {
        acc[key] = Number(expenditureByCategory[key as AssetCategory].toFixed(2));
        return acc;
      }, {} as Record<string, number>),
    };
  }

  async getLifecycleTrends(
    startDate: Date,
    endDate: Date,
    interval: "MONTH" | "QUARTER"
  ): Promise<any> {
    const assets = await this.prisma.asset.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      select: { createdAt: true, status: true, updatedAt: true },
    });

    const assignments = await this.prisma.assetAssignment.findMany({
      where: {
        OR: [
          { assignedAt: { gte: startDate, lte: endDate } },
          { returnedAt: { gte: startDate, lte: endDate } },
        ],
      },
      select: { assignedAt: true, returnedAt: true },
    });

    const getBucketKey = (date: Date): string => {
      const year = date.getFullYear();
      if (interval === "QUARTER") {
        return `${year}-Q${Math.floor(date.getMonth() / 3) + 1}`;
      }
      return `${year}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    };

    const buckets: Record<string, any> = {};
    const current = new Date(startDate);
    while (current <= endDate) {
      const key = getBucketKey(current);
      if (!buckets[key]) {
        buckets[key] = { period: key, assetsProcured: 0, assignmentsCreated: 0, returnsProcessed: 0, reportedDamaged: 0, reportedLost: 0 };
      }
      current.setMonth(current.getMonth() + (interval === "QUARTER" ? 3 : 1));
    }

    assets.forEach((asset) => {
      const key = getBucketKey(asset.createdAt);
      if (buckets[key]) buckets[key].assetsProcured += 1;
      if (asset.status === AssetStatus.DAMAGED) {
        const k = getBucketKey(asset.updatedAt);
        if (buckets[k] && asset.updatedAt >= startDate && asset.updatedAt <= endDate) buckets[k].reportedDamaged += 1;
      } else if (asset.status === AssetStatus.LOST) {
        const k = getBucketKey(asset.updatedAt);
        if (buckets[k] && asset.updatedAt >= startDate && asset.updatedAt <= endDate) buckets[k].reportedLost += 1;
      }
    });

    assignments.forEach((assign) => {
      const ak = getBucketKey(assign.assignedAt);
      if (buckets[ak] && assign.assignedAt >= startDate && assign.assignedAt <= endDate) buckets[ak].assignmentsCreated += 1;
      if (assign.returnedAt) {
        const rk = getBucketKey(assign.returnedAt);
        if (buckets[rk] && assign.returnedAt >= startDate && assign.returnedAt <= endDate) buckets[rk].returnsProcessed += 1;
      }
    });

    return Object.values(buckets).sort((a, b) => a.period.localeCompare(b.period));
  }

  async getCtoAssets(): Promise<any> {
    const assetAssignments = await this.prisma.assetAssignment.findMany({
      where: { returnedAt: null },
      include: { employee: true, asset: true },
      orderBy: { assignedAt: "desc" },
    });

    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    let dueForRefresh = 0;
    const assets = assetAssignments.map((a) => {
      const isRefreshDue =
        a.asset.createdAt < threeYearsAgo &&
        ["LAPTOP", "DESKTOP", "MONITOR", "MOBILE_DEVICE"].includes(a.asset.category);
      if (isRefreshDue) dueForRefresh++;
      return {
        id: a.id,
        assetName: a.asset.brand || "Asset",
        category: ["LAPTOP", "DESKTOP"].includes(a.asset.category)
          ? "Laptop"
          : a.asset.category === "MONITOR"
          ? "Monitor"
          : ["SOFTWARE_LICENCE", "CLOUD_ACCOUNT"].includes(a.asset.category)
          ? "Software"
          : "Accessory",
        assignedToName: `${a.employee.firstName} ${a.employee.lastName}`,
        assignedToInitials: `${a.employee.firstName.charAt(0)}${a.employee.lastName.charAt(0)}`,
        assignedDate: a.assignedAt.toISOString().split("T")[0],
        status: isRefreshDue ? "Due for refresh" : "Active",
      };
    });

    const totalDevices = assetAssignments.filter((a) =>
      ["LAPTOP", "DESKTOP", "MONITOR", "MOBILE_DEVICE"].includes(a.asset.category)
    ).length;
    const softwareLicenses = assetAssignments.filter((a) =>
      ["SOFTWARE_LICENCE", "CLOUD_ACCOUNT"].includes(a.asset.category)
    ).length;

    return { metrics: { totalDevices, softwareLicenses, dueForRefresh }, assets, totalCount: assets.length };
  }

  async getRecentActivity(limit = 10, employeeId?: string): Promise<any[]> {
    // 1. Fetch recent assignments
    const assignments = await this.prisma.assetAssignment.findMany({
      where: employeeId ? { employeeId } : undefined,
      take: limit,
      orderBy: { assignedAt: "desc" },
      include: {
        asset: true,
        employee: true,
        assignedBy: true,
      },
    });

    // 2. Fetch recent returns
    const returns = await this.prisma.assetAssignment.findMany({
      where: employeeId ? { returnedAt: { not: null }, employeeId } : { returnedAt: { not: null } },
      take: limit,
      orderBy: { returnedAt: "desc" },
      include: {
        asset: true,
        employee: true,
        assignedBy: true, // We'll just use employee for who returned it in this context
      },
    });

    // 3. Fetch recent workflow approvals (Asset Requests)
    const approvals = await this.prisma.workflowInstance.findMany({
      where: {
        workflow: { type: "ASSET_REQUEST" },
        status: { in: ["PENDING", "APPROVED", "REJECTED"] },
        initiatedById: employeeId ? employeeId : undefined,
      },
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        initiatedBy: true,
        workflow: true,
      },
    });

    const activity = [];

    // Map Assignments
    for (const a of assignments) {
      activity.push({
        id: `assign-${a.id}`,
        action: "ASSIGNED",
        assetName: a.asset.name,
        assetTag: a.asset.assetTag,
        performedBy: a.assignedBy ? `${a.assignedBy.firstName} ${a.assignedBy.lastName}` : "System",
        performedByAvatar: a.assignedBy ? `https://api.dicebear.com/7.x/notionists/svg?seed=${a.assignedBy.firstName}` : "",
        targetEmployee: a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : null,
        timestamp: a.assignedAt.toISOString(),
      });
    }

    // Map Returns
    for (const r of returns) {
      activity.push({
        id: `return-${r.id}`,
        action: "RETURNED",
        assetName: r.asset.name,
        assetTag: r.asset.assetTag,
        performedBy: r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : "System",
        performedByAvatar: r.employee ? `https://api.dicebear.com/7.x/notionists/svg?seed=${r.employee.firstName}` : "",
        targetEmployee: null,
        timestamp: r.returnedAt!.toISOString(),
      });
    }

    // Map Requests (Pending/Approved/Rejected)
    for (const app of approvals) {
      activity.push({
        id: `app-${app.id}`,
        action: app.status === "PENDING" ? "REQUESTED" : app.status === "APPROVED" ? "APPROVED" : "REJECTED",
        assetName: `Asset Request`,
        assetTag: `REQ-${app.id.slice(-5).toUpperCase()}`,
        performedBy: app.status === "PENDING" 
          ? (app.initiatedBy ? `${app.initiatedBy.firstName} ${app.initiatedBy.lastName}` : "System") 
          : "HR / IT Admin",
        performedByAvatar: app.status === "PENDING" && app.initiatedBy 
          ? `https://api.dicebear.com/7.x/notionists/svg?seed=${app.initiatedBy.firstName}` 
          : "",
        targetEmployee: app.initiatedBy ? `${app.initiatedBy.firstName} ${app.initiatedBy.lastName}` : null,
        timestamp: app.status === "PENDING" ? app.createdAt.toISOString() : app.updatedAt.toISOString(),
      });
    }

    // Sort combined by timestamp descending and take limit
    activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return activity.slice(0, limit);
  }
}
